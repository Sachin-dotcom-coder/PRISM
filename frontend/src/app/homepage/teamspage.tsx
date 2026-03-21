"use client";

import React from "react";
import useSWR from "swr";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TeamsPage() {
  const { gender } = useGender();
  const { data: teams, error } = useSWR(`/api/homepage-leaderboard?gender=${gender}`, fetcher, {
    refreshInterval: 10000,
  });

  const departments = ["ECE", "CSE", "AI", "MECH", "CHE", "CE", "EE", "SCI", "MBA"];
  const marqueeContent = Array(4).fill(departments).flat();

  const validTeams = Array.isArray(teams) ? teams : [];

  return (
    <section id="teams" className="relative w-full h-auto bg-[#000000] pt-[15vh] pb-[8vh] overflow-hidden">
      
      <h2 className="text-center font-sans font-[900] text-5xl md:text-6xl uppercase tracking-[0.4em] text-[#FFBF00] mb-12 drop-shadow-[0_0_15px_rgba(255,191,0,0.4)]">
        TEAMS
      </h2>

      <div className="relative w-full border-y border-[rgba(255,191,0,0.3)] py-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex items-center w-full animate-marquee-slow hover:[animation-play-state:paused] group pb-2">
          {marqueeContent.map((dept, idx) => (
            <React.Fragment key={idx}>
              <span className="mx-6 md:mx-10 font-sans text-3xl md:text-4xl font-[800] text-white transition-all duration-300 snap-center shrink-0
                               hover:scale-110 hover:text-[#FFBF00] hover:drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]">
                {dept}
              </span>
              {idx < marqueeContent.length - 1 && (
                <span className="text-[#FFBF00] text-2xl md:text-3xl font-bold opacity-60 shrink-0">
                  |
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes

      {/* --- Live Score Horizontal Bars --- */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 px-[5vw] mt-12 mb-4" id="live-score">
        {/* Football Bar */}
        <div className="w-full bg-[rgba(20,20,20,0.8)] border border-[rgba(255,191,0,0.4)] py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between rounded-sm shadow-[0_0_15px_rgba(255,191,0,0.05)] transition-all hover:border-[#FFBF00] hover:shadow-[0_0_20px_rgba(255,191,0,0.15)]">
           <span className="text-[#FFBF00] font-bold tracking-[0.3em] text-xs md:text-sm mb-2 md:mb-0">FOOTBALL</span>
           <span className="text-white font-[800] tracking-widest text-lg md:text-xl">ECE <span className="mx-2 md:mx-4 text-zinc-500 text-sm font-bold">VS</span> CSE</span>
           <div className="flex items-center gap-6 mt-2 md:mt-0">
               <span className="text-zinc-400 text-xs md:text-sm tracking-widest font-mono">78'</span>
               <span className="text-white font-mono text-xl md:text-2xl font-bold">2 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">1</span></span>
           </div>
        </div>

        {/* Cricket Bar */}
        <div className="w-full bg-[rgba(20,20,20,0.8)] border border-[rgba(255,191,0,0.4)] py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between rounded-sm shadow-[0_0_15px_rgba(255,191,0,0.05)] transition-all hover:border-[#FFBF00] hover:shadow-[0_0_20px_rgba(255,191,0,0.15)]">
           <span className="text-[#FFBF00] font-bold tracking-[0.3em] text-xs md:text-sm mb-2 md:mb-0">CRICKET</span>
           <span className="text-white font-[800] tracking-widest text-lg md:text-xl">MECH <span className="mx-2 md:mx-4 text-zinc-500 text-sm font-bold">VS</span> AI</span>
           <div className="flex items-center gap-6 mt-2 md:mt-0">
               <span className="text-zinc-400 text-xs md:text-sm tracking-widest font-mono">14.2 Ov</span>
               <span className="text-[#FFBF00] font-mono text-xl md:text-2xl font-bold drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">134/4</span>
           </div>
        </div>

        {/* Kabaddi Bar */}
        <div className="w-full bg-[rgba(20,20,20,0.8)] border border-[rgba(255,191,0,0.4)] py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between rounded-sm shadow-[0_0_15px_rgba(255,191,0,0.05)] transition-all hover:border-[#FFBF00] hover:shadow-[0_0_20px_rgba(255,191,0,0.15)]">
           <span className="text-[#FFBF00] font-bold tracking-[0.3em] text-xs md:text-sm mb-2 md:mb-0">KABADDI</span>
           <span className="text-white font-[800] tracking-widest text-lg md:text-xl">CHE <span className="mx-2 md:mx-4 text-zinc-500 text-sm font-bold">VS</span> EEE</span>
           <div className="flex items-center gap-6 mt-2 md:mt-0">
               <span className="text-zinc-400 text-xs md:text-sm tracking-widest font-mono">2nd Half 14:12</span>
               <span className="text-white font-mono text-xl md:text-2xl font-bold">42 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">38</span></span>
           </div>
        </div>
      </div>

      <div className="px-[5vw] py-[8vh]">
        <h3 className="font-sans font-[800] text-xl uppercase tracking-widest text-[#FFBF00] mb-6">
          CURRENT STANDINGS
        </h3>
        
        <div className="w-full max-w-5xl mx-auto flex flex-col">
          <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] border-b-2 border-[#FFBF00] pb-3 mb-2 text-[0.85rem] text-white opacity-60 tracking-wider">
            <span className="text-center">#</span>
            <span>TEAM</span>
            <span className="text-center text-4xl">🥇</span>
            <span className="text-center text-4xl">🥈</span>
            <span className="text-center text-4xl">🥉</span>
            <span className="text-center flex items-center justify-center">POINTS</span>
          </div>

          {error && <div className="p-10 text-center text-red-500">Failed to load leaderboard.</div>}
          {!teams && !error && <div className="p-10 text-center text-zinc-500 animate-pulse">Loading standings...</div>}
          {teams && validTeams.length === 0 && (
            <div className="p-10 text-center text-zinc-500">No data available. Add teams in Admin Panel.</div>
          )}

          {validTeams.map((team: any, idx) => (
            <div 
              key={team._id || idx}
              className={`grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] items-center py-4 px-2 transition-all duration-300
                          hover:bg-[rgba(255,191,0,0.08)] hover:text-opacity-100 text-white text-opacity-80
                          border-b border-[rgba(255,191,0,0.1)] 
                          ${idx === 0 ? "border-l-[4px] border-l-[#FFBF00] bg-[rgba(255,191,0,0.03)]" : "border-l-[4px] border-transparent"}`}
            >
              <span className="text-center font-mono opacity-60">{idx + 1}</span>
              <span className="font-[800] text-lg tracking-wider md:text-xl">{team.name}</span>
              <span className="text-center font-mono text-xl opacity-90">{team.First ?? 0}</span>
              <span className="text-center font-mono text-xl opacity-90">{team.Second ?? 0}</span>
              <span className="text-center font-mono text-xl opacity-90">{team.Third ?? 0}</span>
              <span className="text-center font-mono font-bold text-[#FFBF00] text-xl drop-shadow-[0_0_5px_rgba(255,191,0,0.3)]">{team.points ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[5vw] pb-[8vh]">
        <h3 className="font-sans font-[800] text-xl uppercase tracking-widest text-[#FFBF00] mb-6">
          PRIME FIXTURES
        </h3>
        
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
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

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    </section>
  );
}
