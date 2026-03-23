"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

// 1. Import the new SportsMenuOverlay from the same folder
import SportsMenuOverlay from "../homepage/sportsmenu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 2. Integrate the SportsMenuOverlay here */}
      <SportsMenuOverlay 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
      />

      <nav className={`fixed top-0 left-0 right-0 z-50 glass border-b h-24 flex items-center px-6 md:px-12 justify-between border-white/5`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-16 h-16">
            <img
              src="/prismtransparentlogo.png"
              alt="PRISM Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Links (Upgraded to text-gray-100 for that premium matte white visibility) */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-sm font-bold tracking-[0.2em] uppercase text-gray-100 hover:text-[#FFBF00] transition-colors drop-shadow-none">Home</Link>
          <Link href="/#teams" className="text-sm font-bold tracking-[0.2em] uppercase text-gray-100 hover:text-[#FFBF00] transition-colors drop-shadow-none">Teams</Link>
          <Link href="/#leaderboard" className="text-sm font-bold tracking-[0.2em] uppercase text-gray-100 hover:text-[#FFBF00] transition-colors drop-shadow-none">Leaderboard</Link>
          <Link href="/#about-prism" className="text-sm font-bold tracking-[0.2em] uppercase text-gray-100 hover:text-[#FFBF00] transition-colors drop-shadow-none">About Prism</Link>
          <Link href="/admin/leaderboard" className="text-sm font-bold tracking-[0.2em] uppercase text-gray-100 hover:text-[#FFBF00] transition-colors drop-shadow-none">Admin</Link>
        </div>

        {/* 3. This button now triggers the 16-sport overlay */}
        <button
          onClick={() => setIsOpen(true)}
          className={`p-2 -mr-2 transition-colors text-zinc-400 hover:text-white`}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>
    </>
  );
}