import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuiz } from '../../context/QuizContext';
import { NeoButton } from '../common/NeoButton';
import { 
  Ticket, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Building2
} from 'lucide-react';

export const AttendeeAuthModal = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    loginAttendee, 
    authModalConfig, 
    leaderboard 
  } = useQuiz();

  const [email, setEmail] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [name, setName] = useState('');
  const [matchedParticipant, setMatchedParticipant] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto lookup attendee from registry as user types
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanTicket = ticketId.trim().toUpperCase();

    if (!cleanEmail && !cleanTicket) {
      setMatchedParticipant(null);
      return;
    }

    // Check existing participants in leaderboard / cache
    const found = leaderboard.find(p => {
      const pEmail = (p.email || '').trim().toLowerCase();
      const pTicket = (p.ticketNumber || '').trim().toUpperCase();
      
      if (cleanEmail && cleanTicket) {
        return pEmail === cleanEmail || pTicket === cleanTicket;
      }
      if (cleanEmail) return pEmail === cleanEmail;
      if (cleanTicket) return pTicket === cleanTicket;
      return false;
    });

    if (found) {
      setMatchedParticipant(found);
      if (!name && found.name) {
        setName(found.name);
      }
    } else {
      setMatchedParticipant(null);
    }
  }, [email, ticketId, leaderboard]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanTicket = ticketId.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid DevFest registered email address.');
      return;
    }

    if (!cleanTicket) {
      setErrorMsg('Please enter your DevFest Ticket ID (e.g. DF26-TKT-1049).');
      return;
    }

    if (!cleanName) {
      setErrorMsg('Please enter your full Name as registered on your DevFest pass.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAttendee(cleanEmail, cleanTicket, cleanName);
      if (res && res.success) {
        closeAuthModal();
        if (authModalConfig?.onSuccess) {
          authModalConfig.onSuccess();
        }
      } else {
        setErrorMsg(res?.message || 'Check-in failed. Please verify your details.');
      }
    } catch (err) {
      setErrorMsg('Error checking in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthModalOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000] z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl border-2 border-black bg-white hover:bg-gray-100 flex items-center justify-center transition shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          title="Close"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Ticket className="w-3.5 h-3.5" />
            ATTENDEE CHECK-IN
          </span>
          <span className="text-xs font-bold text-black/50">DevFest Ranchi 2026</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">
          {authModalConfig?.title || 'Enter Quiz Arena'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-black/65 mb-6">
          {authModalConfig?.description || 'Enter your registered Name, DevFest Email & Ticket ID. Access is strictly granted only after confirmation from the Firestore attendee database!'}
        </p>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FFEBEE] border-2 border-[#EA4335] text-[#C62828] text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auto Matched Participant Alert */}
        {matchedParticipant && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#D1FADF] border-2 border-[#027A48] text-[#027A48] text-xs font-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <span>Ticket Recognized in Firestore: <strong>{matchedParticipant.name}</strong></span>
                <span className="block text-[11px] font-bold text-black/60">
                  {matchedParticipant.track} • Current Points: {matchedParticipant.score || 0} pts
                </span>
              </div>
            </div>
            <span className="text-xl">{matchedParticipant.avatar || '🎯'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#4285F4]" />
              DevFest Registered Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. attendee@gmail.com"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black font-bold text-sm bg-[#FFFDF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          {/* Ticket ID Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#EA4335]" />
                Ticket ID / Pass Number *
              </span>
              <span className="text-[10px] text-black/50 font-bold lowercase">
                format: DF26-TKT-XXXX
              </span>
            </label>
            <input
              type="text"
              required
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              placeholder="e.g. DF26-TKT-1049"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black font-mono font-black text-sm bg-[#FFFDF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE600] uppercase tracking-wider transition shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          {/* Full Name Input (Required & verified with Firestore) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center justify-between">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={matchedParticipant?.name || "e.g. Rahul Sharma"}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black font-bold text-sm bg-[#FFFDF7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#34A853] transition shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          {/* Points accumulation benefit card */}
          <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 text-[11px] font-bold text-amber-900 flex items-start gap-2">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span><strong>Cumulative Score Guarantee:</strong> Points from every quiz you complete in tracks & booths will stack together under your ticket to determine your stage rank!</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <NeoButton
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full text-base font-black"
              disabled={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isLoading ? 'Verifying Ticket...' : 'Check In & Enter Quiz Arena'}
            </NeoButton>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
