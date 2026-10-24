import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PromoBanner() {
  const buttonRef = useRef(null);
  const sparkle1Ref = useRef(null);
  const sparkle2Ref = useRef(null);

  useEffect(() => {
    // Subtle float animation for the decorative sparkles
    gsap.to([sparkle1Ref.current, sparkle2Ref.current], {
      y: -6,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.4
    });
  }, []);

  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2, ease: "power1.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: "power1.out" });
  };

  return (
    <div className="relative bg-gradient-to-r from-[#6366f1] via-[#5e5ce6] to-[#807df6] rounded-[24px] p-8 text-white overflow-hidden shadow-md shadow-indigo-100/50">
      {/* Background Decorative Sparkles */}
      <div 
        ref={sparkle1Ref} 
        className="absolute right-[15%] top-[25%] text-indigo-200/40 pointer-events-none"
      >
        <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
          <path d="M12 0L15.5 8.5L24 12L15.5 15.5L12 24L8.5 15.5L0 12L8.5 8.5L12 0Z" />
        </svg>
      </div>
      <div 
        ref={sparkle2Ref} 
        className="absolute right-[8%] bottom-[20%] text-indigo-100/20 pointer-events-none"
      >
        <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
          <path d="M12 0L15.5 8.5L24 12L15.5 15.5L12 24L8.5 15.5L0 12L8.5 8.5L12 0Z" />
        </svg>
      </div>
      <div className="absolute right-[28%] bottom-[30%] w-2 h-2 rounded-full bg-white/30 pointer-events-none" />
      <div className="absolute right-[22%] top-[40%] w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-lg">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
          DEVFEST RANCHI 2026 • ARENA ADMIN
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mt-4 mb-6">
          Empower Developers & Launch Live Markdown Technical Quizzes
        </h2>
        <a
          href="/create-quiz"
          ref={buttonRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-full shadow-lg transition-colors duration-150 hover:bg-neutral-900 cursor-pointer"
        >
          <span>Create New Quiz</span>
          <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
            &gt;
          </span>
        </a>
      </div>

    </div>
  );
}
