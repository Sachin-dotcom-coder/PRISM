"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGender } from "@/app/components/Providers";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { gender } = useGender();

  const sports = [
    {
      name: "Cricket",
      href: "/sports/cricket",
      icon: "/Cricket.jpeg",
      accent: "#6366f1",          // indigo
      glow: "rgba(99,102,241,0.25)",
    },
    {
      name: "Football",
      href: "/sports/football",
      icon: "/Football2.png",
      accent: "#4ade80",          // green
      glow: "rgba(74,222,128,0.20)",
    },
  ];

  return (
    <>
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

        <button
          onClick={() => setIsOpen(true)}
          className={`p-2 -mr-2 transition-colors ${gender === 'f' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* --- Live Score Ticker (Global) --- */}
      <div
        className="fixed top-24 left-0 w-full bg-[rgba(20,20,20,0.9)] py-4 z-40 overflow-hidden border-y-2 border-white"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      >
         <div className="marquee-content inline-block text-sm md:text-base tracking-widest font-mono font-bold whitespace-nowrap flex items-center">
            {/* Duplicate content to create seamless infinite scroll */}
            <span className="mx-8 text-white">FOOTBALL : ECE VS CSE | 78' | 2 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">1</span></span>
            <span className="mx-8 text-white">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">134/4</span></span>
            <span className="mx-8 text-white">KABADDI : CHE vs EEE | 2nd Half 14:12 | 42 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">38</span></span>
            <span className="mx-8 text-white">FOOTBALL : ECE VS CSE | 78' | 2 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">1</span></span>
            <span className="mx-8 text-white">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">134/4</span></span>
            <span className="mx-8 text-white">KABADDI : CHE vs EEE | 2nd Half 14:12 | 42 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">38</span></span>
            <span className="mx-8 text-white">FOOTBALL : ECE VS CSE | 78' | 2 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">1</span></span>
            <span className="mx-8 text-white">CRICKET : AI vs MECH | 14.2 Ov | <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">134/4</span></span>
            <span className="mx-8 text-white">KABADDI : CHE vs EEE | 2nd Half 14:12 | 42 - <span className="text-[#FFBF00] drop-shadow-[0_0_8px_rgba(255,191,0,0.8)]">38</span></span>
         </div>
      </div>

      {/* Full-page overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[60] backdrop-blur-xl flex flex-col ${gender === 'f' ? 'bg-white/95 text-zinc-900' : 'bg-black/95 text-white'}`}
          >
            {/* Top bar */}
            <div className={`h-16 flex items-center justify-between px-6 md:px-12 border-b ${gender === 'f' ? 'border-zinc-200' : 'border-white/5'}`}>
              <span className={`font-sports text-xl tracking-wide uppercase mt-1 ${gender === 'f' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 -mr-2 transition-colors ${gender === 'f' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sport cards */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 overflow-y-auto">
              <span className="text-zinc-500 text-xs font-semibold tracking-widest uppercase">
                Select a Sport
              </span>

              <div className="flex flex-row gap-16 items-end justify-center">
                {sports.map((sport) => (
                  <motion.button
                    key={sport.name}
                    onClick={() => { setIsOpen(false); router.push(sport.href); }}
                    whileHover={{ y: -16, filter: "drop-shadow(0 20px 32px " + sport.glow + ")" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="flex flex-col items-center gap-4 cursor-pointer group outline-none"
                  >
                    <img
                      src={sport.icon}
                      alt={sport.name}
                      className="w-32 h-32 object-contain drop-shadow-2xl select-none"
                      draggable={false}
                    />
                    <span
                      className="font-sports text-2xl tracking-widest uppercase"
                      style={{ color: sport.accent }}
                    >
                      {sport.name}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Navigation links */}
              <div className="mt-8 flex gap-12 flex-wrap justify-center">
                <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-[#FFBF00] transition-colors">Home</Link>
                <Link href="/#teams" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-[#FFBF00] transition-colors">Teams</Link>
                <Link href="/#scores" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-[#FFBF00] transition-colors">Live Score</Link>
                <Link href="/#leaderboard" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-[#FFBF00] transition-colors">Leaderboard</Link>
                <Link href="/#about" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-[#FFBF00] transition-colors">About Prism</Link>
                <Link href="#" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-[#FFBF00] transition-colors">Contact</Link>
              </div>

              {/* Admin link */}
              <div className="mt-6">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium tracking-widest uppercase transition-colors ${gender === 'f' ? 'text-zinc-400 hover:text-zinc-900' : 'text-zinc-600 hover:text-[#FFBF00]'}`}
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
