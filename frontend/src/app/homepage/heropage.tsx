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

<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
      {/* --- Step 4: The Live Score Ticker Component --- */}
      {/* Step 19: mask-image applied for edge fade so text smoothly dissolves at screen boundaries */}
      <div
        className="absolute top-[120px] left-0 w-full bg-black/60 backdrop-blur-md py-4 z-40 overflow-hidden border-y border-white/20"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
         <div className="marquee-content inline-block text-xs md:text-sm tracking-[0.3em] font-mono whitespace-nowrap flex items-center">
            <span className="mx-12 text-white font-bold">FOOTBALL : ECE VS CSE | 78' | <span className="text-[#FFBF00] text-lg font-black">2 - 1</span></span>
            <span className="mx-12 text-white font-bold">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00] text-lg font-black">134/4</span></span>
            <span className="mx-12 text-white font-bold">KABADDI : CHE vs EEE | 2nd Half 14:12 | <span className="text-[#FFBF00] text-lg font-black">42 - 38</span></span>
            <span className="mx-12 text-white font-bold">FOOTBALL : ECE VS CSE | 78' | <span className="text-[#FFBF00] text-lg font-black">2 - 1</span></span>
            <span className="mx-12 text-white font-bold">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00] text-lg font-black">134/4</span></span>
         </div>
      </div>
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes


      {/* === Step 17: Ambient Particle Sparks === */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <div className="particle p1" /><div className="particle p2" /><div className="particle p3" />
        <div className="particle p4" /><div className="particle p5" /><div className="particle p6" />
        <div className="particle p7" /><div className="particle p8" /><div className="particle p9" />
        <div className="particle p10" />
      </div>


      {/* --- Step 8: Left Hemisphere Silhouette Asset (Football) --- */}
      <div className="absolute left-[2%] top-[70%] -translate-y-[60%] w-[25vw] max-w-[400px] z-10 pointer-events-none opacity-80 mix-blend-screen">
        <img 
          src="/football.png" 
          alt="Football Player Silhouette" 
          className="w-full h-auto object-contain drop-shadow-[0_0_8px_rgba(255,191,0,0.15)]"
          style={{ filter: "contrast(1.5) brightness(0.8)" }}
        />
        {/* Watermark erasers */}
        <div className="absolute bottom-0 left-0 w-[60px] h-[25px] bg-black"></div>
        <div className="absolute bottom-0 right-0 w-[60px] h-[25px] bg-black"></div>
      </div>

      {/* --- Step 9: Right Hemisphere Silhouette Asset (Cricket) --- */}
      <div className="absolute right-[2%] top-[70%] -translate-y-[60%] w-[25vw] max-w-[400px] z-10 pointer-events-none opacity-80 mix-blend-screen">
        <img 
          src="/cricket.png" 
          alt="Cricket Player Silhouette" 
          className="w-full h-auto object-contain drop-shadow-[0_0_8px_rgba(255,191,0,0.15)]"
          style={{ filter: "contrast(1.5) brightness(0.8)" }}
        />
        {/* Watermark erasers */}
        <div className="absolute bottom-0 left-0 w-[60px] h-[25px] bg-black"></div>
        <div className="absolute bottom-0 right-0 w-[60px] h-[25px] bg-black"></div>
      </div>

      {/* --- Step 5: Hero Page Core Content (PRISM 2026) --- */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-20">
        {/* === Step 15: Gradient Title + Neon Glow === */}
        <div className="text-center">
          <p className="text-[#FFBF00] text-xl md:text-2xl font-bold tracking-[0.3em] uppercase mb-4">
            University Premier League 2026
          </p>
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
            PRISM
          </h1>
          <p className="text-white/60 text-sm md:text-base tracking-[0.2em] font-medium mt-4 uppercase">
            Live scores, standings and match analytics
          </p>
        </div>

        {/* === CTA Button === */}
        <Link 
          href="/sports/cricket"
          className="mt-10 px-10 py-4 bg-gradient-to-b from-[#FFDF73] to-[#FFBF00] text-black font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,191,0,0.4)] active:scale-95"
          style={{
            clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
          }}
        >
          View Matches
        </Link>

        {/* === Event Metadata === */}
        <div className="mt-6 flex flex-col items-center gap-1 opacity-50">
          <span className="text-xs md:text-sm tracking-[0.35em] font-semibold text-white">SVNIT, SURAT</span>
          <span className="text-xs md:text-sm tracking-[0.35em] font-semibold text-white">30 - 31 MARCH</span>
        </div>
      </div>

    </div>
  );
}
