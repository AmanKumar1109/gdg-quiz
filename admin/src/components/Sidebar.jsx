import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  HelpCircle,
  Users,
  Settings,
  LogOut,
  Sparkles,
  Store,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function Sidebar() {
  const { currentUser, isSuperAdmin, hasPermission, logout } = useAuth();

  const allMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
    { name: "Booths & Zones", path: "/booths", icon: Store, permission: "booths" },
    { name: "Create Quiz", path: "/create-quiz", icon: PlusCircle, permission: "create-quiz", badge: "Markdown", badgeColor: "#5e5ce6" },
    { name: "All Quizzes", path: "/quizzes", icon: HelpCircle, permission: "quizzes" },
    { name: "Participants", path: "/participants", icon: Users, permission: "participants", badge: "Live", badgePulse: true },
    { name: "Managers (RBAC)", path: "/managers", icon: ShieldCheck, permission: "managers", superAdminOnly: true, badge: "Master", badgeColor: "#7c3aed" },
  ];

  // Filter items based on user's assigned permissions and role
  const visibleMenuItems = allMenuItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return hasPermission(item.permission);
  });

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full py-6 select-none shrink-0">
      
      {/* Brand Header */}
      <div className="px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-800 block leading-none">
              DevQuiz
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              DevFest Ranchi 2026
            </span>
          </div>
        </div>
      </div>

      {/* Logged in User Pill */}
      {currentUser && (
        <div className="mx-4 mb-4 p-2.5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (isSuperAdmin ? "SA" : "BM")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-slate-900 truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] font-bold text-indigo-600 truncate flex items-center gap-1">
              <span>{isSuperAdmin ? "Super Admin" : (currentUser.assignedBoothName || "Booth Manager")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-7 overflow-y-auto">
        <div>
          <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {isSuperAdmin ? "Master Controls" : "Booth Controls"}
          </span>
          <nav className="mt-2 space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group ${
                      isActive
                        ? "text-brand-primary bg-indigo-50/60"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-brand-primary" />
                      )}
                      <Icon
                        className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                          isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full text-white leading-none flex items-center gap-1 ${
                            item.badgePulse ? "bg-emerald-500" : ""
                          }`}
                          style={
                            !item.badgePulse && !item.badgeColor
                              ? { background: "linear-gradient(135deg, #5e5ce6, #807df6)" }
                              : item.badgeColor
                              ? { background: item.badgeColor }
                              : {}
                          }
                        >
                          {item.badgePulse && <span className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System Settings & Logout */}
        <div>
          <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Account
          </span>
          <nav className="mt-2 space-y-1">
            {hasPermission("settings") && (
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group ${
                    isActive
                      ? "text-brand-primary bg-indigo-50/60"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-brand-primary" />
                    )}
                    <Settings
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span>Settings</span>
                  </>
                )}
              </NavLink>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all duration-200 group text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
