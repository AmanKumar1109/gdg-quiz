import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { NeoButton } from './NeoButton';
import { NeoBadge } from './NeoBadge';
import { 
  Trophy, 
  Zap, 
  Menu, 
  X, 
  Ticket, 
  LogOut, 
  UserCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Navbar = () => {
  const { 
    joinedQuizzes, 
    userProfile, 
    openAuthModal, 
    logoutAttendee 
  } = useQuiz();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'All Quizzes', path: '/' },
    { label: 'Tracks', path: '/tracks' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Rules & Swags', path: '/swags' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b-[2.5px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with DevFest aesthetic */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center font-black tracking-tight text-xl sm:text-2xl font-mono select-none">
              <span className="text-[#EA4335] text-3xl font-black">[</span>
              <span className="text-black px-1 font-sans font-extrabold flex items-center">
                Dev<span className="text-[#FBBC04] bg-black px-1.5 py-0.5 rounded-md ml-0.5 text-white transform -rotate-1 group-hover:rotate-2 transition-transform">Fest</span>
              </span>
              <span className="text-[#4285F4] text-3xl font-black">]</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#34A853] bg-[#D1FADF] px-1.5 py-0.2 rounded border border-black leading-tight">
                Ranchi 2026
              </span>
              <span className="text-[9px] font-bold text-black/60 tracking-wider">
                QUIZ ARENA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-3.5 py-2 font-bold text-sm tracking-tight rounded-xl transition-all
                    ${active 
                      ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000]' 
                      : 'text-black/80 hover:text-black hover:bg-black/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Status / Ticket Check-in & Actions */}
          <div className="hidden sm:flex items-center gap-3">
            
            {userProfile.isLoggedIn ? (
              <>
                {/* Ticket ID & Name Pill */}
                <div className="flex items-center gap-2 bg-[#FFFDF7] border-2 border-black rounded-xl px-3 py-1.5 shadow-[2.5px_2.5px_0px_0px_#000]">
                  <span className="text-base">{userProfile.avatar || '🚀'}</span>
                  <div className="text-left">
                    <div className="text-xs font-black text-black leading-tight flex items-center gap-1">
                      <span>{userProfile.name}</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-black/60 flex items-center gap-1">
                      <Ticket className="w-2.5 h-2.5 text-[#EA4335]" />
                      <span>{userProfile.ticketId}</span>
                    </div>
                  </div>
                </div>

                {/* Cumulative Points Counter */}
                <Link
                  to="/leaderboard"
                  className="flex items-center gap-1.5 bg-[#FFE600] hover:bg-[#FCD34D] border-2 border-black rounded-xl px-3 py-1.5 shadow-[2.5px_2.5px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5"
                  title="View your position on the Leaderboard"
                >
                  <Trophy className="w-4 h-4 text-black" />
                  <div className="text-left leading-none">
                    <span className="text-[9px] font-black uppercase text-black/70 block">Total Score</span>
                    <span className="text-xs font-black text-black">
                      {(userProfile.totalPoints || 0).toLocaleString()} pts
                    </span>
                  </div>
                </Link>

                {/* Logout / Switch Ticket */}
                <button
                  onClick={logoutAttendee}
                  className="p-2 bg-white hover:bg-red-50 text-black hover:text-red-600 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5"
                  title="Switch Ticket / Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* Check-in CTA Button */
              <NeoButton
                variant="yellow"
                size="sm"
                onClick={() => openAuthModal({ title: 'Attendee Login', description: 'Enter your DevFest Email and Ticket ID to save and accumulate your quiz points!' })}
                icon={Ticket}
                iconPosition="left"
                className="text-xs font-black"
              >
                Ticket Check-In
              </NeoButton>
            )}

          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-black bg-[#FFE600] rounded-xl shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF7] border-t-2 border-black px-4 pt-3 pb-6 space-y-3">
          
          {userProfile.isLoggedIn ? (
            <div className="p-3 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{userProfile.avatar || '🚀'}</span>
                <div>
                  <div className="text-sm font-black text-black">{userProfile.name}</div>
                  <div className="text-xs font-mono font-bold text-black/60 flex items-center gap-1">
                    <Ticket className="w-3 h-3 text-[#EA4335]" />
                    {userProfile.ticketId}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-[#EA4335] block">
                  {userProfile.totalPoints || 0} pts
                </span>
                <button
                  onClick={logoutAttendee}
                  className="text-[10px] font-black text-red-600 underline"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <NeoButton
              variant="yellow"
              size="md"
              className="w-full text-sm font-black"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              icon={Ticket}
              iconPosition="left"
            >
              Attendee Ticket Check-In
            </NeoButton>
          )}

          <div className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-4 py-2.5 font-bold text-base rounded-xl border-2 border-black
                  ${isActive(link.path)
                    ? 'bg-[#FFE600] shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-white shadow-[2px_2px_0px_0px_#000]'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
