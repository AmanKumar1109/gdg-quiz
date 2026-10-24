import React, { useEffect, useRef } from "react";
import { Mail, Send, Trash2, ShieldAlert } from "lucide-react";
import gsap from "gsap";

export default function Inbox() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const messages = [
    { id: 1, sender: "Leonardo Samsul", subject: "Reviewing your CSS layouts", time: "10:25 AM", content: "Great progress on the layouts! Let's review the final flex grids in our next session.", unread: true },
    { id: 2, sender: "Bayu Salto", subject: "Branding materials feedback", time: "Yesterday", content: "The logos are looking crisp. Let's make sure the color scheme scales well on darker cards.", unread: false },
    { id: 3, sender: "Padhang Satrio", subject: "New course materials released", time: "June 15", content: "I have uploaded the new lessons for the UI/UX workshop. Please check them out.", unread: false },
  ];

  return (
    <div ref={containerRef} className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inbox</h1>
          <p className="text-sm text-slate-400">Keep in touch with your course mentors and friends</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary/95 transition-all duration-150 cursor-pointer shadow-sm">
          <Send className="w-4 h-4" />
          Compose
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex gap-4 text-xs font-semibold text-slate-500">
          <button className="text-brand-primary">All Messages</button>
          <button className="hover:text-slate-800">Unread</button>
          <button className="hover:text-slate-800">Archived</button>
        </div>
        <div className="divide-y divide-slate-100">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer relative ${
                msg.unread ? "bg-indigo-50/10" : ""
              }`}
            >
              {msg.unread && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary" />
              )}
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-brand-primary flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-sm ${msg.unread ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>
                    {msg.sender}
                  </h3>
                  <span className="text-xs text-slate-400">{msg.time}</span>
                </div>
                <h4 className={`text-xs mb-1 ${msg.unread ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                  {msg.subject}
                </h4>
                <p className="text-xs text-slate-400 truncate">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
