import React from "react";
import ActiveQuizzesTable from "../components/ActiveQuizzesTable";

export default function QuizzesPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-indigo-50 px-2.5 py-1 rounded-full">
            DevFest 2026 Admin
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            All Quizzes & Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Search, filter, toggle live status, and manage Markdown questions for all tracks.
          </p>
        </div>
      </div>

      <ActiveQuizzesTable />
    </div>
  );
}
