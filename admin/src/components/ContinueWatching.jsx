import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import gsap from "gsap";

export default function ContinueWatching() {
  const cardsRef = useRef([]);
  const [favorites, setFavorites] = useState([false, true, false]);

  useEffect(() => {
    // Elegant slide-up staggered transition
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const toggleFavorite = (idx, e) => {
    e.stopPropagation();
    const updated = [...favorites];
    updated[idx] = !updated[idx];
    setFavorites(updated);
  };

  const cardsData = [
    {
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=80",
      tag: "Front End",
      tagStyles: "bg-sky-50 text-sky-600",
      title: "Beginner's Guide to Becoming a Professional Front-End Developer",
      mentor: "Leonardo samsul",
      mentorInitial: "LS"
    },
    {
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&auto=format&fit=crop&q=80",
      tag: "UI/UX Design",
      tagStyles: "bg-indigo-50 text-brand-primary",
      title: "Optimizing User Experience with the Best UI/UX Design",
      mentor: "Bayu Salto",
      mentorInitial: "BS"
    },
    {
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80",
      tag: "Branding",
      tagStyles: "bg-pink-50 text-pink-600",
      title: "Reviving and Refreshing Company Image",
      mentor: "Padhang Satrio",
      mentorInitial: "PS"
    }
  ];

  const handleCardHover = (idx, enter) => {
    const card = cardsRef.current[idx];
    if (card) {
      const img = card.querySelector(".course-img");
      gsap.to(card, {
        y: enter ? -4 : 0,
        boxShadow: enter ? "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" : "0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        duration: 0.25,
        ease: "power1.out"
      });
      gsap.to(img, {
        scale: enter ? 1.04 : 1,
        duration: 0.3,
        ease: "power1.out"
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">Continue Watching</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors duration-150 cursor-pointer shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white hover:bg-brand-primary/95 transition-colors duration-150 cursor-pointer shadow-sm shadow-indigo-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cardsData.map((card, idx) => (
          <div
            key={idx}
            ref={(el) => (cardsRef.current[idx] = el)}
            onMouseEnter={() => handleCardHover(idx, true)}
            onMouseLeave={() => handleCardHover(idx, false)}
            className="bg-white border border-slate-100/80 rounded-[20px] p-3 flex flex-col shadow-sm cursor-pointer select-none overflow-hidden"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
              <img
                src={card.image}
                alt={card.title}
                className="course-img w-full h-full object-cover transition-transform duration-300"
              />
              {/* Heart Button Overlay */}
              <button
                onClick={(e) => toggleFavorite(idx, e)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors duration-150 shadow-sm cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${favorites[idx] ? "fill-rose-500 text-rose-500" : ""}`}
                />
              </button>
            </div>

            {/* Tag */}
            <div className="px-1">
              <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${card.tagStyles}`}>
                {card.tag}
              </span>
              {/* Title */}
              <h4 className="text-xs font-bold text-slate-800 mt-2 mb-4 leading-snug line-clamp-2 h-8">
                {card.title}
              </h4>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100/60 my-2" />

            {/* Mentor Info */}
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0 border border-slate-100">
                {card.mentorInitial}
              </div>
              <div className="min-w-0">
                <h5 className="text-[10px] font-bold text-slate-700 truncate">{card.mentor}</h5>
                <p className="text-[9px] text-slate-400 font-medium leading-none">Mentor</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
