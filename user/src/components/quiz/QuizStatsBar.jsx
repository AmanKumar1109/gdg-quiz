import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { HelpCircle, Users, Trophy, Gift, Zap, Store } from 'lucide-react';

export const QuizStatsBar = () => {
  const { quizzes, booths, leaderboard, isLiveConnected } = useQuiz();

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.totalQuestions || 0), 0);
  const totalAttendees = leaderboard.length > 0 
    ? leaderboard.length 
    : quizzes.reduce((sum, q) => sum + (q.participantsCount || 0), 0);

  const stats = [
    {
      label: 'Live Challenges',
      value: `${quizzes.length}`,
      subtext: 'Beginner, Conference & Advanced',
      color: '#FFE600',
      icon: HelpCircle,
      badge: isLiveConnected ? 'Live Firestore' : 'Live'
    },
    {
      label: 'Active Booths',
      value: `${booths.length}`,
      subtext: 'Physical Sponsor & Community Zones',
      color: '#A855F7',
      icon: Store,
      badge: 'On-Ground'
    },
    {
      label: 'Registered Coders',
      value: `${totalAttendees}`,
      subtext: 'Leaderboard contenders',
      color: '#4285F4',
      icon: Users,
      badge: 'Real-time'
    },
    {
      label: 'Question Bank',
      value: `${totalQuestions} Qs`,
      subtext: 'Interactive Markdown Challenges',
      color: '#34A853',
      icon: Trophy,
      badge: 'Rewards'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 my-8">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border-[2.5px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
          >
            {/* Corner color ribbon */}
            <div
              className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 transform translate-x-6 -translate-y-6 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]"
                style={{ backgroundColor: item.color }}
              >
                <Icon className="w-5 h-5 text-black" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-black bg-white">
                {item.badge}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-black leading-none mb-1">
              {item.value}
            </div>

            <div className="text-xs font-black uppercase tracking-wide text-black/60 mb-0.5">
              {item.label}
            </div>

            <div className="text-[11px] font-bold text-black/40 truncate">
              {item.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
