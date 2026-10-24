import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { triggerNeoConfetti } from '../hooks/useConfetti';
import { NeoButton } from '../components/common/NeoButton';
import { NeoBadge } from '../components/common/NeoBadge';
import { AnswerKeyModal } from '../components/quiz/AnswerKeyModal';
import { 
  Clock, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Zap, 
  Award, 
  Sparkles, 
  User, 
  HelpCircle, 
  Store,
  Flame,
  Check,
  Ticket,
  Mail,
  ShieldCheck,
  AlertCircle,
  PauseCircle,
  Key,
  ListChecks,
  ShieldAlert,
  Lock
} from 'lucide-react';

export const QuizPlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    quizzes, 
    userProfile, 
    setUserProfile, 
    submitQuizScore, 
    joinQuiz,
    loginAttendee,
    openAuthModal,
    leaderboard
  } = useQuiz();

  const quiz = quizzes.find(q => q.id === id);

  const isLive = quiz?.isLive || quiz?.status === 'LIVE';

  const hasAlreadyAttempted = Boolean(
    userProfile?.isLoggedIn && 
    userProfile?.completedQuizzes && 
    userProfile?.completedQuizzes[quiz?.id]
  );
  const existingAttempt = hasAlreadyAttempted ? userProfile.completedQuizzes[quiz?.id] : null;

  // Fallback questions if none exist
  const questions = (quiz && quiz.questions && quiz.questions.length > 0) 
    ? quiz.questions 
    : [
      {
        id: 'sample-1',
        question: `Challenge: Which ecosystem is highlighted in ${quiz?.title || 'this DevFest track'}?`,
        options: ['Google Cloud, AI & Modern Web', 'Localhost legacy monolith', 'Static punch cards', 'Unsupported runtime'],
        correctAnswer: 0,
        explanation: 'DevFest Ranchi 2026 brings modern Cloud, Generative AI, and Android development to life!'
      }
    ];

  // Specific Timing from Admin Panel: durationMinutes (default 15m)
  const durationMinutes = quiz?.durationMinutes ? Number(quiz.durationMinutes) : 15;
  const initialSeconds = durationMinutes * 60;

  // Game States: 'LOBBY' | 'PLAYING' | 'FINISHED'
  const [gameState, setGameState] = useState('LOBBY');
  
  // Lobby Credentials Form (if not logged in)
  const [lobbyEmail, setLobbyEmail] = useState(userProfile.email || '');
  const [lobbyTicket, setLobbyTicket] = useState(userProfile.ticketId || '');
  const [lobbyName, setLobbyName] = useState(userProfile.name || '');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Live Game State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizEarnedScore, setQuizEarnedScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [totalCumulativeScore, setTotalCumulativeScore] = useState(userProfile.totalPoints || 0);
  const [sessionTiming, setSessionTiming] = useState(0);
  const [totalCumulativeTime, setTotalCumulativeTime] = useState(userProfile.totalTimeSeconds || 0);

  // Answer Key Modal state
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);

  const avatarList = ['🚀', '⚡', '🤖', '💻', '🎯', '🔥', '🕶️', '🐱'];
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar || '🚀');

  // Ensure view resets to the very top upon entering page or changing game phase
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id, gameState]);

  // Sync initial seconds when quiz loads
  useEffect(() => {
    if (quiz?.durationMinutes) {
      setTimeLeft(Number(quiz.durationMinutes) * 60);
    }
  }, [quiz?.durationMinutes]);

  // Overall Challenge Countdown Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (timeLeft <= 0) {
      handleFinishGame();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Format MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Authenticate and start
  const handleLobbyAuthAndStart = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    // Check if Quiz is Live / Started by admin
    if (!isLive) {
      setAuthError('Quiz Not Started Yet! The event organizers have not started this quiz yet. Please wait for the host to start it!');
      return;
    }

    // Check if user has already attempted this quiz (Strict 1-attempt rule)
    if (userProfile.isLoggedIn && userProfile.completedQuizzes?.[quiz?.id]) {
      setAuthError('You have already completed this challenge! Only 1 attempt is allowed per attendee ticket.');
      return;
    }

    if (!userProfile.isLoggedIn) {
      const cleanEmail = lobbyEmail.trim().toLowerCase();
      const cleanTicket = lobbyTicket.trim().toUpperCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        setAuthError('Please enter a valid registered DevFest email address.');
        return;
      }
      if (!cleanTicket) {
        setAuthError('Please enter your DevFest Ticket ID (e.g. DF26-TKT-1049).');
        return;
      }
      if (!lobbyName.trim()) {
        setAuthError('Please enter your registered Attendee Name as shown on your DevFest pass.');
        return;
      }

      setIsVerifying(true);
      try {
        const res = await loginAttendee(cleanEmail, cleanTicket, lobbyName.trim());
        if (!res.success) {
          setAuthError(res.message || 'Check-in failed. Please check ticket credentials.');
          setIsVerifying(false);
          return;
        }

        // Check if retrieved attendee profile already has completed this quiz
        if (res.profile?.completedQuizzes?.[quiz?.id]) {
          setAuthError('This ticket has already been used to complete this challenge! Only 1 attempt is allowed.');
          setIsVerifying(false);
          return;
        }
      } catch (err) {
        setAuthError('Error verifying ticket. Please retry.');
        setIsVerifying(false);
        return;
      }
      setIsVerifying(false);
    }

    // Start Game
    if (quiz) {
      joinQuiz(quiz.id);
    }
    setGameState('PLAYING');
    setTimeLeft(initialSeconds);
    setCurrentIdx(0);
    setQuizEarnedScore(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const handleOptionClick = (optionIdx) => {
    if (isAnswerSubmitted) return;

    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);

    const currentQ = questions[currentIdx];
    const isCorrect = (currentQ?._token && btoa(`gdg_${optionIdx}_${currentIdx * 7 + 13}`) === currentQ._token) || (optionIdx === currentQ?.correctAnswer);

    if (isCorrect) {
      setQuizEarnedScore(prev => prev + 100);
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      handleFinishGame();
    }
  };

  const handleFinishGame = async () => {
    setGameState('FINISHED');
    triggerNeoConfetti();

    // 100 pts per correct answer + 150 pts completion bonus
    const finalPoints = quizEarnedScore + 150;
    const timeSpent = Math.max(1, initialSeconds - Math.max(0, timeLeft));
    setSessionTiming(timeSpent);
    
    // Accumulate points & timing onto user profile & sync to Firestore & Leaderboard
    const result = await submitQuizScore(quiz?.id, finalPoints, timeSpent);
    if (result && result.newTotal) {
      setTotalCumulativeScore(result.newTotal);
      setTotalCumulativeTime(result.newTotalTime || ((userProfile.totalTimeSeconds || 0) + timeSpent));
    } else {
      setTotalCumulativeScore((userProfile.totalPoints || 0) + finalPoints);
      setTotalCumulativeTime((userProfile.totalTimeSeconds || 0) + timeSpent);
    }
  };

  // If Quiz not found
  if (!quiz && quizzes.length > 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl border-3 border-black p-10 shadow-[8px_8px_0px_0px_#000] space-y-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-2xl font-black text-black">Challenge Not Found</h2>
          <p className="text-sm font-bold text-black/60">
            This quiz may have been unlisted or completed.
          </p>
          <Link to="/">
            <NeoButton variant="yellow" size="md">
              Back to Arena Quizzes
            </NeoButton>
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* ------------------------------------------------------------- */}
      {/* PHASE 1: LOBBY & CHECK-IN SCREEN                              */}
      {/* ------------------------------------------------------------- */}
      {gameState === 'LOBBY' && (
        <div className="bg-white rounded-3xl border-4 border-black p-6 sm:p-10 shadow-[10px_10px_0px_0px_#000] space-y-8 animate-fadeIn">
          
          {/* Top Bar with back button */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black/10">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black hover:text-[#4285F4] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Quizzes</span>
            </Link>

            <div className="flex items-center gap-2">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D1FADF] text-[#027A48] border-2 border-black">
                  <span className="w-2 h-2 rounded-full bg-[#027A48] animate-pulse"></span>
                  Live Challenge
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border-2 border-black">
                  <PauseCircle className="w-3.5 h-3.5 text-amber-800" />
                  Not Started Yet
                </span>
              )}
            </div>
          </div>

          {/* Quiz Header Hero */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full border-2 border-black font-black text-xs bg-[#EBF3FE] text-[#175CD3] shadow-[2px_2px_0px_0px_#000]">
                {quiz?.track || 'DevFest Track'}
              </span>
              <span className="px-3 py-1 rounded-full border-2 border-black font-black text-xs bg-[#D1FADF] text-[#027A48]">
                {quiz?.difficulty || 'Medium'}
              </span>
              {quiz?.isBoothQuiz && (
                <span className="px-3 py-1 rounded-full border-2 border-black font-black text-xs bg-purple-100 text-purple-800 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>Booth: {quiz.boothName || 'On-Ground'}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
              {quiz?.title || 'DevFest Quiz Challenge'}
            </h1>

            <p className="text-sm sm:text-base font-bold text-black/70 leading-relaxed max-w-2xl">
              {quiz?.description || 'Test your developer knowledge and climb the real-time DevFest stage leaderboard!'}
            </p>
          </div>

          {/* NOT STARTED YET WARNING BANNER */}
          {!isLive && (
            <div className="p-4 sm:p-5 bg-amber-50 rounded-2xl border-3 border-amber-400 space-y-2 shadow-[3px_3px_0px_0px_#D97706] animate-pulse">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm uppercase">
                <PauseCircle className="w-5 h-5 text-amber-700" />
                <span>Quiz Has Not Started Yet</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-amber-900/90 leading-relaxed">
                The event organizers have not started this quiz yet. Please stay on this page — as soon as the host or speaker clicks <strong>"Start Quiz"</strong> on stage, this arena will automatically unlock in real-time!
              </p>
            </div>
          )}

          {/* RELEASED ANSWER KEY BANNER IF AVAILABLE */}
          {quiz?.answerKeyReleased && (
            <div className="p-4 bg-emerald-50 rounded-2xl border-3 border-emerald-400 flex items-center justify-between flex-wrap gap-3 shadow-[3px_3px_0px_0px_#059669]">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="text-xs font-black uppercase text-emerald-900">Official Answer Key Released</div>
                  <div className="text-xs font-bold text-emerald-800">You can review all verified solutions and explanations right now.</div>
                </div>
              </div>
              <NeoButton
                variant="white"
                size="sm"
                onClick={() => setShowAnswerKeyModal(true)}
                icon={Key}
                iconPosition="left"
                className="text-xs font-black"
              >
                View Solution Guide
              </NeoButton>
            </div>
          )}

          {/* Specific Timing & Rules Box configured from Admin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FFF8E7] p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-black/60">Allocated Time</div>
                <div className="text-lg font-black text-black">{durationMinutes} Minutes</div>
                <div className="text-[10px] text-black/50 font-bold">Admin Configured</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#4285F4] text-white border-2 border-black flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-black/60">Challenge Items</div>
                <div className="text-lg font-black text-black">{questions.length} Questions</div>
                <div className="text-[10px] text-black/50 font-bold">+100 pts per correct</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#EA4335] text-white border-2 border-black flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-black/60">Stage Recognition</div>
                <div className="text-lg font-black text-black">Points Accumulate</div>
                <div className="text-[10px] text-black/50 font-bold">Added to Leaderboard</div>
              </div>
            </div>
          </div>

          {/* CHALLENGE INSTRUCTIONS & RULES (Shown before enrolling/starting) */}
          <div className="bg-[#FFFDF7] rounded-3xl border-3 border-black p-5 sm:p-7 shadow-[5px_5px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b-2 border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <ListChecks className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-black uppercase tracking-wide">
                    Challenge Instructions & Rules
                  </h3>
                  <span className="text-[11px] font-bold text-black/50">
                    Please read carefully before starting your session
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                Strict 1-Attempt Rule
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {(quiz?.rules && quiz.rules.length > 0 ? quiz.rules : [
                "Single attempt only: You can only take this quiz once per attendee ticket ID.",
                "Once started, the countdown timer cannot be paused.",
                "+100 points for each correct answer.",
                "+150 points bonus on submitting all questions.",
                "Faster overall session timing breaks ties on the stage leaderboard.",
                "Switching tabs during live challenge is strictly monitored."
              ]).map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-6 h-6 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-xs font-black shrink-0 shadow-[1px_1px_0px_0px_#000]">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-black/85 leading-snug">
                    {rule}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl flex items-center gap-2.5 text-xs font-black text-red-900 shadow-[2px_2px_0px_0px_#EF4444]">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>DevFest Policy Notice: Once you begin and submit, your ticket is permanently marked as completed for this quiz. Re-taking is strictly blocked!</span>
            </div>
          </div>

          {/* ATTENDEE STATUS & ENROLLMENT SECTION */}
          {hasAlreadyAttempted ? (
            /* ATTEMPT BLOCKED / ALREADY COMPLETED STATE */
            <div className="p-6 sm:p-8 bg-[#FEE4E2]/50 rounded-3xl border-4 border-[#D92D20] space-y-5 shadow-[6px_6px_0px_0px_#D92D20]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D92D20] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#D92D20] block">
                      Challenge Attempt Locked
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-black">
                      You Have Already Completed This Quiz!
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-red-100 text-red-900 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                  1 Attempt Max
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-black space-y-4 shadow-[3px_3px_0px_0px_#000]">
                <p className="text-xs sm:text-sm font-bold text-black/75 leading-relaxed">
                  DevFest enforces a strict single-attempt policy per ticket to keep the stage leaderboard 100% fair. Your score and session timing have been locked and submitted to the organizers.
                </p>

                {/* Score breakdown for this quiz */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FFE600]/30 rounded-xl border-2 border-black">
                    <span className="text-[10px] font-black uppercase text-black/60 block">Points Earned</span>
                    <span className="text-xl font-black text-black">+{existingAttempt?.points || 0} pts</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border-2 border-black">
                    <span className="text-[10px] font-black uppercase text-black/60 block">Time Recorded</span>
                    <span className="text-xl font-black text-blue-900">{formatTimer(existingAttempt?.timeTakenSeconds || 0)}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border-2 border-black col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-black uppercase text-black/60 block">Cumulative Score</span>
                    <span className="text-xl font-black text-emerald-900">{(userProfile.totalPoints || 0).toLocaleString()} pts</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {quiz?.answerKeyReleased && (
                  <NeoButton
                    variant="yellow"
                    size="md"
                    className="flex-1 text-sm font-black"
                    onClick={() => setShowAnswerKeyModal(true)}
                    icon={Key}
                    iconPosition="left"
                  >
                    Review Solution Key
                  </NeoButton>
                )}
                <Link to="/leaderboard" className="flex-1">
                  <NeoButton
                    variant="white"
                    size="md"
                    className="w-full text-sm font-black"
                    icon={Trophy}
                    iconPosition="left"
                  >
                    View Stage Leaderboard
                  </NeoButton>
                </Link>
                <Link to="/" className="flex-1">
                  <NeoButton
                    variant="white"
                    size="md"
                    className="w-full text-sm font-black"
                  >
                    Explore Other Quizzes
                  </NeoButton>
                </Link>
              </div>
            </div>
          ) : userProfile.isLoggedIn ? (
            /* Logged in state (Ready to start) */
            <div className="p-6 bg-[#D1FADF]/40 rounded-2xl border-3 border-[#027A48] space-y-4 shadow-[4px_4px_0px_0px_#027A48]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#027A48]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#027A48]">
                    Verified DevFest Attendee
                  </span>
                </div>
                <span className="text-xs font-bold text-black/60">
                  {isLive ? 'Ready to play' : 'Waiting for Start'}
                </span>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-xl border-2 border-black">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{userProfile.avatar || '🚀'}</span>
                  <div>
                    <div className="text-lg font-black text-black">{userProfile.name}</div>
                    <div className="text-xs font-mono font-bold text-black/60 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-[#EA4335]" />
                      <span>{userProfile.ticketId}</span>
                      <span>• {userProfile.email}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-black/50 block">Current Total Score</span>
                  <span className="text-xl font-black text-[#EA4335]">
                    {(userProfile.totalPoints || 0).toLocaleString()} pts
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-black/70">
                💡 Points earned in this quiz will automatically stack on top of your existing <strong>{userProfile.totalPoints || 0} pts</strong> on the live stage leaderboard!
              </p>

              <div className="pt-2">
                {isLive ? (
                  <NeoButton
                    type="button"
                    variant="yellow"
                    size="xl"
                    className="w-full text-lg font-black"
                    onClick={handleLobbyAuthAndStart}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Start Challenge Now ({durationMinutes}m Timer)
                  </NeoButton>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 rounded-2xl border-3 border-black bg-gray-200 text-gray-500 font-black text-base flex items-center justify-center gap-2 cursor-not-allowed shadow-[3px_3px_0px_0px_#000]"
                  >
                    <PauseCircle className="w-5 h-5 text-gray-400" />
                    <span>Waiting for Host to Start Quiz...</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Not logged in: Require Email + Ticket ID */
            <form onSubmit={handleLobbyAuthAndStart} className="p-6 bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <Ticket className="w-3.5 h-3.5" />
                  Attendee Check-In Required
                </span>
                <span className="text-xs font-bold text-black/50">Step 1 of 2</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-black">
                  Enter your Name, Email & Ticket ID to Unlock Challenge
                </h3>
                <p className="text-xs font-bold text-black/60 mt-1">
                  Access is granted only if your details match an attendee record in the DevFest Firestore registry!
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#4285F4]" />
                    DevFest Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={lobbyEmail}
                    onChange={(e) => setLobbyEmail(e.target.value)}
                    placeholder="attendee@example.com"
                    className="w-full px-4 py-3 bg-[#FFFDF7] border-2 border-black rounded-xl font-bold text-sm text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#EA4335]" />
                    Ticket ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={lobbyTicket}
                    onChange={(e) => setLobbyTicket(e.target.value.toUpperCase())}
                    placeholder="e.g. DF26-TKT-1049"
                    className="w-full px-4 py-3 bg-[#FFFDF7] border-2 border-black rounded-xl font-mono font-black text-sm text-black uppercase focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#34A853]" />
                    Registered Attendee Name *
                  </span>
                  <span className="text-[10px] text-black/50 font-bold">
                    confirmed from firestore
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 bg-[#FFFDF7] border-2 border-black rounded-xl font-bold text-sm text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <div className="pt-2">
                <NeoButton
                  type="submit"
                  variant="yellow"
                  size="xl"
                  className="w-full text-lg font-black"
                  disabled={isVerifying}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {isVerifying ? 'Checking In...' : 'Verify Ticket & Enter Quiz Arena'}
                </NeoButton>
              </div>
            </form>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE 2: LIVE QUIZ ARENA                                       */}
      {/* ------------------------------------------------------------- */}
      {gameState === 'PLAYING' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Sticky Status Bar */}
          <div className="bg-white rounded-2xl border-3 border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#000] flex items-center justify-between flex-wrap gap-4">
            
            {/* Player Info */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{userProfile.avatar || selectedAvatar}</span>
              <div>
                <div className="text-sm font-black text-black leading-none">
                  {userProfile.name}
                </div>
                <div className="text-[10px] font-mono font-bold text-black/50 mt-1">
                  {userProfile.ticketId} • {quiz?.track}
                </div>
              </div>
            </div>

            {/* Live Countdown Timer with warning pulse */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black font-mono font-black text-lg sm:text-xl shadow-[2px_2px_0px_0px_#000]
              ${timeLeft < 60 ? 'bg-[#FFEBEE] text-[#EA4335] animate-pulse border-[#EA4335]' : 'bg-[#FFFDF7] text-black'}
            `}>
              <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-[#EA4335]' : 'text-black'}`} />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {/* Score & Progress */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-black/50">Quiz Score</div>
                <div className="text-lg font-black text-[#EA4335]">+{quizEarnedScore} pts</div>
              </div>
              <div className="h-8 w-[2px] bg-black/10 hidden sm:block"></div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black uppercase text-black/50">Progress</div>
                <div className="text-sm font-black text-black">{currentIdx + 1} / {questions.length}</div>
              </div>
            </div>

          </div>

          {/* Question Stepper Bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000]">
            <div 
              className="bg-[#FFE600] h-full transition-all duration-300 border-r-2 border-black"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000] space-y-6">
            
            <div className="flex items-center justify-between text-xs font-black uppercase text-black/50 border-b-2 border-black/10 pb-3">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="text-[#4285F4]">DevFest Official Question</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-black leading-tight">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {(currentQ.options || []).map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctAnswer;
                
                let cardStyle = "bg-[#FFFDF7] border-black hover:bg-[#FFE600]/20 hover:border-black";
                
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    cardStyle = "bg-[#D1FADF] border-[#027A48] text-[#027A48]";
                  } else if (isSelected && !isCorrect) {
                    cardStyle = "bg-[#FEE4E2] border-[#B42318] text-[#B42318]";
                  } else {
                    cardStyle = "bg-gray-50 border-gray-300 opacity-60";
                  }
                } else if (isSelected) {
                  cardStyle = "bg-[#FFE600] border-black shadow-[4px_4px_0px_0px_#000]";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleOptionClick(idx)}
                    className={`
                      w-full p-4 sm:p-5 rounded-2xl border-3 text-left font-extrabold text-sm sm:text-base flex items-center justify-between transition-all duration-150 cursor-pointer shadow-[3px_3px_0px_0px_#000]
                      ${cardStyle}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center font-black text-xs shrink-0
                        ${isSelected ? 'bg-black text-white' : 'bg-white text-black'}
                      `}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[#027A48] shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-[#B42318] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Navigation */}
            {isAnswerSubmitted && (
              <div className="bg-[#EBF3FE] p-5 rounded-2xl border-2 border-black space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-black text-xs uppercase text-[#175CD3]">
                  <Zap className="w-4 h-4 fill-[#175CD3]" />
                  <span>Insight & Explanation:</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-black/80">
                  {currentQ.explanation || currentQ.explanationMarkdown || 'Official DevFest Ranchi 2026 challenge concept.'}
                </p>

                <div className="flex justify-end pt-2">
                  <NeoButton
                    variant="yellow"
                    size="md"
                    onClick={handleNextQuestion}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {currentIdx + 1 === questions.length ? 'FINISH & VIEW RESULTS' : 'NEXT QUESTION'}
                  </NeoButton>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE 3: SUMMARY & CUMULATIVE SCORE SCREEN                     */}
      {/* ------------------------------------------------------------- */}
      {gameState === 'FINISHED' && (
        <div className="bg-white rounded-3xl border-4 border-black p-6 sm:p-10 shadow-[10px_10px_0px_0px_#000] text-center space-y-8 animate-fadeIn max-w-2xl mx-auto">
          
          <div className="w-20 h-20 rounded-3xl bg-[#FFE600] border-3 border-black flex items-center justify-center text-4xl mx-auto shadow-[4px_4px_0px_0px_#000]">
            🏆
          </div>

          <div className="space-y-2">
            <span className="bg-[#D1FADF] text-[#027A48] px-3 py-1 rounded-full border-2 border-black font-black text-xs uppercase tracking-wider inline-block">
              Challenge Completed!
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-black">
              Awesome Work, {userProfile.name}!
            </h1>
            <p className="text-sm font-bold text-black/60 max-w-md mx-auto">
              Your points have been calculated and added to your cumulative total under ticket <span className="font-mono text-black font-black">{userProfile.ticketId}</span>!
            </p>
          </div>

          {/* Cumulative Score & Timing Highlight Banner */}
          <div className="p-6 bg-[#FFE600] rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-black/70">
              Your Total Cumulative DevFest Standing
            </span>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div>
                <span className="text-[10px] font-black uppercase text-black/60 block">Total Points</span>
                <div className="text-4xl sm:text-5xl font-black text-black">
                  {totalCumulativeScore.toLocaleString()} <span className="text-2xl font-black">pts</span>
                </div>
              </div>
              <div className="h-12 w-[2px] bg-black/20 hidden sm:block"></div>
              <div>
                <span className="text-[10px] font-black uppercase text-black/60 block">Total Timing</span>
                <div className="text-4xl sm:text-5xl font-black text-black">
                  {formatTimer(totalCumulativeTime)}
                </div>
              </div>
            </div>
            
            {/* Tie Breaker Note */}
            <div className="p-2.5 bg-white/80 rounded-xl border-2 border-black text-xs font-bold text-black flex items-center justify-center gap-2 mt-2">
              <Zap className="w-4 h-4 text-[#EA4335] shrink-0" />
              <span><strong>Tie-Breaker Active:</strong> If attendee scores tie on stage, faster total timing wins higher rank!</span>
            </div>
          </div>

          {/* Stats Summary Grid: 4 Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#FFF8E7] rounded-2xl border-2 border-black">
              <div className="text-[10px] font-black uppercase text-black/50">Quiz Score</div>
              <div className="text-xl sm:text-2xl font-black text-[#EA4335]">+{quizEarnedScore + 150} pts</div>
              <div className="text-[10px] font-bold text-black/40">incl. +150 bonus</div>
            </div>

            <div className="p-4 bg-[#D1FADF] rounded-2xl border-2 border-black">
              <div className="text-[10px] font-black uppercase text-black/50">Time Taken</div>
              <div className="text-xl sm:text-2xl font-black text-[#027A48]">{formatTimer(sessionTiming)}</div>
              <div className="text-[10px] font-bold text-black/40">Recorded timing</div>
            </div>

            <div className="p-4 bg-[#EBF3FE] rounded-2xl border-2 border-black">
              <div className="text-[10px] font-black uppercase text-black/50">Accuracy</div>
              <div className="text-xl sm:text-2xl font-black text-[#175CD3]">
                {Math.round((correctCount / questions.length) * 100)}%
              </div>
              <div className="text-[10px] font-bold text-black/40">{correctCount} of {questions.length} correct</div>
            </div>

            <div className="p-4 bg-[#FFFDF7] rounded-2xl border-2 border-black">
              <div className="text-[10px] font-black uppercase text-black/50">Time Remaining</div>
              <div className="text-xl sm:text-2xl font-black text-black">{formatTimer(timeLeft)}</div>
              <div className="text-[10px] font-bold text-black/40">of {durationMinutes}m</div>
            </div>
          </div>

          {/* Released Answer Key Button in Finish screen */}
          {quiz?.answerKeyReleased && (
            <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-between">
              <div className="text-left">
                <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-700" />
                  <span>Answer Key is Live</span>
                </div>
                <div className="text-[11px] font-bold text-amber-800">Review correct answers for all questions.</div>
              </div>
              <NeoButton
                variant="yellow"
                size="sm"
                onClick={() => setShowAnswerKeyModal(true)}
                className="text-xs font-black"
              >
                View Answers
              </NeoButton>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/leaderboard" className="flex-1">
              <NeoButton variant="yellow" size="lg" className="w-full text-base font-black" icon={Trophy} iconPosition="left">
                View Stage Leaderboard
              </NeoButton>
            </Link>
            
            <Link to="/" className="flex-1">
              <NeoButton variant="white" size="lg" className="w-full text-base font-black">
                Play Next Challenge
              </NeoButton>
            </Link>
          </div>

        </div>
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
