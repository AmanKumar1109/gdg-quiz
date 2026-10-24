import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Sparkles } from "lucide-react";
import { getStoredQuizzes, getStoredBooths, fetchQuizzesFromFirestore } from "../data/quizStore";
import gsap from "gsap";

export default function Statistics() {
  const circleRef = useRef(null);
  const barsRef = useRef([]);
  const textRef = useRef(null);

  const [quizzes, setQuizzes] = useState(getStoredQuizzes());

  useEffect(() => {
    fetchQuizzesFromFirestore().then(setQuizzes).catch(() => {});
  }, []);

  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter(q => q.status === "LIVE").length;
  const progressRatio = totalQuizzes > 0 ? activeQuizzes / totalQuizzes : 0;
  const percentage = Math.round(progressRatio * 100);

  // Circle calculations
  const radius = 42;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - progressRatio * circumference;

  useEffect(() => {
    // 1. Animate SVG circle progress draw-in
    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset: targetOffset, duration: 1.2, ease: "power2.out" }
    );

    // 2. Animate bar chart heights from 0 to full
    barsRef.current.forEach((bar) => {
      if (bar) {
        const targetHeight = bar.getAttribute("data-height");
        gsap.fromTo(
          bar,
          { height: "0%" },
          { height: targetHeight, duration: 1, delay: 0.2, ease: "elastic.out(1, 0.75)" }
        );
      }
    });

    // 3. Greeting animation
    gsap.fromTo(
      textRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
  }, [percentage, targetOffset]);

  const aiCount = quizzes.filter(q => q.track?.includes("AI")).length;
  const webCount = quizzes.filter(q => q.track?.includes("Web")).length;
  const androidCount = quizzes.filter(q => q.track?.includes("Android")).length;

  const maxVal = Math.max(aiCount, webCount, androidCount, 1);
  const h1 = `${Math.round((aiCount / maxVal) * 85) || 15}%`;
  const h2 = `${Math.round((webCount / maxVal) * 85) || 15}%`;
  const h3 = `${Math.round((androidCount / maxVal) * 85) || 15}%`;

  return (
    <div className="bg-white border border-slate-100/80 rounded-[24px] p-6 shadow-sm flex flex-col items-center select-none relative">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Arena Statistics</h3>
        <span className="text-[10px] font-bold text-slate-400">Live</span>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
        {/* SVG Circle Progress */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#eff0fe"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            ref={circleRef}
            cx="48"
            cy="48"
            r={radius}
            stroke="var(--color-brand-primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Circular Avatar Center */}
        <div className="absolute w-[72px] h-[72px] rounded-full overflow-hidden border border-slate-100 flex items-center justify-center bg-indigo-50">
          <Sparkles className="w-8 h-8 text-brand-primary" />
        </div>

        {/* Percentage Badge */}
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-brand-primary text-white text-[9px] font-black tracking-tight">
          {percentage}% Live
        </span>
      </div>

      {/* Greeting info */}
      <div ref={textRef} className="text-center mb-6">
        <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
          DevFest Ranchi 2026
        </h4>
        <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
          {activeQuizzes} of {totalQuizzes} challenges currently active
        </p>
      </div>

      {/* Bar Chart Track Distribution Section */}
      <div className="w-full bg-[#f8fafc]/60 border border-slate-100/50 rounded-2xl p-4 flex flex-col">
        <div className="relative flex-1 flex flex-col justify-between h-20 mb-2">
          {/* Horizontal dotted grid lines */}
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 w-full" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-100 w-full" />
          <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-slate-100 w-full" />

          {/* Grid items and label rows */}
          <div className="flex h-full items-end justify-around relative z-10 px-4">
            {/* Bar 1: AI */}
            <div className="w-8 flex flex-col justify-end items-center h-full">
              <div
                ref={(el) => (barsRef.current[0] = el)}
                data-height={h1}
                className="w-4.5 bg-brand-primary-light hover:bg-brand-primary/40 rounded-t-md transition-colors duration-150"
                style={{ height: h1 }}
              />
            </div>
            {/* Bar 2: Web */}
            <div className="w-8 flex flex-col justify-end items-center h-full">
              <div
                ref={(el) => (barsRef.current[1] = el)}
                data-height={h2}
                className="w-4.5 bg-brand-primary-light hover:bg-brand-primary/40 rounded-t-md transition-colors duration-150"
                style={{ height: h2 }}
              />
            </div>
            {/* Bar 3: Android */}
            <div className="w-8 flex flex-col justify-end items-center h-full">
              <div
                ref={(el) => (barsRef.current[2] = el)}
                data-height={h3}
                className="w-4.5 bg-brand-primary hover:bg-brand-primary/90 rounded-t-md transition-colors duration-150"
                style={{ height: h3 }}
              />
            </div>
          </div>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-around text-[9px] font-bold text-slate-400 border-t border-slate-100 pt-1.5 px-2">
          <span>AI/ML</span>
          <span>Web</span>
          <span>Android</span>
        </div>
      </div>
    </div>
  );
}
