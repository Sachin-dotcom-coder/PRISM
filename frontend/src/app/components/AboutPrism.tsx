"use client";

import React from "react";

export default function AboutPrism() {
  return (
    <section id="about-prism" className="relative w-full bg-[#000000] py-24 px-[5vw] border-t border-white/10 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-16 md:gap-10">
        
        {/* === Left Side: Heading & Stats === */}
        <div className="w-full md:w-5/12 flex flex-col items-start text-left shrink-0">
          
          {/* Stacked Heading */}
          <div className="flex flex-col mb-10">
            <h2 className="font-[900] text-5xl md:text-7xl uppercase tracking-[0.25em] text-[#FFBF00] leading-tight drop-shadow-[0_0_15px_rgba(255,191,0,0.3)]">
              ABOUT
            </h2>
            <h2 className="font-[900] text-5xl md:text-7xl uppercase tracking-[0.25em] text-[#FFBF00] leading-tight drop-shadow-[0_0_15px_rgba(255,191,0,0.3)]">
              PRISM
            </h2>
          </div>

          {/* Sleek Stats (No boxes, thin vertical partitions) */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="flex flex-col">
              <span className="text-gray-100 text-2xl md:text-3xl font-bold tracking-widest mb-1">15</span>
              <span className="text-white/40 text-[0.65rem] md:text-xs uppercase tracking-[0.3em] font-semibold">Registered<br/>Sports</span>
            </div>
            
            <div className="h-12 w-[1px] bg-white/20"></div> {/* Sleek Partition */}
            
            <div className="flex flex-col">
              <span className="text-gray-100 text-2xl md:text-3xl font-bold tracking-widest mb-1">1K+</span>
              <span className="text-white/40 text-[0.65rem] md:text-xs uppercase tracking-[0.3em] font-semibold">Participating<br/>Athletes</span>
            </div>
            
            <div className="h-12 w-[1px] bg-white/20"></div> {/* Sleek Partition */}
            
            <div className="flex flex-col">
              <span className="text-gray-100 text-2xl md:text-3xl font-bold tracking-widest mb-1">1</span>
              <span className="text-white/40 text-[0.65rem] md:text-xs uppercase tracking-[0.3em] font-semibold">Ultimate<br/>Champion</span>
            </div>
          </div>
        </div>

        {/* === Right Side: Expanded Text Paragraph === */}
        <div className="w-full md:w-7/12 flex flex-col justify-center mt-2 md:mt-4">
          <p className="text-gray-300 leading-relaxed text-base md:text-lg font-normal tracking-wide text-justify md:text-left">
            PRISM is the premier sports festival of SVNIT, a grand celebration of athleticism, teamwork, and unyielding spirit. 
            Bringing together the brightest and most talented athletes across departments, PRISM transcends beyond mere competition—it is a legacy of passion.
            <br /><br />
            Established to foster camaraderie and test the limits of human endurance, this annual spectacle transforms the campus into a battleground of skill and agility. 
            From the roar of the crowd in the football stadium to the silent, calculated tension of the chess arena, every moment is forged in dedication. 
            <br /><br />
            This is where stars are born, rivalries are honored, and the ultimate department rises to claim the glory. Step into the arena, witness the dedication, and become part of the journey.
          </p>
        </div>

      </div>
    </section>
  );
}