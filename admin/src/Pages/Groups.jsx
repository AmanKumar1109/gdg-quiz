import React, { useEffect, useRef } from "react";
import { Users, Plus, ArrowUpRight } from "lucide-react";
import gsap from "gsap";

export default function Groups() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const groups = [
    { name: "Frontend Pioneers", members: 14, category: "Coding", active: true },
    { name: "UI/UX Case Study Squad", members: 8, category: "Design", active: true },
    { name: "Brand Visionaries", members: 6, category: "Creative", active: false },
  ];

  return (
    <div ref={containerRef} className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Groups</h1>
          <p className="text-sm text-slate-400">Join discussions, pair program, and complete group tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary/95 transition-all duration-150 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase bg-indigo-50 text-brand-primary">
                  {group.category}
                </span>
                {group.active && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Active Now
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-brand-primary transition-colors duration-150">
                {group.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                {group.members} participants
              </p>
            </div>
            
            <button className="mt-6 flex items-center justify-center gap-1 w-full py-2 bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl hover:bg-brand-primary hover:text-white transition-colors duration-150">
              Open Channel
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
