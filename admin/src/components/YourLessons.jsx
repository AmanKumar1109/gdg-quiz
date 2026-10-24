import React, { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";

export default function YourLessons() {
  const rowRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      rowRef.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">Your Lesson</h3>
        <button 
          onClick={() => alert("Redirecting to all lessons...")}
          className="text-xs font-bold text-brand-primary hover:underline transition-colors duration-150 cursor-pointer"
        >
          See all
        </button>
      </div>

      {/* Table Structure */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100/60 pb-3">
              <th className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-3">Mentor</th>
              <th className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-3">Type</th>
              <th className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-3">Desc</th>
              <th className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              ref={rowRef} 
              className="group hover:bg-slate-50/40 transition-colors duration-150"
            >
              {/* Mentor */}
              <td className="py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-xs shrink-0 border border-slate-100">
                  PS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">Padhang Satrio</h4>
                  <span className="text-[9px] text-slate-400">2/16/2004</span>
                </div>
              </td>

              {/* Type Badge */}
              <td className="py-3.5">
                <span className="inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 bg-indigo-50/40 text-brand-primary">
                  UI/UX Design
                </span>
              </td>

              {/* Description */}
              <td className="py-3.5">
                <p className="text-xs text-slate-600 font-medium max-w-xs truncate">
                  Understand Of UI/UX Design fundamentals and typography
                </p>
              </td>

              {/* Action Trigger */}
              <td className="py-3.5 text-right">
                <button className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:shadow-sm transition-all duration-200 cursor-pointer group-hover:scale-105">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
