import React, { useEffect, useRef, useState } from "react";
import { Plus, UserPlus, UserCheck } from "lucide-react";
import gsap from "gsap";

export default function MentorsList() {
  const listRef = useRef(null);
  const [following, setFollowing] = useState([false, false, true]);

  useEffect(() => {
    // Staggered list fade-in
    const children = listRef.current.children;
    gsap.fromTo(
      children,
      { opacity: 0, x: 10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const mentors = [
    { name: "Padhang Satrio", role: "Mentor", initial: "PS", bgColor: "bg-amber-100 text-amber-700" },
    { name: "Zakir Horizontal", role: "Mentor", initial: "ZH", bgColor: "bg-rose-100 text-rose-700" },
    { name: "Leonardo Samsul", role: "Mentor", initial: "LS", bgColor: "bg-indigo-100 text-indigo-700" },
  ];

  const handleFollowToggle = (idx) => {
    const updated = [...following];
    updated[idx] = !updated[idx];
    setFollowing(updated);
  };

  return (
    <div className="bg-white border border-slate-100/80 rounded-[24px] p-6 shadow-sm flex flex-col select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Your mentor</h3>
        <button 
          onClick={() => alert("Add mentor dialogue...")}
          className="w-7 h-7 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div ref={listRef} className="space-y-4 mb-5">
        {mentors.map((mentor, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full ${mentor.bgColor} flex items-center justify-center font-bold text-xs shrink-0 border border-slate-100`}>
                {mentor.initial}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-700 truncate leading-tight">{mentor.name}</h4>
                <p className="text-[9px] text-slate-400 font-medium">Mentor</p>
              </div>
            </div>

            {/* Follow/Following Button */}
            <button
              onClick={() => handleFollowToggle(idx)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer shrink-0 border border-slate-100 ${
                following[idx]
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/60"
                  : "bg-white hover:bg-indigo-50/50 text-brand-primary hover:border-indigo-150"
              }`}
            >
              {following[idx] ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* See All Button */}
      <button 
        onClick={() => alert("Mentors list expanding...")}
        className="w-full py-2.5 bg-brand-primary-light hover:bg-indigo-100 text-brand-primary text-xs font-bold rounded-xl transition-colors duration-150 text-center cursor-pointer"
      >
        See All
      </button>
    </div>
  );
}
