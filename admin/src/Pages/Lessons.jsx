import React, { useEffect, useRef } from "react";
import { BookOpen, GraduationCap, Clock, Award } from "lucide-react";
import gsap from "gsap";

export default function Lessons() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const courses = [
    { title: "UI/UX Advanced Masterclass", category: "UI/UX Design", lessons: 8, progress: 25, color: "border-l-indigo-500" },
    { title: "Visual Branding & Identity Systems", category: "Branding", lessons: 8, progress: 37.5, color: "border-l-rose-500" },
    { title: "Modern Front-End Development", category: "Front End", lessons: 12, progress: 50, color: "border-l-sky-500" },
    { title: "Introduction to Motion Graphics", category: "Design", lessons: 10, progress: 0, color: "border-l-emerald-500" },
  ];

  return (
    <div ref={containerRef} className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Lessons</h1>
          <p className="text-sm text-slate-400">Track and jump back into your online training programs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className={`bg-white border-l-4 ${course.color} border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-slate-50 text-slate-500">
                {course.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                {course.lessons} Chapters
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-6 hover:text-brand-primary transition-colors duration-150">
              {course.title}
            </h3>
            
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                <span>Course Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
