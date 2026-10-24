import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { useStaggerCards, useFloatingBadge } from '../hooks/useGsapAnimations';
import { QuizStatsBar } from '../components/quiz/QuizStatsBar';
import { QuizFilter } from '../components/quiz/QuizFilter';
import { QuizCard } from '../components/quiz/QuizCard';
import { NeoButton } from '../components/common/NeoButton';
import { NeoBadge } from '../components/common/NeoBadge';

import { 
  Sparkles, 
  Flame, 
  Trophy, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  HelpCircle,
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const QuizListPage = () => {
  const { filteredQuizzes, selectedCategory, selectedDifficulty } = useQuiz();
  const cardsContainerRef = useStaggerCards([filteredQuizzes, selectedCategory, selectedDifficulty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Hero Section */}
      <section className="relative text-center py-6 sm:py-12 mb-6">
        
        {/* Centered DevFest Badge */}
        <div className="inline-flex items-center gap-2 mb-4 bg-white border-2 border-black px-4 py-1.5 rounded-full shadow-[3px_3px_0px_0px_#000]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
            DevFest Ranchi 2026 • Quiz Arena
          </span>
        </div>


        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-black tracking-tight leading-[1.08] mb-6 max-w-4xl mx-auto">
          Crack the Code.{' '}
          <span className="relative inline-block">
            <span className="relative z-10 px-3 py-1 bg-[#FFE600] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
              Win the Glory.
            </span>
          </span>
        </h1>

        <p className="text-base sm:text-xl font-bold text-black/75 max-w-2xl mx-auto mb-8 leading-relaxed">
          Step into the GDG Developer arena. Challenge your skills in AI, Web, Android & Cloud, earn instant credentials, and climb the live DevFest leaderboard.
        </p>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <NeoButton
            variant="yellow"
            size="lg"
            onClick={() => {
              const el = document.getElementById('quiz-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            icon={Flame}
            iconPosition="left"
          >
            Explore Quizzes
          </NeoButton>
          <NeoButton
            variant="white"
            size="lg"
            onClick={() => {
              alert('Live Leaderboard updates dynamically in the arena! Tap "Join Quiz" on any card to begin.');
            }}
            icon={Trophy}
            iconPosition="left"
          >
            Rules & Rewards
          </NeoButton>
        </div>

      </section>

      {/* Stats Counter Bar */}
      <QuizStatsBar />

      {/* Main Quizzes Listing Section */}
      <section id="quiz-section" className="pt-8">
        
        {/* Section Title with Neobrutalist Pill badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#D1E9FF] text-[#175CD3] border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-3.5 h-3.5" />
              Arena Quizzes
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              All Listed Quiz Tracks
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-black/60 max-w-sm">
            Select any challenge below and tap <span className="text-black font-extrabold underline">"Join Quiz"</span> to reserve your seat or play in real-time.
          </p>
        </div>

        {/* Filter component */}
        <QuizFilter />

        {/* Cards Grid */}
        {filteredQuizzes.length > 0 ? (
          <div 
            ref={cardsContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
          >
            {filteredQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-3xl border-3 border-black p-8 sm:p-12 text-center shadow-[6px_6px_0px_0px_#000] max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FEF0C7] border-2 border-black flex items-center justify-center text-3xl mb-4">
              🔍
            </div>
            <h3 className="text-2xl font-black text-black mb-2">
              No matching quizzes found
            </h3>
            <p className="text-sm font-bold text-black/60 mb-6">
              Try adjusting your search terms or filter criteria to see all available DevFest challenges.
            </p>
            <NeoButton
              variant="yellow"
              size="md"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reset Filters
            </NeoButton>
          </div>
        )}

      </section>

      {/* DevFest Features & Venue Card matching user's screenshot */}
      <section className="mt-20 pt-10 border-t-3 border-black/20">
        <div className="bg-white rounded-3xl border-3 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="bg-[#FFE600] px-3 py-1 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider inline-block">
                THE OFFICIAL VENUE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-black leading-tight">
                Radisson Blu Hotel, Ranchi
              </h2>
              <p className="text-sm sm:text-base font-bold text-black/70 leading-relaxed">
                Join 1,000+ developers, tech creators, and Google Developer Experts in person on November 2026. Live quiz winners will be invited on main-stage during the closing keynote!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FFFDF7] p-3 rounded-xl border-2 border-black">
                  <div className="text-[10px] font-black uppercase text-black/50">DATE</div>
                  <div className="text-sm font-black text-black">Nov 2026</div>
                </div>
                <div className="bg-[#FFFDF7] p-3 rounded-xl border-2 border-black">
                  <div className="text-[10px] font-black uppercase text-black/50">ENTRY</div>
                  <div className="text-sm font-black text-[#34A853]">Free GDG Pass</div>
                </div>
                <div className="bg-[#FFFDF7] p-3 rounded-xl border-2 border-black col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-black uppercase text-black/50">SWAGS</div>
                  <div className="text-sm font-black text-[#EA4335]">For All Winners</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FFFDF7] rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 font-black text-sm uppercase text-black">
                <CheckCircle2 className="w-5 h-5 text-[#34A853]" />
                How DevFest Quizzes Work
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-black/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFE600] border border-black font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Select any quiz domain above & click "Join Quiz"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white border border-black font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Answer questions against the ticking clock</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#34A853] text-white border border-black font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Score points and claim your GDG certificate & hoodie!</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
