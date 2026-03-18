"use client";

import React from "react";
import Link from "next/link";
import { Youtube, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-[#1A1A1A] py-8 px-[5vw] flex flex-col md:flex-row items-center justify-between z-10 relative">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <img src="/prismtransparentlogo.png" alt="PRISM" className="w-10 h-10 object-contain" />
        <span className="text-[#FFBF00] font-[900] tracking-[0.3em] text-lg uppercase">PRISM '26</span>
      </div>
      
      <div className="flex space-x-6 text-zinc-500 text-sm tracking-widest uppercase font-bold mb-4 md:mb-0">
        <Link href="/#" className="hover:text-white transition-colors">Home</Link>
        <Link href="/#live-score" className="hover:text-white transition-colors">Scores</Link>
        <Link href="/#teams" className="hover:text-white transition-colors">Teams</Link>
      </div>

      <div className="flex space-x-4 text-zinc-500">
        <a href="#" className="hover:text-[#FFBF00] transition-colors"><Instagram className="w-5 h-5" /></a>
        <a href="#" className="hover:text-[#FFBF00] transition-colors"><Twitter className="w-5 h-5" /></a>
        <a href="#" className="hover:text-[#FFBF00] transition-colors"><Youtube className="w-5 h-5" /></a>
      </div>
    </footer>
  );
}
