import React from "react";
import Chatbot from "../components/Chatbot";

export default function ChatbotPage() {
  return (
    /* Outer padded shell — gives breathing room from the page edges */
    <div className="h-full p-6 bg-[#f0f2fb] flex items-stretch">
      {/* Floating card with curved edges and layered shadow */}
      <div
        className="flex-1 rounded-[28px] overflow-hidden flex flex-col"
        style={{
          boxShadow:
            "0 0 0 1px rgba(94,92,230,0.08), 0 4px 6px -2px rgba(94,92,230,0.06), 0 20px 48px -12px rgba(94,92,230,0.18)",
        }}
      >
        <Chatbot />
      </div>
    </div>
  );
}
