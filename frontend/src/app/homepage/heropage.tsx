"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./hero.css";

import Navbar from "../components/Navbar";

export default function HeroPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden flex flex-col items-center justify-center font-sans text-white">
      <Navbar />

      {/* --- Step 4: The Live Score Ticker Component --- */}
      <div
        className="absolute top-[95px] left-0 w-full bg-black/50 backdrop-blur-md py-3 z-40 overflow-hidden border-y border-white/30"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
         <div className="marquee-content inline-block text-xs md:text-sm tracking-[0.25em] uppercase whitespace-nowrap flex items-center">
            <span className="mx-12 text-gray-100 font-medium">FOOTBALL : ECE VS CSE <span className="mx-3 text-white/40">|</span> 78' <span className="mx-3 text-white/40">|</span> <span className="text-[#FFBF00] text-sm md:text-base font-bold">2 - 1</span></span>
            <span className="mx-12 text-gray-100 font-medium">CRICKET : AI vs MECH <span className="mx-3 text-white/40">|</span> 14.2 Ov <span className="mx-3 text-white/40">|</span> <span className="text-[#FFBF00] text-sm md:text-base font-bold">134/4</span></span>
            <span className="mx-12 text-gray-100 font-medium">KABADDI : CHE vs EEE <span className="mx-3 text-white/40">|</span> 2nd Half 14:12 <span className="mx-3 text-white/40">|</span> <span className="text-[#FFBF00] text-sm md:text-base font-bold">42 - 38</span></span>
            <span className="mx-12 text-gray-100 font-medium">FOOTBALL : ECE VS CSE <span className="mx-3 text-white/40">|</span> 78' <span className="mx-3 text-white/40">|</span> <span className="text-[#FFBF00] text-sm md:text-base font-bold">2 - 1</span></span>
         </div>
      </div>

      {/* === FEATURE 1: Jumbo Transparent Outline Text === */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1] select-none w-full text-center flex justify-center items-center">
        <h1 
          className="text-[45vw] md:text-[32vw] font-black tracking-[-0.05em] leading-none uppercase"
          style={{
            WebkitTextStroke: "2px rgba(255, 191, 0, 0.12)",
            color: "transparent"
          }}
        >
          PRISM
        </h1>
      </div>

      {/* === FEATURE 3: Vertical Edge Typography (Hidden on mobile) === */}
      <div 
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 hidden md:block text-white/35 font-mono text-xs tracking-[0.4em] uppercase pointer-events-none select-none"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        /// ANNUAL SPORTS FESTIVAL
      </div>
      
      <div 
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 hidden md:block text-white/35 font-mono text-xs tracking-[0.4em] uppercase pointer-events-none select-none"
        style={{ writingMode: "vertical-rl" }}
      >
        EST. 2026 - SURAT, GUJARAT
      </div>

      {/* === Ambient Particle Sparks === */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <div className="particle p1" /><div className="particle p2" /><div className="particle p3" /><div className="particle p10" />
      </div>

      {/* --- Player Silhouettes --- */}
      <div className="absolute left-[2%] top-[70%] -translate-y-[60%] w-[25vw] max-w-[400px] z-10 pointer-events-none opacity-80 mix-blend-screen">
        <img src="/football.png" alt="Football" className="w-full h-auto object-contain" style={{ filter: "contrast(1.5) brightness(0.8)" }} />
        <div className="absolute bottom-0 left-0 w-[60px] h-[25px] bg-black"></div>
        <div className="absolute bottom-0 right-0 w-[60px] h-[25px] bg-black"></div>
      </div>

      <div className="absolute right-[2%] top-[70%] -translate-y-[60%] w-[25vw] max-w-[400px] z-10 pointer-events-none opacity-80 mix-blend-screen">
        <img src="/cricket.png" alt="Cricket" className="w-full h-auto object-contain" style={{ filter: "contrast(1.5) brightness(0.8)" }} />
        <div className="absolute bottom-0 left-0 w-[60px] h-[25px] bg-black"></div>
        <div className="absolute bottom-0 right-0 w-[60px] h-[25px] bg-black"></div>
      </div>

      {/* --- Step 5: Hero Page Core Content --- */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-24 font-sans w-full max-w-5xl px-8 py-10">
        
        {/* === FEATURE 2: HUD Elements (Corner Crosshairs) === */}
        {/* These stay locked perfectly in place! */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/30 pointer-events-none" />

        {/* === INNER CONTENT WRAPPER === */}
        {/* This div slides everything inside DOWN without moving the corners */}
        <div className="flex flex-col items-center w-full translate-y-6 md:translate-y-10">
          
          {/* === FEATURE 4: Micro-Data "System" Text === */}
          <div className="font-mono text-[0.6rem] md:text-xs tracking-[0.3em] md:tracking-[0.4em] text-[#FFBF00]/90 font-semibold mb-4 select-none">
            SYS.ONLINE // REG.OPEN // LAT.21.163°N
          </div>

          {/* === Gradient Title + Neon Glow === */}
          <div className="text-center relative z-10">
            <h1
              className="text-[12vw] md:text-[8vw] font-black tracking-[-0.05em] leading-none uppercase select-none"
              style={{
                background: "linear-gradient(180deg, #FFDF73 0%, #FFBF00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter:
                  "drop-shadow(0px 0px 15px rgba(255,191,0,0.4)) drop-shadow(0px 0px 40px rgba(255,191,0,0.25)) drop-shadow(0px 0px 80px rgba(255,191,0,0.12))",
              }}
            >
              PRISM 2026
            </h1>
          </div>

          {/* === Event Metadata & CTA Container === */}
          <div className="flex flex-col items-center gap-8 w-full max-w-sm mt-12">
            {/* Metadata: Same font size and Semi-Bold */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-xl md:text-2xl tracking-[0.4em] font-semibold text-[#FFBF00] uppercase drop-shadow-[0_0_12px_rgba(255,191,0,0.4)]">
                SVNIT, SURAT
              </span>
              <span className="text-xl md:text-2xl tracking-[0.4em] font-semibold text-[#FFBF00] uppercase drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]">
                2 - 5 APRIL
              </span>
            </div>

            <Link
              href="/sports/cricket"
              className="w-64 md:w-72 py-4 bg-transparent border border-[#FFBF00] text-[#FFBF00] text-sm md:text-base font-normal uppercase tracking-[0.3em] rounded-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,191,0,0.3)] hover:bg-[#FFBF00]/10 active:scale-95 text-center"
            >
              View Matches
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}