"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useGender } from "@/app/components/Providers";

// 1. Import the new SportsMenuOverlay from the same folder
import SportsMenuOverlay from "../homepage/sportsmenu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { gender } = useGender();

  return (
    <>
      {/* 2. Integrate the SportsMenuOverlay here */}
      <SportsMenuOverlay 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
      />

      <nav className={`fixed top-0 left-0 right-0 z-50 glass border-b h-24 flex items-center px-6 md:px-12 justify-between ${gender === 'f' ? 'border-zinc-200 bg-white/50 text-zinc-900' : 'border-white/5'}`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-16 h-16">
            <img
              src="/prismtransparentlogo.png"
              alt="PRISM Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-[0.7rem] font-bold tracking-[0.3em] uppercase hover:text-[#FFBF00] transition-colors">Home</Link>
          <Link href="/#teams" className="text-[0.7rem] font-bold tracking-[0.3em] uppercase hover:text-[#FFBF00] transition-colors">Teams</Link>
          <Link href="/#scores" className="text-[0.7rem] font-bold tracking-[0.3em] uppercase hover:text-[#FFBF00] transition-colors">Live Score</Link>
          <Link href="/#leaderboard" className="text-[0.7rem] font-bold tracking-[0.3em] uppercase hover:text-[#FFBF00] transition-colors">Leaderboard</Link>
          <Link href="/#about" className="text-[0.7rem] font-bold tracking-[0.3em] uppercase hover:text-[#FFBF00] transition-colors">About Prism</Link>
          <Link href="/admin/leaderboard" className="text-[0.7rem] font-bold tracking-[0.3em] uppercase hover:text-[#FFBF00] transition-colors">Admin</Link>
        </div>

        {/* 3. This button now triggers the 16-sport overlay */}
        <button
          onClick={() => setIsOpen(true)}
          className={`p-2 -mr-2 transition-colors ${gender === 'f' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>
    </>
  );
}