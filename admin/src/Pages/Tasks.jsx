import React, { useEffect, useRef, useState } from "react";
import { CheckSquare, Calendar, ChevronRight } from "lucide-react";
import gsap from "gsap";

export default function Tasks() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const [taskList, setTaskList] = useState([
    { id: 1, title: "Submit Wireframe Drafts", category: "UI/UX Design", date: "Due Today, 5:00 PM", completed: false },
    { id: 2, title: "Review Flexbox Grid Exercises", category: "Front End", date: "Due Tomorrow", completed: true },
    { id: 3, title: "Draft Brand Voice Guidelines", category: "Branding", date: "June 20", completed: false },
    { id: 4, title: "Complete HTML Semantics Quiz", category: "Front End", date: "June 22", completed: false },
  ]);

  const toggleTask = (id) => {
    setTaskList(
      taskList.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div ref={containerRef} className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
          <p className="text-sm text-slate-400">Manage your homework, course projects, and evaluations</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-primary" />
          Active Assignments
        </h2>
        
        <div className="space-y-3">
          {taskList.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center justify-between p-4 rounded-xl border border-slate-100 cursor-pointer transition-all duration-150 select-none ${
                task.completed ? "bg-slate-50/50 opacity-70" : "hover:border-slate-200 hover:bg-slate-50/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // Controlled via onClick on parent
                  className="w-4.5 h-4.5 text-brand-primary rounded border-slate-300 focus:ring-brand-primary cursor-pointer"
                />
                <div>
                  <h3 className={`text-sm font-semibold text-slate-700 ${task.completed ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-brand-primary/80 uppercase bg-indigo-50 px-1.5 py-0.5 rounded">
                      {task.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.date}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
