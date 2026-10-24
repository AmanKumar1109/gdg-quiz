import React, { useEffect, useRef } from "react";
import ExploreCourses from "../components/ExploreCourses";
import gsap from "gsap";
import { Compass } from "lucide-react";

export default function CoursesPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="p-6 md:p-8 flex flex-col gap-8 bg-[#f8fafc] min-h-full">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-tight">Explore Courses</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Discover world-class fitness &amp; wellness programs — click any card for full details
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <ExploreCourses />
    </div>
  );
}
