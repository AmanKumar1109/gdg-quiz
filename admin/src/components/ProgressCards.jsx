import React, { useEffect, useState, useRef } from "react";
import { HelpCircle, Store, Users, ShieldCheck, MoreVertical } from "lucide-react";
import { 
  getStoredQuizzes, 
  getStoredBooths, 
  getStoredParticipants,
  getStoredManagers,
  fetchQuizzesFromFirestore, 
  fetchBoothsFromFirestore,
  fetchParticipantsFromFirestore,
  fetchManagersFromFirestore 
} from "../data/quizStore";
import gsap from "gsap";

export default function ProgressCards() {
  const cardsRef = useRef([]);
  const [quizzes, setQuizzes] = useState(getStoredQuizzes());
  const [booths, setBooths] = useState(getStoredBooths());
  const [participants, setParticipants] = useState(getStoredParticipants());
  const [managers, setManagers] = useState(getStoredManagers());

  useEffect(() => {
    // Staggered entrance animation for cards
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
    );

    // Sync from Firestore
    fetchQuizzesFromFirestore().then(setQuizzes).catch(() => {});
    fetchBoothsFromFirestore().then(setBooths).catch(() => {});
    fetchParticipantsFromFirestore().then(setParticipants).catch(() => {});
    fetchManagersFromFirestore().then(setManagers).catch(() => {});
  }, []);

  const activeQuizzes = quizzes.filter(q => q.status === "LIVE").length;

  const progressData = [
    {
      subtext: `${participants.length} Checked In`,
      title: "Registered Users",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "hover:border-blue-200"
    },
    {
      subtext: `${activeQuizzes} of ${quizzes.length} Live`,
      title: "Arena Quizzes",
      icon: HelpCircle,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "hover:border-indigo-200"
    },
    {
      subtext: `${booths.length} Physical Booths`,
      title: "DevFest Booths",
      icon: Store,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "hover:border-amber-200"
    },
    {
      subtext: `${managers.length} RBAC Assigned`,
      title: "Booth Managers",
      icon: ShieldCheck,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "hover:border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {progressData.map((data, idx) => {
        const Icon = data.icon;
        return (
          <div
            key={idx}
            ref={(el) => (cardsRef.current[idx] = el)}
            className={`bg-white border border-slate-100/90 rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer transition-all duration-200 ${data.borderColor} hover:shadow-md`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl ${data.bgColor} ${data.iconColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">{data.subtext}</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{data.title}</h4>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
