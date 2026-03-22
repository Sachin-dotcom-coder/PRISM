"use client";

import React from "react";
import Link from "next/link";
import { Youtube, Instagram, Twitter, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#000000] border-t border-white/5 pt-12 pb-6 px-[5vw] z-10 relative overflow-hidden font-sans">
      
      {/* Subtle Ambient Glow behind logo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-10">
        
        {/* Column 1: Brand & Identity */}
        <div className="flex flex-col items-start space-y-4 md:col-span-1">
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

        {/* Column 2: Quick Links (No Header) */}
        <div className="flex flex-col space-y-3 pt-2">
          <Link href="/" className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors">Home</Link>
          <Link href="/#teams" className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors">Teams</Link>
          <Link href="/#scores" className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors">Live Scores</Link>
          <Link href="/guidelines" className="text-white text-sm tracking-widest uppercase font-bold hover:text-[#FFBF00] transition-colors">Guidelines</Link>
        </div>

        {/* Column 3: Contact/Venue */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-[#FFBF00] text-xs font-black uppercase tracking-[0.3em] mb-1">Venue</h4>
          <div className="flex items-center gap-3 text-white transition-colors cursor-default group">
            <MapPin className="w-4 h-4 text-[#FFBF00]" />
            <span className="text-sm tracking-wider uppercase font-semibold">SVNIT, Surat</span>
          </div>
          <div className="flex items-center gap-3 text-white hover:text-[#FFBF00] transition-colors group">
            <Mail className="w-4 h-4 text-[#FFBF00]" />
            <a href="mailto:prism@svnit.ac.in" className="text-sm tracking-wider uppercase font-semibold">prism@svnit.ac.in</a>
          </div>
        </div>

        {/* Column 4: Social Pulse */}
        <div className="flex flex-col space-y-5">
          <h4 className="text-[#FFBF00] text-xs font-black uppercase tracking-[0.3em] mb-1">Connect</h4>
          <div className="flex space-x-4">
            <a href="#" className="p-2.5 rounded-full border border-[#FFBF00]/20 bg-[#FFBF00]/5 text-white hover:bg-[#FFBF00] hover:text-black transition-all duration-300">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2.5 rounded-full border border-[#FFBF00]/20 bg-[#FFBF00]/5 text-white hover:bg-[#FFBF00] hover:text-black transition-all duration-300">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2.5 rounded-full border border-[#FFBF00]/20 bg-[#FFBF00]/5 text-white hover:bg-[#FFBF00] hover:text-black transition-all duration-300">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/50 text-[0.65rem] tracking-[0.2em] uppercase font-bold">
          © 2026 <span className="text-[#FFBF00]">PRISM SVNIT</span>. All Rights Reserved.
        </p>
        <p className="text-white/50 text-[0.65rem] tracking-[0.2em] uppercase font-bold">
          Developed by <span className="text-white hover:text-[#FFBF00] transition-colors cursor-pointer">Student Council SVNIT</span>
        </p>
      </div>
    </footer>
  );
}