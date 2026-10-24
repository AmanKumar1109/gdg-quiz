import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import gsap from "gsap";

export default function Layout() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Elegant entrance animation for the dashboard shell
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.98, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-white flex overflow-hidden"
    >
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8fafc]">
        {/* Header bar */}
        <Header />

        {/* Content area */}
        <main className="flex-1 overflow-y-scroll min-h-0 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
