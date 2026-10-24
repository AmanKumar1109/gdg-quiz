import React, { useEffect, useRef } from "react";
import { Settings as SettingsIcon, Bell, Shield, Eye } from "lucide-react";
import gsap from "gsap";

export default function Settings() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-400">Configure your learning profile and dashboard options</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-6 space-y-8">
        {/* Profile Card settings */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4.5 h-4.5 text-brand-primary" />
            General Profile Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Jason Ranti"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl outline-none focus:bg-white focus:border-brand-primary transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="jason.ranti@coursue.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl outline-none focus:bg-white focus:border-brand-primary transition-all duration-150"
              />
            </div>
          </div>
        </div>

        {/* Notifications and Security */}
        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-brand-primary" />
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4.5 h-4.5 text-brand-primary rounded border-slate-300 focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600">Email notifications for new lessons and mentor updates</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4.5 h-4.5 text-brand-primary rounded border-slate-300 focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600">Popup alerts for direct messages and peer responses</span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="border-t border-slate-100 pt-6 flex justify-end">
          <button
            onClick={() => alert("Settings Saved!")}
            className="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary/95 transition-all duration-150 cursor-pointer shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
