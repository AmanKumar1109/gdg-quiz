import React, { useState, useEffect } from "react";
import { 
  getStoredQuizzes, 
  getStoredParticipants, 
  fetchQuizzesFromFirestore, 
  fetchParticipantsFromFirestore 
} from "../data/quizStore";
import { 
  Trophy, 
  Users, 
  Clock, 
  Sparkles, 
  Store, 
  Award, 
  Medal, 
  CheckCircle2, 
  Play, 
  Square, 
  PauseCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";

export default function QuizWinnersAndEnrollmentCard({ scopedBoothId, isManager }) {
  const [quizzes, setQuizzes] = useState(getStoredQuizzes());
  const [participants, setParticipants] = useState(getStoredParticipants());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchQuizzesFromFirestore(),
      fetchParticipantsFromFirestore()
    ]).then(([qList, pList]) => {
      setQuizzes(qList);
      setParticipants(pList);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0s";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Filter quizzes if manager
  const displayedQuizzes = quizzes.filter(q => {
    if (isManager && scopedBoothId) {
      return q.boothId === scopedBoothId || (q.boothName && q.boothName.toLowerCase().includes(scopedBoothId.toLowerCase()));
    }
    return true;
  });

  // Calculate winner and enrollments for each quiz
  const quizAnalytics = displayedQuizzes.map(quiz => {
    // Participants who have completed or joined this quiz
    const quizParticipants = participants.filter(p => {
      if (p.completedQuizzes && p.completedQuizzes[quiz.id]) return true;
      if (p.joinedQuizzes && Array.isArray(p.joinedQuizzes) && p.joinedQuizzes.includes(quiz.id)) return true;
      return false;
    });

    const completedParticipants = participants.filter(p => 
      p.completedQuizzes && p.completedQuizzes[quiz.id]
    );

    // Find the winner: highest points in this quiz, lowest timeTakenSeconds as tie-breaker
    let winner = null;
    let maxPoints = -1;
    let bestTime = 999999;

    completedParticipants.forEach(p => {
      const record = p.completedQuizzes[quiz.id];
      const pts = Number(record.points ?? record.score) || 0;
      const time = Number(record.timeTakenSeconds) || 999999;

      if (pts > maxPoints || (pts === maxPoints && time < bestTime)) {
        maxPoints = pts;
        bestTime = time;
        winner = {
          name: p.name || p.fullName || "Anonymous Attendee",
          ticketId: p.ticketId || p.id || "N/A",
          email: p.email || "",
          avatar: "1st",
          points: pts,
          timeTakenSeconds: time
        };
      }
    });

    return {
      quiz,
      enrolledCount: Math.max(quiz.participantsCount || 0, quizParticipants.length, completedParticipants.length),
      completedCount: completedParticipants.length,
      winner
    };
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Title & Scope header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {isManager ? "Booth Challenge Intelligence" : "Super Admin Master Hub"}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Individual Quiz Winners & Enrollment Statistics</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Real-time track and booth winners determined by highest points and fastest timing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-[#f8fafc] px-3 py-1.5 rounded-xl border border-slate-200">
            {displayedQuizzes.length} Quizzes Monitored
          </span>
        </div>
      </div>

      {/* Quiz Winners Grid */}
      {quizAnalytics.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 font-medium">
          No challenges available in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizAnalytics.map(({ quiz, enrolledCount, completedCount, winner }) => {
            const isLive = quiz.status === "LIVE";

            return (
              <div 
                key={quiz.id}
                className="bg-[#f8fafc] hover:bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                {/* Quiz Meta */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {quiz.track || "DevFest Challenge"}
                    </span>
                    
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                        Stopped
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-1">
                    {quiz.title}
                  </h4>

                  {quiz.boothName && (
                    <div className="text-[11px] font-bold text-purple-600 flex items-center gap-1 mt-0.5">
                      <Store className="w-3 h-3" />
                      <span>{quiz.boothName}</span>
                    </div>
                  )}

                  {/* Enrollment stats */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-3 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span><strong>{enrolledCount}</strong> Enrolled</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span><strong>{completedCount}</strong> Finished</span>
                    </span>
                  </div>
                </div>

                {/* Winner Card Block */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1 tracking-wider">
                      <Medal className="w-3.5 h-3.5" />
                      Current 1st Place Winner
                    </span>
                    {winner && (
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {winner.ticketId}
                      </span>
                    )}
                  </div>

                  {winner ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 border border-amber-300">
                          <Trophy className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 leading-tight">
                            {winner.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {winner.email}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-amber-600 block leading-tight">
                          +{winner.points} pts
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(winner.timeTakenSeconds)}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-[11px] font-bold text-slate-400 italic">
                      No completed attempts yet. Awaiting first submission!
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
