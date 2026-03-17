/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FootballLeaderboard from "@/app/components/FootballLeaderboard";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  UPCOMING:     { text: "Upcoming",    color: "text-zinc-500" },
  FIRST_HALF:   { text: "1st Half",   color: "text-green-400" },
  HALF_TIME:    { text: "Half Time",  color: "text-yellow-400" },
  SECOND_HALF:  { text: "2nd Half",   color: "text-green-400" },
  COMPLETED:    { text: "FT",         color: "text-zinc-400" },
};

const FILTERS = ["ALL", "LIVE", "UPCOMING", "COMPLETED"];

export default function FootballPage() {
  const { gender } = useGender();
  const { data: matches, error } = useSWR(`/api/football/matches?gender=${gender}`, fetcher, { refreshInterval: 10000 });
  const [filter, setFilter] = useState("ALL");

  const allMatches = Array.isArray(matches) ? matches : [];

  const filtered = allMatches.filter((m: any) => {
    if (filter === "ALL") return true;
    if (filter === "LIVE") return ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"].includes(m.status);
    if (filter === "UPCOMING") return m.status === "UPCOMING";
    if (filter === "COMPLETED") return m.status === "COMPLETED";
    return true;
  });

  const isLive = (status: string) => ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"].includes(status);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="font-sports text-4xl md:text-5xl tracking-wide glow-text">Football</h1>
        <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">PRISM 2026 · Live Scores</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Matches */}
        <div className="flex-1 space-y-5">
          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-zinc-800 pb-px">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2.5 text-sm font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
                  filter === f
                    ? "text-accent border-b-2 border-accent"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Match cards */}
          {error && <div className="p-6 text-center text-red-400">Failed to load matches.</div>}
          {!matches && <div className="p-6 text-center text-zinc-500 animate-pulse">Loading matches...</div>}

          <AnimatePresence mode="popLayout">
            {filtered.length === 0 && matches && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center text-zinc-600">
                No {filter.toLowerCase()} matches yet.
              </motion.div>
            )}

            {filtered.map((match: any) => {
              const live = isLive(match.status);
              const sl = STATUS_LABEL[match.status] || { text: match.status, color: "text-zinc-500" };

              return (
                <motion.div key={match.match_id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Link href={`/football/${match.match_id}`}>
                    <div className={`glass p-6 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden ${
                      live ? "border-green-500/30 hover:border-green-400/50" : "border-zinc-800 hover:border-accent/40 hover:bg-zinc-900/40"
                    }`}>
                      {live && <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 blur-2xl rounded-full" />}

                      {/* Match meta */}
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                          Match {match.match_id?.replace("FB", "")}
                        </span>
                        <div className="flex items-center gap-2">
                          {live && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                          )}
                          <span className={`text-xs font-bold tracking-widest uppercase ${sl.color}`}>{sl.text}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-left">
                          <div className="text-lg font-bold text-zinc-200 mb-1">{match.teams?.team1}</div>
                          <div className={`text-5xl font-sports tracking-widest ${live ? "glow-text text-white" : "text-zinc-300"}`}>
                            {match.score?.team1 ?? 0}
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 px-4">
                          <span className="text-zinc-700 font-sports text-2xl">—</span>
                          {match.status === "COMPLETED" && match.result?.winner && (
                            <span className="text-xs text-zinc-500">FT</span>
                          )}
                        </div>

                        <div className="flex-1 text-right">
                          <div className="text-lg font-bold text-zinc-200 mb-1">{match.teams?.team2}</div>
                          <div className={`text-5xl font-sports tracking-widest ${live ? "text-white" : "text-zinc-300"}`}>
                            {match.score?.team2 ?? 0}
                          </div>
                        </div>
                      </div>

                      {/* Goals preview */}
                      {match.goals?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2">
                          {match.goals.map((g: any, i: number) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              g.team === match.teams?.team1
                                ? "bg-accent/10 text-accent"
                                : "bg-zinc-800 text-zinc-400"
                            }`}>
                              ⚽ {g.player} <span className="opacity-50">({g.team})</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Result */}
                      {match.status === "COMPLETED" && match.result?.winner && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/50 text-center">
                          <span className="text-sm font-bold text-accent">🏆 {match.result.winner} wins!</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right — Leaderboard */}
        <div className="lg:w-80 xl:w-96">
          <div className="sticky top-24">
            <h3 className="font-sports text-lg mb-4 tracking-wide">Standings</h3>
            <FootballLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
