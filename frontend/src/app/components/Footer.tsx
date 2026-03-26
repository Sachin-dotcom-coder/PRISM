"use client";

import React from "react";
import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#000000] border-t border-white/5 pt-16 pb-8 px-[5vw] z-10 relative overflow-hidden font-sans">
      
      {/* Subtle Ambient Glow behind logo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
        
        {/* Column 1: Brand & Identity */}
        <div className="flex flex-col items-start space-y-6 md:col-span-1">
          <div className="flex items-center gap-4">
            <img src="/prismtransparentlogo.png" alt="PRISM" className="w-10 h-10 object-contain brightness-110" />
            <div className="flex flex-col">
              <span className="text-[#FFBF00] font-[900] tracking-[0.3em] text-xl uppercase leading-none">PRISM 2026</span>
              <span className="text-white/60 text-[0.6rem] tracking-[0.4em] uppercase mt-1 font-medium">SVNIT SURAT</span>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs font-medium">
            The ultimate battleground of SVNIT. Witness the legacy of sportsmanship, grit, and glory.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        {/* Added items-start so the button aligns perfectly to the left */}
        <div className="flex flex-col items-start space-y-5 pt-2">
          <Link href="/" className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors">Home</Link>
          <Link href="/teams" className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors">Teams</Link>
          
          {/* Changed from Link to a Button that triggers the global event */}
          <button 
            onClick={() => window.dispatchEvent(new Event("openSportsMenu"))}
            className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors text-left"
          >
            Live Scores
          </button>
        </div>

        {/* Column 3: Venue */}
        <div className="flex flex-col">
          <h4 className="text-[#FFBF00] text-xs font-black uppercase tracking-[0.3em] mb-5">Venue</h4>
          <div className="flex items-center gap-4 text-white transition-colors cursor-default group">
            <MapPin className="w-5 h-5 text-[#FFBF00]" />
            <span className="text-sm tracking-wider uppercase font-semibold">SVNIT, Surat</span>
          </div>
        </div>

        {/* Column 4: Social Pulse */}
        <div className="flex flex-col">
          <h4 className="text-[#FFBF00] text-xs font-black uppercase tracking-[0.3em] mb-5">Connect</h4>
          <div className="flex items-center gap-4">
            <span className="text-white text-sm tracking-widest uppercase font-bold">Instagram</span>
            <a 
              href="https://www.instagram.com/prism_svnit/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 rounded-full border border-[#FFBF00]/20 bg-[#FFBF00]/5 text-white hover:bg-[#FFBF00] hover:text-black transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex items-center justify-center">
        <p className="text-white/50 text-[0.65rem] tracking-[0.2em] uppercase font-bold text-center">
          © 2026 <span className="text-[#FFBF00]">PRISM SVNIT</span>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}