import React from "react";
import { Search, Mail, Bell, ShieldCheck, Store, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard", subtitle: "Real-time arena control & winners hub" },
  "/booths": { title: "DevFest Booths & Zones", subtitle: "Manage physical booths and dedicated challenges" },
  "/create-quiz": { title: "Create Quiz & Markdown Questions", subtitle: "Craft interactive challenges with rich markdown" },
  "/quizzes": { title: "Quiz Management", subtitle: "View, edit, and publish live track challenges" },
  "/participants": { title: "Participants & Leaderboard", subtitle: "Monitor live attendees and team submissions" },
  "/managers": { title: "Managers & RBAC Permissions", subtitle: "Create manager accounts with scoped access" },
  "/settings": { title: "Settings", subtitle: "Manage platform preferences & API keys" },
};

export default function Header() {
  const { pathname } = useLocation();
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const page = PAGE_TITLES[pathname] || { title: "Dashboard", subtitle: "" };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#f8fafc] border-b border-slate-100 shrink-0 gap-6">

      {/* Left — Page title or greeting */}
      <div className="flex-1 min-w-0">
        {isDashboard ? (
          <div>
            <h2 className="text-[17px] font-black text-slate-800 leading-tight truncate flex items-center gap-2">
              <span>Welcome, {currentUser?.name || "Admin"}!</span>
            </h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              {isSuperAdmin 
                ? "DevFest Ranchi 2026 Master Admin Control Center" 
                : `Managing ${currentUser?.assignedBoothName || "Booth Arena"}`}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-[17px] font-black text-slate-800 leading-tight truncate">
              {page.title}
            </h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5 truncate">
              {page.subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Center — Search bar */}
      <div className="relative w-64 xl:w-80 shrink-0 hidden md:block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search quizzes, booths, attendees…"
          className="w-full pl-10 pr-4 py-2 bg-white text-[13px] text-slate-700 placeholder-slate-400 rounded-full border border-slate-200 outline-none transition-all duration-200 focus:border-brand-primary focus:ring-2 focus:ring-indigo-100 font-medium"
        />
      </div>

      {/* Right — Role Badge, Profile & Sign Out */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 bg-white">
          {isSuperAdmin ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-indigo-950">Super Admin</span>
            </>
          ) : (
            <>
              <Store className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-purple-950 truncate max-w-[140px]">{currentUser?.assignedBoothName || "Booth Mgr"}</span>
            </>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (isSuperAdmin ? "SA" : "BM")}
          </div>

          <div className="hidden lg:block text-left">
            <h4 className="text-[12px] font-bold text-slate-800 leading-tight">
              {currentUser?.name || "Admin"}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono leading-tight truncate max-w-[120px]">
              {currentUser?.email || ""}
            </p>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
