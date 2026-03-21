"use client";

import React from "react";

interface SportScoreBarProps {
  sport: string;
  match: string;
  time?: string;
  score1: string | number;
  score2: string | number;
  battingTeam?: string;
  specialScore?: string;
}

export default function SportScoreBar({ sport, match, time, score1, score2, battingTeam, specialScore }: SportScoreBarProps) {
  const displayScore = specialScore || `${score1} - ${score2}`;
  const separator = match.toLowerCase().includes(" vs ") ? " vs " : " VS ";
  const parts = match.split(/\s+vs\s+/i);
  const isBatting = (team: string) => battingTeam && team.toLowerCase() === battingTeam.toLowerCase();

  const matchDisplay = parts.length === 2 ? (
    <>
      <span className={`font-black tracking-wider ${isBatting(parts[0]) ? "text-[#FFBF00]" : "text-white"}`}>{parts[0]}</span>
      <span className="text-zinc-500 mx-2 text-sm">VS</span>
      <span className={`font-black tracking-wider ${isBatting(parts[1]) ? "text-[#FFBF00]" : "text-white"}`}>{parts[1]}</span>
    </>
  ) : (
    <span className="font-black tracking-wider text-white">{match}</span>
  );

  const battingLabel = battingTeam ? `${battingTeam} batting` : undefined;

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
          {battingLabel && (
            <span className="text-[#FFBF00] font-bold text-xs tracking-widest uppercase hidden md:inline">
              {battingLabel}
            </span>
          )}
          <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-sm border border-white/10">
            <span className="text-[#FFBF00] font-black text-3xl tracking-tighter">
              {displayScore}
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
