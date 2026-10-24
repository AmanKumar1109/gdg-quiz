import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Phone, Video, MoreHorizontal, Check, CheckCheck } from "lucide-react";
import gsap from "gsap";

// Pre-seeded dummy conversations per friend
const SEED_MESSAGES = {
  "Bagas Mahpie": [
    { id: 1, role: "them", text: "Hey! Did you check the React assignment?", time: "9:10 AM", read: true },
    { id: 2, role: "me", text: "Yeah, I finished the hooks section. The useEffect part was tricky.", time: "9:12 AM", read: true },
    { id: 3, role: "them", text: "Same! The dependency array always confuses me.", time: "9:13 AM", read: true },
    { id: 4, role: "me", text: "I found a great video on it. Will share later.", time: "9:15 AM", read: true },
    { id: 5, role: "them", text: "That would be super helpful, thanks!", time: "9:16 AM", read: true },
  ],
  "Sir Dandy": [
    { id: 1, role: "them", text: "Did you attend the ML lecture today?", time: "11:00 AM", read: true },
    { id: 2, role: "me", text: "Yes! The gradient descent explanation was really clear.", time: "11:05 AM", read: true },
    { id: 3, role: "them", text: "Agreed. I still need help with backpropagation though.", time: "11:07 AM", read: true },
    { id: 4, role: "me", text: "Let's do a study session this weekend?", time: "11:08 AM", read: true },
    { id: 5, role: "them", text: "Sounds great! Saturday evening works for me.", time: "11:10 AM", read: true },
  ],
  "Jhon Tosan": [
    { id: 1, role: "me", text: "Hey Jhon, you free for the group project meeting?", time: "2:00 PM", read: true },
    { id: 2, role: "them", text: "Yes! When are we planning it?", time: "2:05 PM", read: true },
    { id: 3, role: "me", text: "How about tomorrow at 4 PM?", time: "2:06 PM", read: true },
    { id: 4, role: "them", text: "Works for me. Should I create the meeting link?", time: "2:08 PM", read: true },
    { id: 5, role: "me", text: "Please do! Share it in the group.", time: "2:09 PM", read: true },
    { id: 6, role: "them", text: "Done! Check the group chat.", time: "2:10 PM", read: true },
  ],
};

const AUTO_REPLIES = [
  "That makes sense!",
  "Got it, thanks for sharing.",
  "Sure, let's discuss more.",
  "Interesting! Tell me more.",
  "Sounds good to me.",
  "Absolutely, I agree.",
  "I'll check that out.",
  "Good point!",
  "Let me think about it.",
  "Yeah, I was thinking the same thing.",
];

export default function FriendChat({ friend, onClose }) {
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState(SEED_MESSAGES[friend.name] || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Slide-up entrance
  useEffect(() => {
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)" }
    );
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleClose = () => {
    gsap.to(panelRef.current, {
      opacity: 0, y: 30, scale: 0.96,
      duration: 0.22, ease: "power2.in",
      onComplete: onClose,
    });
  };

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const myMsg = { id: Date.now(), role: "me", text: trimmed, time: now, read: false };
    setMessages((p) => [...p, myMsg]);
    setInput("");
    setIsTyping(true);

    // Auto-reply
    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setIsTyping(false);
      setMessages((p) => [
        ...p.map((m) => (m.id === myMsg.id ? { ...m, read: true } : m)),
        { id: Date.now() + 1, role: "them", text: reply, time: replyTime, read: true },
      ]);
    }, delay);
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-[24px] overflow-hidden select-none"
      style={{
        width: 340,
        height: 500,
        boxShadow: "0 0 0 1px rgba(94,92,230,0.1), 0 8px 24px -4px rgba(94,92,230,0.2), 0 24px 56px -12px rgba(15,23,42,0.25)",
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 py-3.5 flex items-center gap-3 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4a48e0 0%, #6f6cf5 60%, #9b98ff 100%)" }}
      >
        {/* Decorative orb */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Avatar with online ring */}
        <div className="relative shrink-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${friend.avatarColor}`}
          >
            {friend.initial}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
          />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-black text-white leading-tight truncate">{friend.name}</p>
          <p className="text-[11px] text-white/60 font-medium">{isTyping ? "typing..." : "Online"}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 relative z-10">
          <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer">
            <Phone style={{ width: 15, height: 15 }} />
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer">
            <Video style={{ width: 15, height: 15 }} />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-scroll px-4 py-4 flex flex-col gap-3 min-h-0"
        style={{
          background: "radial-gradient(circle at 20px 20px, #e8eaf6 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundColor: "#f9faff",
        }}
      >
        {/* Date chip */}
        <div className="flex justify-center">
          <span className="text-[10px] font-semibold text-slate-400 bg-white/80 px-3 py-1 rounded-full border border-slate-100">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.role === "me";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {/* Avatar for them */}
              {!isMe && (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mr-2 mt-0.5 ${friend.avatarColor}`}>
                  {friend.initial}
                </div>
              )}
              <div className="flex flex-col gap-0.5 max-w-[72%]">
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed font-medium ${
                    isMe
                      ? "rounded-br-sm text-white"
                      : "rounded-bl-sm bg-white border border-slate-100 shadow-sm text-slate-700"
                  }`}
                  style={isMe ? { background: "linear-gradient(135deg, #5e5ce6, #807df6)" } : {}}
                >
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                  {isMe && (
                    msg.read
                      ? <CheckCheck style={{ width: 12, height: 12 }} className="text-brand-primary" />
                      : <Check style={{ width: 12, height: 12 }} className="text-slate-300" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mr-2 mt-0.5 ${friend.avatarColor}`}>
              {friend.initial}
            </div>
            <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ──────────────────────────────────────── */}
      <div className="shrink-0 px-3 py-3 bg-white" style={{ borderTop: "1px solid #f1f3f9" }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-3.5 py-2.5 transition-all duration-200"
          style={{ background: "#f5f6ff", border: "1.5px solid #e2e3f8" }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
            }}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              e.currentTarget.parentElement.style.borderColor = "#5e5ce6";
              e.currentTarget.parentElement.style.background = "#fff";
              e.currentTarget.parentElement.style.boxShadow = "0 0 0 3px rgba(94,92,230,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement.style.borderColor = "#e2e3f8";
              e.currentTarget.parentElement.style.background = "#f5f6ff";
              e.currentTarget.parentElement.style.boxShadow = "none";
            }}
            placeholder={`Message ${friend.name.split(" ")[0]}...`}
            className="flex-1 resize-none text-[13px] text-slate-700 placeholder-slate-400 outline-none bg-transparent leading-relaxed py-0.5 min-h-[22px] font-medium"
            style={{ maxHeight: 80 }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer disabled:opacity-30 hover:scale-105 active:scale-95"
            style={{
              background: input.trim() && !isTyping
                ? "linear-gradient(135deg, #5e5ce6, #807df6)"
                : "#e8eaf6",
              boxShadow: input.trim() && !isTyping ? "0 4px 12px rgba(94,92,230,0.4)" : "none",
            }}
          >
            <Send
              style={{ width: 14, height: 14 }}
              className={input.trim() && !isTyping ? "text-white" : "text-slate-400"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
