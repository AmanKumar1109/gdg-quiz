import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Key, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Trophy 
} from 'lucide-react';
import { NeoButton } from '../common/NeoButton';

export const AnswerKeyModal = ({ quiz, isOpen, onClose }) => {
  if (!isOpen || !quiz || typeof document === 'undefined') return null;

  const questions = quiz.questions || [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000] z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl border-2 border-black bg-white hover:bg-gray-100 flex items-center justify-center transition shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Key className="w-3.5 h-3.5" />
            OFFICIAL ANSWER KEY
          </span>
          <span className="text-xs font-bold text-black/50">
            {quiz.track} • {questions.length} Questions
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-1">
          {quiz.title}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-black/65 mb-4 pb-3 border-b-2 border-black/10">
          This answer key and solution guide has been released by the DevFest organizers for all attendees to review.
        </p>

        {/* Questions List */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {questions.length === 0 ? (
            <div className="py-10 text-center text-black/50 font-bold">
              No questions found for this challenge.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl border-2 border-black bg-[#FFFDF7] space-y-3 shadow-[3px_3px_0px_0px_#000]"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <div className="font-extrabold text-sm sm:text-base text-black leading-snug">
                    {q.question || q.questionMarkdown}
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswer;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold transition ${
                          isCorrect 
                            ? "bg-[#D1FADF] border-[#027A48] text-[#027A48] shadow-[2px_2px_0px_0px_#027A48]" 
                            : "bg-white border-black/20 text-black/70"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isCorrect 
                              ? "bg-[#027A48] text-white border-[#027A48]" 
                              : "bg-gray-100 text-black/60 border-black/20"
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {(q.explanation || q.explanationMarkdown) && (
                  <div className="p-3 bg-[#EBF3FE] rounded-xl border-2 border-[#175CD3] text-xs font-semibold text-black/85 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-[#175CD3] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#175CD3]">Explanation: </strong>
                      <span>{q.explanation || q.explanationMarkdown}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t-2 border-black/10 flex justify-end">
          <NeoButton
            variant="yellow"
            size="md"
            onClick={onClose}
          >
            Close Solution Guide
          </NeoButton>
        </div>

      </div>
    </div>,
    document.body
  );
};
