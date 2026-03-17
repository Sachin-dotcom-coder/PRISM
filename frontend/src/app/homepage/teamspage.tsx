"use client";

import React, { useEffect, useState } from "react";

export default function TeamsPage() {
  // --- Step 11: Department Population ---
  const departments = ["ECE", "CSE", "AI", "MECH", "CHE", "CE", "EE", "SCI", "MBA"];
  // Duplicate array 4 times to ensure it spans much wider than the viewport 
  // so the -50% CSS transform animation seamlessly loops.
  const marqueeContent = Array(4).fill(departments).flat();

  return (
    // --- Step 8: Teams Section Initialization & Transition ---
    // Objective: Create a seamless spatial transition with generous padding on Absolute Deep Black
    <section className="relative w-full h-auto bg-[#000000] pt-[15vh] pb-[8vh] overflow-hidden">
      
      {/* --- Step 9: Section Heading ("TEAMS") --- */}
      {/* Objective: Minimalist, aggressive header centered above the track (Sized up based on user request) */}
      <h2 className="text-center font-sans font-[900] text-5xl md:text-6xl uppercase tracking-[0.4em] text-[#FFBF00] mb-12 drop-shadow-[0_0_15px_rgba(255,191,0,0.4)]">
        TEAMS
      </h2>

      {/* --- Step 10: Infinite Scroll Track (Now Manual Swipe Track) --- */}
      {/* Track Setup: Full width wrappers with glow borders and Vignette Effect masks */}
      <div className="relative w-full border-y border-[rgba(255,191,0,0.3)] py-6 
                      [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        
        {/* Reverted back to automatic continuous scrolling (slower) with pause on hover */}
        <div className="flex items-center w-full animate-marquee-slow hover:[animation-play-state:paused] group pb-2">
          {marqueeContent.map((dept, idx) => (
            <React.Fragment key={idx}>
              {/* Scaled down text per user request */}
              <span className="mx-6 md:mx-10 font-sans text-3xl md:text-4xl font-[800] text-white transition-all duration-300 snap-center shrink-0
                               hover:scale-110 hover:text-[#FFBF00] hover:drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]">
                {dept}
              </span>
              
              {/* Visual Divider (Straight vertical bar per user request) */}
              {idx < marqueeContent.length - 1 && (
                <span className="text-[#FFBF00] text-2xl md:text-3xl font-bold opacity-60 shrink-0">
                  |
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* --- Step 13: The Department Leaderboard (Data Grid) --- */}
      <div className="px-[5vw] py-[8vh]">
        <h3 className="font-sans font-[800] text-xl uppercase tracking-widest text-[#FFBF00] mb-6">
          CURRENT STANDINGS
        </h3>
        
        <div className="w-full max-w-5xl mx-auto flex flex-col">
          {/* Header Row - Replaced Played/Won/Lost with Medals */}
          <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] border-b-2 border-[#FFBF00] pb-3 mb-2 text-[0.85rem] text-white opacity-60 tracking-wider">
            <span className="text-center">#</span>
            <span>TEAM</span>
            <span className="text-center text-4xl">🥇</span>
            <span className="text-center text-4xl">🥈</span>
            <span className="text-center text-4xl">🥉</span>
            <span className="text-center flex items-center justify-center">POINTS</span>
          </div>

          {/* Data Rows - Updated to render mock medal counts instead of Win/Loss */}
          {[
            { name: "ECE", g: 5, s: 2, b: 1, pts: 18 },
            { name: "CSE", g: 4, s: 3, b: 2, pts: 16 },
            { name: "AI", g: 3, s: 4, b: 1, pts: 14 },
            { name: "MECH", g: 2, s: 3, b: 3, pts: 12 },
            { name: "CHE", g: 2, s: 2, b: 2, pts: 10 },
            { name: "CE", g: 1, s: 3, b: 4, pts: 10 },
            { name: "EE", g: 1, s: 2, b: 3, pts: 8 },
            { name: "SCI", g: 0, s: 3, b: 3, pts: 6 },
            { name: "MBA", g: 0, s: 0, b: 2, pts: 2 },
          ].map((team, idx) => (
            <div 
              key={team.name}
              className={`grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] items-center py-4 px-2 transition-all duration-300
                          hover:bg-[rgba(255,191,0,0.08)] hover:text-opacity-100 text-white text-opacity-80
                          border-b border-[rgba(255,191,0,0.1)] 
                          ${idx === 0 ? "border-l-[4px] border-l-[#FFBF00] bg-[rgba(255,191,0,0.03)]" : "border-l-[4px] border-transparent"}`}
            >
              {/* Serial Number */}
              <span className="text-center font-mono opacity-60">{idx + 1}</span>
              <span className="font-[800] text-lg tracking-wider md:text-xl">{team.name}</span>
              <span className="text-center font-mono text-xl opacity-90">{team.g}</span>
              <span className="text-center font-mono text-xl opacity-90">{team.s}</span>
              <span className="text-center font-mono text-xl opacity-90">{team.b}</span>
              <span className="text-center font-mono font-bold text-[#FFBF00] text-xl drop-shadow-[0_0_5px_rgba(255,191,0,0.3)]">{team.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Step 14: Prime Fixtures (High-Stakes Matchup Cards) --- */}
      <div className="px-[5vw] pb-[8vh]">
        <h3 className="font-sans font-[800] text-xl uppercase tracking-widest text-[#FFBF00] mb-6">
          PRIME FIXTURES
        </h3>
        
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Matchup Card 1 */}
          <div className="flex-1 bg-[rgba(20,20,20,0.4)] border border-[#1A1A1A] rounded-[4px] p-6 text-center
                          transition-all duration-300 hover:-translate-y-[5px] hover:border-[#FFBF00] 
                          hover:shadow-[0_10px_30px_rgba(255,191,0,0.15)] group cursor-pointer">
            <div className="text-[#FFBF00] text-[0.7rem] tracking-[0.3em] font-bold mb-4">FOOTBALL</div>
            <div className="flex items-center justify-center gap-6 mb-4">
              <span className="text-white text-3xl font-[800] tracking-widest group-hover:text-[#FFBF00] transition-colors">ECE</span>
              <span className="text-[#FFBF00] text-lg font-bold drop-shadow-[0_0_8px_rgba(255,191,0,0.6)]">VS</span>
              <span className="text-white text-3xl font-[800] tracking-widest group-hover:text-[#FFBF00] transition-colors">CSE</span>
            </div>
            <div className="text-white text-opacity-50 text-[0.8rem] tracking-wider">
              18:00 HRS | MAIN GROUND
            </div>
          </div>

          {/* Matchup Card 2 */}
          <div className="flex-1 bg-[rgba(20,20,20,0.4)] border border-[#1A1A1A] rounded-[4px] p-6 text-center
                          transition-all duration-300 hover:-translate-y-[5px] hover:border-[#FFBF00] 
                          hover:shadow-[0_10px_30px_rgba(255,191,0,0.15)] group cursor-pointer">
            <div className="text-[#FFBF00] text-[0.7rem] tracking-[0.3em] font-bold mb-4">CRICKET</div>
            <div className="flex items-center justify-center gap-6 mb-4">
              <span className="text-white text-3xl font-[800] tracking-widest group-hover:text-[#FFBF00] transition-colors">MECH</span>
              <span className="text-[#FFBF00] text-lg font-bold drop-shadow-[0_0_8px_rgba(255,191,0,0.6)]">VS</span>
              <span className="text-white text-3xl font-[800] tracking-widest group-hover:text-[#FFBF00] transition-colors">AI</span>
            </div>
            <div className="text-white text-opacity-50 text-[0.8rem] tracking-wider">
              14:00 HRS | SVNIT CRICKET PITCH
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
