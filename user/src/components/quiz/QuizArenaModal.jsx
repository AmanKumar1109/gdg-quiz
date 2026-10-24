import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { triggerNeoConfetti } from '../../hooks/useConfetti';
import { NeoButton } from '../common/NeoButton';
import { NeoBadge } from '../common/NeoBadge';
import { 
  Clock, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  X, 
  Zap,
  Award
} from 'lucide-react';

export const QuizArenaModal = () => {
  const { activeQuizForModal, setActiveQuizForModal, userProfile, setUserProfile, submitQuizScore } = useQuiz();

  if (!activeQuizForModal || activeQuizForModal.mode !== 'arena') return null;

  const quiz = activeQuizForModal.quiz;
  const questions = quiz.questions && quiz.questions.length > 0 ? quiz.questions : [
    {
      id: 1,
      question: `Sample Challenge for ${quiz.title}: Which platform is featured in this track?`,
      options: ['Google Cloud & AI Platform', 'Localhost 3000', 'Legacy Enterprise Monolith', 'Paper Form System'],
      correctAnswer: 0,
      explanation: 'DevFest 2026 focuses on modern Cloud, AI, and Android developer ecosystems.'
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isAnswerSubmitted || isFinished) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswerSubmitted, isFinished]);

  const handleTimeUp = () => {
    setIsAnswerSubmitted(true);
  };

  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    if (idx === currentQ.correctAnswer) {
      const pointsEarned = 100 + timeLeft * 5;
      setScore(prev => prev + pointsEarned);
      triggerNeoConfetti();
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(30);
    } else {
      setIsFinished(true);
      triggerNeoConfetti();
      const earned = score + 200;
      if (submitQuizScore) {
        submitQuizScore(quiz.id, earned);
      } else {
        setUserProfile(prev => ({
          ...prev,
          totalPoints: (prev.totalPoints || 0) + earned
        }));
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setTimeLeft(30);
    setIsFinished(false);
  };

  const handleClose = () => {
    setActiveQuizForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#FFFDF7] rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_#000] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arena Header */}
        <div className="bg-[#111111] text-white p-4 sm:p-5 border-b-3 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{userProfile.avatar}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE600] block">
                {quiz.track} • LIVE ARENA
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate max-w-[280px] sm:max-w-md">
                {quiz.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Score pill */}
            <div className="bg-[#FFE600] text-black border-2 border-white px-3 py-1 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#FFF]">
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>{score} pts</span>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-[#EA4335] text-white flex items-center justify-center border border-white/40 transition-colors"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {!isFinished ? (
            <>
              {/* Progress and Timer row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#4285F4] text-white px-3 py-1 rounded-full border-2 border-black font-black text-xs">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                </div>

                {/* Circular / Pill Timer */}
                <div className={`
                  flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black font-mono font-black text-xs sm:text-sm transition-colors
                  ${timeLeft <= 10 ? 'bg-[#EA4335] text-white animate-pulse' : 'bg-[#FEF0C7] text-black'}
                `}>
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white h-3 rounded-full border-2 border-black overflow-hidden p-0.5">
                <div 
                  className="bg-[#34A853] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border-3 border-black shadow-[5px_5px_0px_0px_#000]">
                <h3 className="text-lg sm:text-xl font-black text-black leading-snug">
                  {currentQ.question || (currentQ.questionMarkdown ? currentQ.questionMarkdown.replace(/^#+\s*/, '') : 'Challenge Question')}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswer;

                  let optionStyle = 'bg-white text-black hover:bg-[#FFE600]/30 shadow-[3px_3px_0px_0px_#000]';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-[#D1FADF] text-[#027A48] border-[#027A48] shadow-[3px_3px_0px_0px_#027A48] font-black';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-[#FEE4E2] text-[#B42318] border-[#B42318] shadow-[3px_3px_0px_0px_#B42318] line-through font-bold';
                    } else {
                      optionStyle = 'bg-white/60 text-black/40 border-black/20 shadow-none';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`
                        w-full p-4 rounded-xl border-2.5 border-black text-left font-bold text-sm sm:text-base flex items-center justify-between transition-all
                        ${optionStyle}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg border-2 border-black bg-[#F4F3EC] text-black font-black flex items-center justify-center text-xs shrink-0">
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

              {/* Explanation & Next CTA */}
              {isAnswerSubmitted && (
                <div className="bg-[#EBF3FE] p-4 rounded-2xl border-2 border-black space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-black text-xs uppercase text-[#175CD3]">
                    <Zap className="w-4 h-4" />
                    Insight & DevFact:
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-black/80">
                    {currentQ.explanation || currentQ.explanationMarkdown || 'Official DevFest Ranchi 2026 challenge concept.'}
                  </p>
                  
                  <div className="flex justify-end pt-1">
                    <NeoButton
                      variant="yellow"
                      size="md"
                      onClick={handleNextQuestion}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      {currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Challenge'}
                    </NeoButton>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results & Celebration Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFE600] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] text-4xl">
                🏆
              </div>

              <div>
                <span className="bg-[#D1FADF] text-[#027A48] px-4 py-1.5 rounded-full border-2 border-black font-black text-xs uppercase tracking-wider">
                  Challenge Completed!
                </span>
                <h3 className="text-3xl font-black text-black mt-2">
                  Fantastic Run, {userProfile.name}!
                </h3>
                <p className="text-sm font-bold text-black/60 max-w-md mx-auto mt-1">
                  You conquered the {quiz.title} challenge. Your points are now logged in the GDG Ranchi leaderboard.
                </p>
              </div>

              {/* Score Breakdown Card */}
              <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] max-w-md mx-auto text-center">
                <div>
                  <span className="text-[10px] font-black uppercase text-black/50 block">FINAL SCORE</span>
                  <span className="text-xl sm:text-2xl font-black text-[#EA4335]">{score}</span>
                </div>
                <div className="border-x-2 border-black/20">
                  <span className="text-[10px] font-black uppercase text-black/50 block">ACCURACY</span>
                  <span className="text-xl sm:text-2xl font-black text-[#34A853]">100%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-black/50 block">GDG BADGE</span>
                  <span className="text-xl sm:text-2xl font-black text-[#4285F4]">Verified 🌟</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                <NeoButton
                  variant="yellow"
                  size="md"
                  onClick={handleRestart}
                  icon={RotateCcw}
                  className="flex-1"
                >
                  Play Again
                </NeoButton>
                <NeoButton
                  variant="dark"
                  size="md"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Back to Quizzes
                </NeoButton>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
