import React, { useState, useEffect } from "react";
import { Zap, Clock, UserCheck } from "lucide-react";

export default function LiveSubmissions() {
  const [activities, setActivities] = useState(() => {
    try {
      const raw = localStorage.getItem("devfest_live_submissions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  return (
    <div className="bg-white border border-slate-100/90 rounded-[24px] p-6 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Live Submissions</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Real-time attendee quiz completions</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {activities.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-[#f8fafc] border border-dashed border-slate-200">
          <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">No live submissions yet</p>
          <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
            Attendee activity and scores from booths & track quizzes will stream here live.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {item.user ? item.user.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.user}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.action}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {item.points}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {item.time || "Just now"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
