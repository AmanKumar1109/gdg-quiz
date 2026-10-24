import React, { useEffect, useRef } from "react";
import PromoBanner from "../components/PromoBanner";
import ProgressCards from "../components/ProgressCards";
import QuizWinnersAndEnrollmentCard from "../components/QuizWinnersAndEnrollmentCard";
import ActiveQuizzesTable from "../components/ActiveQuizzesTable";
import Statistics from "../components/Statistics";
import LiveSubmissions from "../components/LiveSubmissions";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";

export default function Dashboard() {
  const containerRef = useRef(null);
  const { currentUser, isManager, isSuperAdmin } = useAuth();

  useEffect(() => {
    // Staggered entry animation for all widgets in the dashboard
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".dashboard-widget");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 h-full bg-[#f8fafc]"
    >
      {/* Left Columns: Core dashboard materials */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <div className="dashboard-widget">
          <PromoBanner />
        </div>

        {/* 4 Overview Statistics Cards (Users, Quizzes, Booths, Managers) */}
        <div className="dashboard-widget">
          <ProgressCards />
        </div>

        {/* Individual Quiz Winners & Enrollment Statistics Hub */}
        <div className="dashboard-widget">
          <QuizWinnersAndEnrollmentCard 
            scopedBoothId={currentUser?.assignedBoothId}
            isManager={isManager}
          />
        </div>

        {/* Active Quizzes Controls Table */}
        <div className="dashboard-widget">
          <ActiveQuizzesTable limit={isManager ? 10 : 6} />
        </div>
      </div>

      {/* Right Column: Statistics, Profile, Live Submissions */}
      <div className="w-full lg:w-[320px] xl:w-[350px] flex flex-col gap-8 shrink-0">
        <div className="dashboard-widget">
          <Statistics />
        </div>
        <div className="dashboard-widget">
          <LiveSubmissions />
        </div>
      </div>
    </div>
  );
}
