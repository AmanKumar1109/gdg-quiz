import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { QUIZ_CATEGORIES } from '../../data/mockQuizzes';
import { Search, X, Filter, Sparkles } from 'lucide-react';

export const QuizFilter = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredQuizzes,
    quizzes
  } = useQuiz();

  const difficulties = ['all', 'easy', 'medium', 'hard'];

  return (
    <div className="space-y-6 mb-8">
      {/* Category Pills Slider / Wrap */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {QUIZ_CATEGORIES.map(category => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-full font-black text-xs sm:text-sm tracking-tight border-2 border-black whitespace-nowrap transition-all duration-150 shrink-0
                ${isSelected
                  ? 'bg-[#111111] text-white shadow-[3px_3px_0px_0px_#FFE600] -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#FFE600] shadow-[2.5px_2.5px_0px_0px_#000] hover:-translate-y-0.5'
                }
              `}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Search & Difficulty Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        
        {/* Search input with bold neobrutal styling */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title, track, or tags (e.g. Gemini, Kotlin, React)..."
            className="w-full pl-11 pr-10 py-2.5 bg-[#FFFDF7] border-2 border-black rounded-xl font-bold text-sm text-black placeholder:text-black/40 focus:outline-none focus:bg-[#FFE600]/10 focus:border-[#4285F4] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black/60 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-black uppercase text-black/60 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Level:
          </span>
          <div className="flex gap-1.5 shrink-0">
            {difficulties.map(diff => {
              const active = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`
                    px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold uppercase transition-all
                    ${active
                      ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white text-black/70 hover:text-black hover:bg-gray-100'
                    }
                  `}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs font-bold text-black/60 px-1">
        <span>
          Showing <span className="text-black font-black">{filteredQuizzes.length}</span> of {quizzes.length} challenges
        </span>
        {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="text-[#EA4335] underline hover:text-black font-extrabold"
          >
            Reset Filters
          </button>
        )}
      </div>

    </div>
  );
};
