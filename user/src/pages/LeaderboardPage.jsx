import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Zap, 
  ArrowRight, 
  Building2, 
  Ticket, 
  UserX,
  Sparkles,
  ShieldCheck,
  Star,
  Clock,
  Timer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NeoButton } from '../components/common/NeoButton';

export const LeaderboardPage = () => {
  const { leaderboard, userProfile, openAuthModal } = useQuiz();

  const displayList = leaderboard;

  // Find user's item in the leaderboard
  const currentUserEntry = displayList.find(p => p.isCurrent);
  const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;

  // Format MM:SS or seconds
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="bg-[#FFE600] px-4 py-1 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider inline-block mb-2 shadow-[2px_2px_0px_0px_#000]">
          OFFICIAL STAGE SCOREBOARD
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-2">
          DevFest Ranchi Leaderboard
        </h1>
        <p className="text-sm font-bold text-black/60">
          Rankings are updated in real time directly from Cloud Firestore. All challenges feed into the <strong>Universal DevFest Grand Prize Pool</strong>!
        </p>
      </div>

      {/* Universal Prize Pool & Tie-Breaker Announcement Banner */}
      <div className="mb-6 p-4 bg-[#FFF8E7] rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center text-xl shrink-0">
            🏆
          </div>
          <div>
            <div className="text-xs font-black uppercase text-black">
              Universal DevFest Prize Pool & Official Tie-Breaker Rule
            </div>
            <div className="text-xs font-semibold text-black/70">
              There is one grand prize pool for the entire event. <strong>If two attendees tie on points, the one who completed challenges in less total time is ranked higher!</strong>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black text-[#FFE600] shadow-[1px_1px_0px_0px_#000]">
          <Timer className="w-3.5 h-3.5" />
          Timing Tie-Breaker Active
        </span>
      </div>

      {/* Logged In User's Live Standing Card */}
      {userProfile.isLoggedIn ? (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#FFE600] via-[#FFDE59] to-[#FFE600] rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_#000] flex items-center justify-between flex-wrap gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000]">
              {userProfile.avatar || '🚀'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black text-[#FFE600] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  YOUR CURRENT STANDING
                </span>
                <span className="text-xs font-mono font-bold text-black/70 flex items-center gap-1">
                  <Ticket className="w-3 h-3 text-[#EA4335]" />
                  {userProfile.ticketId}
                </span>
              </div>
              <h2 className="text-2xl font-black text-black mt-0.5">
                {userProfile.name}
              </h2>
              <span className="text-xs font-bold text-black/75">
                {userProfile.track || 'General Track'} • {Object.keys(userProfile.completedQuizzes || {}).length} Quizzes Completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-black/70 block">Rank</span>
              <div className="text-3xl font-black text-black">
                {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
              </div>
            </div>

            <div className="h-10 w-[2px] bg-black/20"></div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-black/70 block">Total Points</span>
              <div className="text-3xl font-black text-[#EA4335]">
                {(userProfile.totalPoints || 0).toLocaleString()} pts
              </div>
            </div>

            <div className="h-10 w-[2px] bg-black/20 hidden sm:block"></div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-black uppercase text-black/70 block">Total Timing</span>
              <div className="text-2xl font-black text-black flex items-center gap-1">
                <Clock className="w-4 h-4 text-black/60" />
                <span>{formatTime(userProfile.totalTimeSeconds)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Guest prompt to check in with Ticket ID */
        <div className="mb-8 p-6 bg-white rounded-3xl border-3 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">
                Attending DevFest Ranchi 2026?
              </h3>
              <p className="text-xs font-bold text-black/60">
                Log in with your Ticket ID & Email to track your accumulated points, record your quiz timing, and see your name on stage!
              </p>
            </div>
          </div>

          <NeoButton
            variant="yellow"
            size="md"
            onClick={() => openAuthModal({ title: 'Attendee Login', description: 'Enter your DevFest Email and Ticket ID to check your live stage rank!' })}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs font-black"
          >
            Check In with Ticket ID
          </NeoButton>
        </div>
      )}

      {/* Main Scoreboard Table */}
      <div className="bg-white rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-4 sm:p-6 bg-[#111] text-white flex justify-between items-center border-b-2 border-black flex-wrap gap-2">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
            <Trophy className="w-5 h-5 text-[#FFE600]" />
            <span>DevFest Arena Scoreboard ({displayList.length} Attendees)</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Real-time Sync
          </span>
        </div>

        {displayList.length === 0 ? (
          <div className="py-16 px-6 text-center bg-[#FFFDF7]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center text-3xl mb-4 shadow-[3px_3px_0px_0px_#000]">
              🏆
            </div>
            <h3 className="text-2xl font-black text-black mb-2">
              No Participants on Scoreboard Yet
            </h3>
            <p className="text-sm font-bold text-black/60 max-w-md mx-auto mb-6">
              Be the first attendee to check in with your Ticket ID and complete a DevFest quiz challenge to claim the #1 spot on stage!
            </p>
            <Link to="/">
              <NeoButton variant="yellow" size="md">
                Explore Challenges
              </NeoButton>
            </Link>
          </div>
        ) : (
          <div className="divide-y-2 divide-black">
            {displayList.map((item) => (
              <div
                key={item.id || item.rank}
                className={`
                  p-4 sm:p-5 flex items-center justify-between transition-colors
                  ${item.isCurrent ? 'bg-[#FFE600]/30 font-black border-l-8 border-l-[#FFE600]' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Rank Badge */}
                  <span className={`
                    w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center font-black text-sm shrink-0 shadow-[2px_2px_0px_0px_#000]
                    ${item.rank === 1 ? 'bg-[#FFE600]' : item.rank === 2 ? 'bg-[#E5E7EB]' : item.rank === 3 ? 'bg-[#FED7AA]' : 'bg-white'}
                  `}>
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                  </span>

                  <span className="text-2xl sm:text-3xl shrink-0">{item.avatar || '👤'}</span>

                  <div>
                    <div className="text-sm sm:text-base font-black text-black flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.isCurrent && (
                        <span className="bg-[#EA4335] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#000]">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-black/50 flex-wrap">
                      <span>{item.track}</span>
                      {item.ticketNumber && (
                        <span className="font-mono text-black/60">• Ticket: {item.ticketNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Timing (Tie-Breaker Display) */}
                <div className="text-right">
                  <div className="text-base sm:text-xl font-black text-[#EA4335]">
                    {(item.score || 0).toLocaleString()} <span className="text-xs">pts</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-black/70 bg-[#FFFDF7] px-2 py-0.5 rounded border border-black/30">
                      <Clock className="w-3 h-3 text-black/50" />
                      <span>{formatTime(item.totalTimeSeconds)}</span>
                    </span>
                    <span className="text-[10px] font-black uppercase text-black/60 bg-white px-2 py-0.5 rounded border border-black/30 hidden sm:inline-block">
                      {item.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link to="/">
          <NeoButton variant="yellow" size="lg" icon={ArrowRight} iconPosition="right" className="text-base font-black">
            Play More Quizzes to Boost Rank & Timing
          </NeoButton>
        </Link>
      </div>
    </div>
  );
};
