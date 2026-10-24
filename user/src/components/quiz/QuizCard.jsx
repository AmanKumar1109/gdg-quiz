import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { NeoButton } from '../common/NeoButton';
import { AnswerKeyModal } from './AnswerKeyModal';
import { 
  Clock, 
  HelpCircle, 
  Users, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  Globe,
  Cpu,
  ShieldCheck,
  Sparkles,
  Ticket,
  AlertCircle,
  Key,
  PauseCircle,
  X
} from 'lucide-react';

export const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();
  const { isQuizJoined, userProfile, openAuthModal } = useQuiz();
  const joined = isQuizJoined(quiz.id);

  const hasAttempted = Boolean(
    userProfile?.isLoggedIn && 
    userProfile?.completedQuizzes && 
    userProfile?.completedQuizzes[quiz.id]
  );
  const userAttemptRecord = hasAttempted ? userProfile.completedQuizzes[quiz.id] : null;

  const [showNotStartedModal, setShowNotStartedModal] = useState(false);
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);

  const isLive = quiz.isLive || quiz.status === 'LIVE';

  const getCategoryIcon = () => {
    const trk = (quiz.track || '').toLowerCase();
    if (trk.includes('beginner') || quiz.category === 'beginner') {
      return <Sparkles className="w-5 h-5 text-black" />;
    }
    if (trk.includes('conference') || quiz.category === 'conference') {
      return <Globe className="w-5 h-5 text-black" />;
    }
    if (trk.includes('advanced') || quiz.category === 'advanced') {
      return <Cpu className="w-5 h-5 text-black" />;
    }
    return <Trophy className="w-5 h-5 text-black" />;
  };

  const handleAction = () => {
    // 1. If already attempted, view locked summary / answer key directly
    if (hasAttempted) {
      navigate(`/quiz/${quiz.id}`);
      return;
    }

    // 2. Check if Quiz has been started by Admin
    if (!isLive) {
      setShowNotStartedModal(true);
      return;
    }

    // 3. Check if user is checked in / logged in with Ticket ID
    if (!userProfile.isLoggedIn) {
      openAuthModal({
        title: `Join ${quiz.title}`,
        description: `Please log in with your DevFest Email and Ticket ID to enroll in this ${quiz.track} challenge and accumulate points!`,
        onSuccess: () => navigate(`/quiz/${quiz.id}`)
      });
    } else {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  return (
    <div className="quiz-card-item flex flex-col justify-between bg-white rounded-3xl border-[2.5px] border-black p-6 sm:p-7 shadow-[4px_4px_0px_0px_#000] hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-y-1 transition-all duration-200">
      
      {/* Top Header: Clean Icon + Status Pill */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]"
              style={{ backgroundColor: quiz.accentColor || '#FFE600' }}
            >
              {getCategoryIcon()}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-black/60 block leading-none">
                {quiz.track}
              </span>
              <span className="text-[11px] font-bold text-black/40">
                {quiz.difficulty} • {quiz.durationMinutes} Mins
              </span>
            </div>
          </div>

          {/* Status badge: COMPLETED vs LIVE vs NOT STARTED */}
          {hasAttempted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed (+{userAttemptRecord?.points || 0} pts)
            </span>
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D1FADF] text-[#027A48] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="w-2 h-2 rounded-full bg-[#027A48] animate-pulse"></span>
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <PauseCircle className="w-3.5 h-3.5 text-amber-800" />
              Not Started Yet
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-black leading-tight tracking-tight mb-2.5">
          {quiz.title}
        </h3>

        {/* Clean, readable description */}
        <p className="text-sm font-semibold text-black/65 leading-relaxed mb-4 line-clamp-2">
          {quiz.description}
        </p>

        {/* Released Answer Key Badge Notification */}
        {quiz.answerKeyReleased && (
          <div className="mb-4 p-2.5 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Key className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Official Answer Key Released!</span>
            </div>
            <button
              onClick={() => setShowAnswerKeyModal(true)}
              className="text-[11px] font-black underline text-amber-950 hover:text-black cursor-pointer"
            >
              View Answers
            </button>
          </div>
        )}
      </div>

      {/* Clean Meta & Action area */}
      <div className="pt-2 border-t-2 border-black/10">
        
        {/* Metadata line */}
        <div className="flex items-center justify-between text-xs font-extrabold text-black/75 mb-5 py-2">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-black/50" />
            <span>{quiz.totalQuestions || (quiz.questions ? quiz.questions.length : 0)} Questions</span>
          </span>
          <span className="text-black/30">•</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#4285F4]" />
            <span>{quiz.participantsCount || 0} Joined</span>
          </span>
          <span className="text-black/30">•</span>
          <span className="flex items-center gap-1 text-[#EA4335] font-black">
            <Trophy className="w-3.5 h-3.5" />
            <span>{quiz.prizePool ? quiz.prizePool.split('+')[0] : 'Swags & Trophy'}</span>
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          {hasAttempted ? (
            <NeoButton
              variant="white"
              size="md"
              className="w-full text-base font-black bg-slate-50 hover:bg-slate-100 text-slate-900 border-2 border-black"
              onClick={handleAction}
              icon={CheckCircle2}
              iconPosition="right"
            >
              Completed ({userAttemptRecord?.points || 0} pts) • 1 Attempt Locked
            </NeoButton>
          ) : joined ? (
            <NeoButton
              variant="green"
              size="md"
              className="w-full text-base font-black"
              onClick={handleAction}
              icon={Sparkles}
              iconPosition="right"
            >
              Enrolled • Enter Arena
            </NeoButton>
          ) : (
            <NeoButton
              variant={isLive ? 'yellow' : 'white'}
              size="md"
              className="w-full text-base font-black"
              onClick={handleAction}
              icon={isLive ? (userProfile.isLoggedIn ? ArrowRight : Ticket) : PauseCircle}
              iconPosition="right"
            >
              {isLive 
                ? (userProfile.isLoggedIn ? 'Join Quiz' : 'Check In & Join Quiz')
                : 'Join Quiz (Not Started Yet)'
              }
            </NeoButton>
          )}

          {/* Quick Answer Key button if released */}
          {quiz.answerKeyReleased && (
            <button
              onClick={() => setShowAnswerKeyModal(true)}
              className="w-full py-2 px-3 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-800" />
              <span>Review Solution Key</span>
            </button>
          )}
        </div>

      </div>

      {/* QUIZ NOT STARTED YET MODAL (Portaled to document.body so it breaks out of card transform/containment) */}
      {showNotStartedModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowNotStartedModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000] z-10 animate-in fade-in zoom-in-95 duration-150 text-center space-y-4">
            
            <button
              onClick={() => setShowNotStartedModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl border-2 border-black bg-white hover:bg-gray-100 flex items-center justify-center transition shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#FFE600] border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
              <PauseCircle className="w-8 h-8 text-black" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border-2 border-black">
                Challenge Pending
              </span>
              <h3 className="text-2xl font-black text-black">
                Quiz Not Started Yet
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-bold text-black/70 leading-relaxed">
              This challenge (<strong>{quiz.title}</strong>) has not been started by the event organizers yet. 
              <br /><br />
              Please wait for the host or speaker to start the quiz from the stage console!
            </p>

            <div className="pt-2">
              <NeoButton
                variant="yellow"
                size="md"
                className="w-full text-sm font-black"
                onClick={() => setShowNotStartedModal(false)}
              >
                Got It, I'll Wait!
              </NeoButton>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ANSWER KEY MODAL */}
      <AnswerKeyModal
        quiz={quiz}
        isOpen={showAnswerKeyModal}
        onClose={() => setShowAnswerKeyModal(false)}
      />

    </div>
  );
};
