"use client";

import React, { useEffect, useState } from "react";
import "./hero.css";

export default function HeroPage() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden flex flex-col items-center justify-center font-sans text-white">
      
      {/* --- Taskbar Navigation --- */}
      <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-transparent">

        {/* Left: PRISM Logo — clickable, sized to fit taskbar */}
        <a href="#" className="flex items-center shrink-0 transition-opacity duration-300 hover:opacity-80">
          <img
            src="/prismtransparentlogo.png"
            alt="PRISM Logo"
            className="h-16 w-44 object-contain"
          />
        </a>

        {/* Center: Nav Links — absolutely centered so they never shift */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-14 items-center">
          <a href="#" className="text-white capitalize tracking-[0.2em] text-base font-semibold transition-all duration-300 hover:scale-[1.04] hover:text-[#FFBF00]">Home</a>
          <a href="#" className="text-white capitalize tracking-[0.2em] text-base font-semibold transition-all duration-300 hover:scale-[1.04] hover:text-[#FFBF00]">Teams</a>
          <a href="#" className="text-white capitalize tracking-[0.2em] text-base font-semibold transition-all duration-300 hover:scale-[1.04] hover:text-[#FFBF00]">Contact</a>
        </nav>

        {/* Right: Hamburger Menu */}
        <div
          className="relative z-[110] py-2"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          {/* Animated hamburger — morphs to X on hover */}
          <div className="group flex flex-col items-start gap-[6px] cursor-pointer">
            <span className="block h-[2px] w-8 bg-white origin-center transition-all duration-300 group-hover:bg-[#FFBF00] group-hover:rotate-45 group-hover:translate-y-[10px]"></span>
            <span className="block h-[2px] w-8 bg-white transition-all duration-300 group-hover:bg-[#FFBF00] group-hover:opacity-0 group-hover:scale-x-0"></span>
            <span className="block h-[2px] w-8 bg-white origin-center transition-all duration-300 group-hover:bg-[#FFBF00] group-hover:-rotate-45 group-hover:-translate-y-[10px]"></span>
          </div>

          {/* Dropdown — opens from top-right corner */}
          <div className={`absolute top-[40px] right-0 transition-all duration-500 flex flex-col gap-2 text-sm font-medium tracking-wide bg-[rgba(0,0,0,0.95)] p-6 pt-8 border-b border-l border-[#FFBF00]/40 backdrop-blur-sm ${menuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-[-10px]'}`}>
            <a href="#" className="flex items-center px-3 py-2 text-gray-200 transition-colors duration-300 hover:text-[#FFBF00] hover:bg-[#FFBF00]/10 rounded-sm">Events</a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-200 transition-colors duration-300 hover:text-[#FFBF00] hover:bg-[#FFBF00]/10 rounded-sm">Competitions</a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-200 transition-colors duration-300 hover:text-[#FFBF00] hover:bg-[#FFBF00]/10 rounded-sm">Contact</a>
          </div>
        </div>

      </header>

      {/* --- Step 4: The Live Score Ticker Component --- */}
      {/* Step 19: mask-image applied for edge fade so text smoothly dissolves at screen boundaries */}
      <div
        className="absolute top-[100px] left-0 w-full bg-[rgba(20,20,20,0.6)] py-2 z-40 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      >
         <div className="marquee-content inline-block text-xs md:text-sm tracking-widest font-mono whitespace-nowrap flex items-center">
            {/* Duplicate content to create seamless infinite scroll */}
            <span className="mx-8 text-white">FOOTBALL : ECE VS CSE | 78' | 2 - <span className="text-[#FFBF00]">1</span></span>
            <span className="mx-8 text-white">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00]">134/4</span></span>
            <span className="mx-8 text-white">KABADDI : CHE vs EEE | 2nd Half 14:12 | 42 - <span className="text-[#FFBF00]">38</span></span>
            <span className="mx-8 text-white">FOOTBALL : ECE VS CSE | 78' | 2 - <span className="text-[#FFBF00]">1</span></span>
            <span className="mx-8 text-white">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00]">134/4</span></span>
            <span className="mx-8 text-white">KABADDI : CHE vs EEE | 2nd Half 14:12 | 42 - <span className="text-[#FFBF00]">38</span></span>
            <span className="mx-8 text-white">FOOTBALL : ECE VS CSE | 78' | 2 - <span className="text-[#FFBF00]">1</span></span>
            <span className="mx-8 text-white">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00]">134/4</span></span>
            <span className="mx-8 text-white">KABADDI : CHE vs EEE | 2nd Half 14:12 | 42 - <span className="text-[#FFBF00]">38</span></span>
         </div>
      </div>


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

        {/* === CTA Container (chamfered corners) === */}
        <div
          className="mt-8 flex flex-col items-center gap-1"
          style={{
            clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
            border: "1px solid rgba(255,191,0,0.4)",
            padding: "20px 40px 22px",
          }}
        >
          <span className="text-base md:text-lg tracking-[0.35em] font-semibold text-white">SVNIT, SURAT</span>
          <span className="text-base md:text-lg tracking-[0.35em] font-semibold text-white">30 - 31 MARCH</span>
        </div>
      </div>

    </div>
  );
}
