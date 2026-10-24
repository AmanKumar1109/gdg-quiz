import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

export const BannerStrip = () => {
  return (
    <div className="w-full">
      {/* 4-color Google bar */}
      <div className="h-2 w-full flex">
        <div className="w-1/4 bg-[#4285F4]"></div>
        <div className="w-1/4 bg-[#EA4335]"></div>
        <div className="w-1/4 bg-[#FBBC04]"></div>
        <div className="w-1/4 bg-[#34A853]"></div>
      </div>

      {/* Marquee ticker */}
      <div className="bg-[#FFE600] border-b-[2.5px] border-black py-1.5 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center">
        <div className="animate-marquee flex items-center space-x-8">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-red-500 text-red-500 inline" />
            DEVQUIZ ARENA 2026 LIVE NOW
          </span>
          <span className="text-black/50">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-blue-600 text-blue-600 inline" />
            SOLVE QUICK QUESTIONS & WIN GDG HOODIES & SWAG KITS
          </span>
          <span className="text-black/50">•</span>
          <span>VENUE: RADISSON BLU HOTEL, RANCHI</span>
          <span className="text-black/50">•</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-sm">ANYBODY CAN CODE</span>
          <span className="text-black/50">•</span>
          <span>GOOGLE DEVELOPER GROUPS RANCHI</span>
          <span className="text-black/50">•</span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-red-500 text-red-500 inline" />
            DEVQUIZ ARENA 2026 LIVE NOW
          </span>
          <span className="text-black/50">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-blue-600 text-blue-600 inline" />
            SOLVE QUICK QUESTIONS & WIN GDG HOODIES & SWAG KITS
          </span>
          <span className="text-black/50">•</span>
          <span>VENUE: RADISSON BLU HOTEL, RANCHI</span>
          <span className="text-black/50">•</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-sm">ANYBODY CAN CODE</span>
        </div>
      </div>
    </div>
  );
};
