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

      {/* === Step 17: Ambient Particle Sparks === */}
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
      <div className="relative z-10 flex flex-col items-center justify-center mt-24 font-sans w-full">
        
        {/* --- Top Sport Logos --- */}
        <div className="w-[85vw] md:w-[64vw] max-w-[1000px] max-h-[50px] md:max-h-[80px] mb-3 opacity-90 overflow-hidden transform scale-x-105">
          <img 
            src="/allsports1.png" 
            alt="Sports Icons Row 1" 
            className="w-full h-full object-contain brightness-110"
          />
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

        {/* --- Bottom Sport Logos --- */}
        <div className="w-[85vw] md:w-[64vw] max-w-[1000px] max-h-[50px] md:max-h-[80px] mt-3 opacity-90 overflow-hidden transform scale-x-105">
          <img 
            src="/allsports2.png" 
            alt="Sports Icons Row 2" 
            className="w-full h-full object-contain brightness-110"
          />
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
            className="w-64 md:w-72 py-4 bg-transparent border border-[#FFBF00] text-[#FFBF00] text-sm md:text-base font-normal uppercase tracking-[0.3em] rounded-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,191,0,0.3)] active:scale-95 text-center"
          >
            View Matches
          </Link>
        </div>
      </div>
    </div>
  );
}