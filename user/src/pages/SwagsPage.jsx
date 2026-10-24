import React from 'react';
import { Gift, Award, CheckCircle2, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NeoButton } from '../components/common/NeoButton';

export const SwagsPage = () => {
  const swags = [
    {
      title: 'DevFest 2026 Official Hoodie',
      criteria: 'Score in Top 10 across any 2 Tracks',
      badge: 'Legendary 🏆',
      color: '#FFE600',
      icon: '🧥'
    },
    {
      title: 'Google Pixel Buds Pro & Mech Keyboards',
      criteria: 'Track Champion (1st Rank in AI or Android)',
      badge: 'Grand Slam ⚡',
      color: '#4285F4',
      icon: '🎧'
    },
    {
      title: 'GDG Holographic Sticker Pack & Bottle',
      criteria: 'Complete any 1 Quiz with 80%+ accuracy',
      badge: 'Guaranteed 🎁',
      color: '#34A853',
      icon: '🎒'
    },
    {
      title: 'Verified Digital GDG Badge & Certificate',
      criteria: 'All participating attendees who join a quiz',
      badge: 'All Entrants 📜',
      color: '#EA4335',
      icon: '🎖️'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="bg-[#FFE600] px-4 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider inline-block mb-3 shadow-[2px_2px_0px_0px_#000]">
          OFFICIAL GOODIES & PERKS
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-3">
          DevFest Swags & Rules
        </h1>
        <p className="text-sm sm:text-base font-bold text-black/70">
          Compete in live quizzes during DevFest Ranchi 2026 at Radisson Blu to walk away with official Google developer merchandise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {swags.map((swag, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border-3 border-black p-6 sm:p-7 shadow-[6px_6px_0px_0px_#000] flex items-start gap-4 hover:-translate-y-1 transition-all"
          >
            <div
              className="w-16 h-16 rounded-2xl border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000] shrink-0"
              style={{ backgroundColor: swag.color }}
            >
              {swag.icon}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                {swag.badge}
              </span>
              <h3 className="text-xl font-black text-black leading-snug">
                {swag.title}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-black/60 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                {swag.criteria}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#FEF0C7] rounded-3xl border-3 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] mb-8 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl font-black text-black mb-2">
          Fair Play & Code of Conduct
        </h3>
        <p className="text-xs sm:text-sm font-bold text-black/75 mb-6 leading-relaxed">
          DevFest Ranchi promotes inclusive, collaborative learning. All submissions are monitored against unfair multi-accounting. Enjoy the challenges, learn something new, and support your fellow developers!
        </p>
        <Link to="/">
          <NeoButton variant="dark" size="md">
            Jump to Quiz Catalog
          </NeoButton>
        </Link>
      </div>
    </div>
  );
};
