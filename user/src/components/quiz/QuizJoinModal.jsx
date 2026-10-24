import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { triggerNeoConfetti } from '../../hooks/useConfetti';
import { NeoButton } from '../common/NeoButton';
import { NeoBadge } from '../common/NeoBadge';
import { 
  X, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles, 
  User, 
  KeyRound,
  ArrowRight
} from 'lucide-react';

// Web Audio API sound effect for joining
const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Audio context not allowed or failed, non-blocking
  }
};

export const QuizJoinModal = () => {
  const { activeQuizForModal, setActiveQuizForModal, joinQuiz, userProfile, setUserProfile } = useQuiz();
  
  if (!activeQuizForModal) return null;

  const { quiz, mode } = activeQuizForModal;
  const [playerName, setPlayerName] = useState(userProfile.name || 'DevFest Hacker');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar || '🤖');
  const [accessCode, setAccessCode] = useState('DEVFEST-2026');
  const [isSuccess, setIsSuccess] = useState(mode === 'play');

  const avatarList = ['🤖', '⚡', '🚀', '💻', '🎯', '🔥', '🕶️', '🐱'];

  const handleConfirmJoin = (e) => {
    e.preventDefault();
    joinQuiz(quiz.id, playerName);
    setUserProfile(prev => ({ ...prev, name: playerName, avatar: selectedAvatar }));
    triggerNeoConfetti();
    playSuccessSound();
    setIsSuccess(true);
  };

  const handleClose = () => {
    setActiveQuizForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#FFFDF7] rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_#000] overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colored band */}
        <div 
          className="h-3 w-full border-b-2 border-black" 
          style={{ backgroundColor: quiz.accentColor || '#FFE600' }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b-2 border-black bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFE600] px-2.5 py-1 rounded-md border-2 border-black font-black text-xs uppercase tracking-wide">
              {quiz.track}
            </span>
            <NeoBadge variant="dark" size="xs">
              PIN: {quiz.id.toUpperCase()}
            </NeoBadge>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl border-2 border-black bg-[#EA4335] text-white flex items-center justify-center hover:bg-[#D33828] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isSuccess ? (
            <form onSubmit={handleConfirmJoin} className="space-y-5">
              
              {/* Quiz Banner in Modal */}
              <div className="bg-[#FFF8E7] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h2 className="text-xl font-black text-black leading-snug mb-1.5">
                  {quiz.title}
                </h2>
                <p className="text-xs font-semibold text-black/70 mb-3">
                  {quiz.description}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-black text-center text-xs font-bold">
                  <div>
                    <span className="text-black/50 block text-[10px]">FORMAT</span>
                    <span className="font-black">{quiz.totalQuestions} Questions</span>
                  </div>
                  <div className="border-x border-black/20">
                    <span className="text-black/50 block text-[10px]">TIME LIMIT</span>
                    <span className="font-black">{quiz.durationMinutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[10px]">REWARD</span>
                    <span className="font-black text-[#EA4335] truncate block">Top Swags</span>
                  </div>
                </div>
              </div>

              {/* Player Nickname & Avatar Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Your Player Nickname
                </label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. CodeNinja_Ranchi"
                  className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              {/* Avatar Emoji Picker */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Choose Player Badge Emoji
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {avatarList.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`
                        w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-xl shrink-0 transition-all
                        ${selectedAvatar === emoji
                          ? 'bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] -translate-y-1 scale-105'
                          : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'
                        }
                      `}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Pass Code */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  DevFest Access Code
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F4F3EC] border-2 border-black rounded-xl font-mono font-bold text-xs text-black"
                />
                <span className="text-[10px] font-bold text-black/50 mt-1 block">
                  ✓ Pre-verified with DevFest 2026 Free Community Pass
                </span>
              </div>

              {/* Rules of Engagement */}
              <div className="bg-[#FEE4E2] p-3.5 rounded-xl border-2 border-black text-xs space-y-1.5">
                <div className="font-black text-[#B42318] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  ARENA RULES & FAIR PLAY
                </div>
                <ul className="list-disc list-inside text-black/80 font-medium space-y-0.5 text-[11px]">
                  <li>Each question has a strict countdown timer.</li>
                  <li>Faster answers earn bonus speed multiplier points.</li>
                  <li>Live leaderboard updates after every question!</li>
                </ul>
              </div>

              {/* Submit CTA */}
              <NeoButton
                type="submit"
                variant="yellow"
                size="lg"
                className="w-full shadow-[5px_5px_0px_0px_#000]"
                icon={Sparkles}
                iconPosition="right"
              >
                CONFIRM & ENTER ARENA
              </NeoButton>

            </form>
          ) : (
            /* Joined / Success state view */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#D1FADF] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] text-3xl">
                🎟️
              </div>
              
              <div>
                <span className="bg-[#FFE600] px-3 py-1 rounded-full border-2 border-black font-black text-xs uppercase tracking-wider">
                  You are Enrolled!
                </span>
                <h3 className="text-2xl font-black text-black mt-2">
                  Welcome aboard, {playerName}! {selectedAvatar}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/70 max-w-sm mx-auto mt-1">
                  Your seat for <span className="underline">{quiz.title}</span> is officially reserved in the GDG live queue.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1 font-bold">
                  <span className="text-black/60">Player ID:</span>
                  <span className="font-mono font-black text-black">GDG-2026-#{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
                <div className="flex justify-between border-b pb-1 font-bold">
                  <span className="text-black/60">Quiz Status:</span>
                  <span className="text-[#34A853] font-black">{quiz.status}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-black/60">Questions Loaded:</span>
                  <span className="font-black text-black">{quiz.questions ? quiz.questions.length : quiz.totalQuestions} Interactive items ready</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                <NeoButton
                  variant="green"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    setActiveQuizForModal({ quiz, mode: 'arena' });
                  }}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  START ARENA RUN
                </NeoButton>
                <NeoButton
                  variant="white"
                  size="md"
                  onClick={handleClose}
                >
                  Back to List
                </NeoButton>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
