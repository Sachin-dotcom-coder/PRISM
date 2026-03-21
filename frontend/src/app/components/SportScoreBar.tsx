"use client";

import React from "react";

interface SportScoreBarProps {
  sport: string;
  match: string;
  time?: string;
  score1: string | number;
  score2: string | number;
}

export default function SportScoreBar({ sport, match, time, score1, score2 }: SportScoreBarProps) {
  return (
    <div className="w-full bg-black/40 border-y border-white/20 py-5 my-4 overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-8">
          <span className="text-white/40 font-mono text-xs tracking-[0.4em] uppercase">
            {sport}
          </span>
          <span className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase">
            {match}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {time && (
            <span className="text-white/40 font-mono text-xs tracking-widest hidden md:block">
              {time}
            </span>
          )}
          <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-sm border border-white/10">
            <span className="text-[#FFBF00] font-black text-3xl tracking-tighter">
              {score1}
            </span>
            <span className="text-white/20 font-light text-xl">-</span>
            <span className="text-[#FFBF00] font-black text-3xl tracking-tighter">
              {score2}
            </span>
          </div>
        </div>
      </div>

      {/* Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none" />
    </div>
  );
}
