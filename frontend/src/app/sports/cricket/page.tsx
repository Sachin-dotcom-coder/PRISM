/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Leaderboard from "@/app/components/Leaderboard";
import { motion, AnimatePresence } from "framer-motion";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CricketDashboard() {
  const { gender } = useGender();
  const [filter, setFilter] = useState<"LIVE" | "COMPLETED">("LIVE");
  
  // Real-time matches fetch
  const { data: matches, error } = useSWR(`/api/matches?gender=${gender}`, fetcher, {
    refreshInterval: 5000,
  });

  const filteredMatches = Array.isArray(matches) 
    ? matches.filter((match: any) => 
        filter === "LIVE" ? match.status === "LIVE" || match.status === "UPCOMING" : match.status === "COMPLETED"
      ) 
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 pb-20">
      
      {/* LEFT SIDE — MATCH LIST */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Toggle Filters */}
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-full border border-zinc-800 w-fit">
          <button
            onClick={() => setFilter("LIVE")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
              filter === "LIVE" 
                ? "bg-accent text-white shadow-neon" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Ongoing Games
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
              filter === "COMPLETED" 
                ? "bg-zinc-700 text-white" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {error && <div className="text-danger">Failed to load matches</div>}
            {!matches && <div className="text-zinc-500 animate-pulse">Loading games...</div>}
            
            {filteredMatches.map((match: any) => {
              const team1 = match.teams?.team1 || { name: "Team 1", shortName: "T1" };
              const team2 = match.teams?.team2 || { name: "Team 2", shortName: "T2" };
              
              // Use shortName if available, otherwise fall back to name, then generic T1/T2
              const t1Short = team1.shortName || team1.name || "T1";
              const t2Short = team2.shortName || team2.name || "T2";

              // Find innings to display score
              const t1Innings = match.innings?.find((i: any) => i.team === team1.name);
              const t2Innings = match.innings?.find((i: any) => i.team === team2.name);

              return (
                <motion.div
                  key={match.match_id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/match/${match.match_id}`}>
                    <div className="glass p-5 rounded-2xl border border-zinc-800 hover:border-accent/50 hover:bg-zinc-900/50 transition-all group cursor-pointer relative overflow-hidden">
                      
                      {match.status === "LIVE" && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-accentGlow blur-2xl rounded-full" />
                      )}

                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                          Match {match.match_id.slice(-3)}
                        </span>
                        <span className={`text-xs font-bold tracking-widest px-2 py-1 rounded bg-zinc-900 uppercase ${
                          match.status === "LIVE" ? "text-danger animate-pulse" : "text-zinc-500"
                        }`}>
                          {match.status}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Team 1 Score */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center text-xs font-sports">
                              {t1Short[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-lg text-zinc-100">{t1Short}</span>
                          </div>
                          <div className="text-right">
                            {t1Innings ? (
                              <div className="font-sports text-xl tracking-wider glow-text">
                                {t1Innings.runs}/{t1Innings.wickets} <span className="text-sm text-zinc-500 tracking-normal">({t1Innings.overs})</span>
                              </div>
                            ) : (
                              <span className="text-zinc-600 text-sm font-medium">Yet to bat</span>
                            )}
                          </div>
                        </div>

                        {/* Team 2 Score */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center text-xs font-sports">
                              {t2Short[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-lg text-zinc-100">{t2Short}</span>
                          </div>
                          <div className="text-right">
                            {t2Innings ? (
                              <div className="font-sports text-xl tracking-wider">
                                {t2Innings.runs}/{t2Innings.wickets} <span className="text-sm text-zinc-500 tracking-normal">({t2Innings.overs})</span>
                              </div>
                            ) : (
                              <span className="text-zinc-600 text-sm font-medium">Yet to bat</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-800/50">
                        <span className="text-sm font-medium text-accent">
                          {typeof match.result === "string" && match.result
                            ? match.result
                            : typeof match.result === "object" && match.result?.winner
                            ? `Winner: ${match.result.winner}`
                            : match.toss?.winner
                            ? `${match.toss.winner} chose to ${match.toss.decision}`
                            : "Match Starts Soon"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            
            {filteredMatches.length === 0 && matches && (
              <div className="col-span-full py-12 text-center text-zinc-500 font-medium">
                No {filter.toLowerCase()} matches found.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE — CRICKET LEADERBOARD */}
      <div className="space-y-6">
        <h2 className="text-2xl font-sports tracking-wide mb-2">Points Table</h2>
        <Leaderboard />
      </div>

    </div>
  );
}
