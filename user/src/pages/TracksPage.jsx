import React from 'react';
import { QUIZ_CATEGORIES } from '../data/mockQuizzes';
import { useQuiz } from '../context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { NeoButton } from '../components/common/NeoButton';
import { ArrowRight, Sparkles, Layers, Cpu, Globe, Smartphone, ShieldCheck, Trophy } from 'lucide-react';

export const TracksPage = () => {
  const { setSelectedCategory, quizzes } = useQuiz();
  const navigate = useNavigate();

  const getIcon = (id) => {
    switch (id) {
      case 'beginner': return Sparkles;
      case 'conference': return Globe;
      case 'advanced': return Cpu;
      case 'booth': return Trophy;
      default: return Trophy;
    }
  };

  const getQuizCount = (catId) => {
    if (catId === 'booth') {
      return quizzes.filter(q => q.isBoothQuiz || q.boothId).length;
    }
    return quizzes.filter(q => q.category === catId || (q.track && q.track.toLowerCase().includes(catId.toLowerCase()))).length;
  };

  const handleTrackSelect = (catId) => {
    setSelectedCategory(catId);
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="bg-[#FFE600] px-4 py-1.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider inline-block mb-3 shadow-[2px_2px_0px_0px_#000]">
          DEVFEST 2026 OFFICIAL TRACKS
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-3">
          Explore Our 3 Official Tracks
        </h1>
        <p className="text-sm sm:text-base font-bold text-black/70">
          Compete in Beginner Track, Conference Track, Advanced Track, or challenge your skills at on-ground physical sponsor booths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {QUIZ_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
          const Icon = getIcon(cat.id);
          const count = getQuizCount(cat.id);
          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border-3 border-black p-6 sm:p-7 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full border-2 border-black text-xs font-black bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]">
                    {count} {count === 1 ? 'Quiz' : 'Quizzes'}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-black mb-2">
                  {cat.label}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/70 mb-6">
                  {cat.description || 'Hands-on quiz challenges curated by Google Developer Experts and GDG Ranchi track leads.'}
                </p>
              </div>

              <NeoButton
                variant="yellow"
                size="md"
                className="w-full"
                onClick={() => handleTrackSelect(cat.id)}
                icon={ArrowRight}
                iconPosition="right"
              >
                View Track Quizzes
              </NeoButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
