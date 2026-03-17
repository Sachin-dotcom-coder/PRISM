/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  UPCOMING:    { text: "Upcoming",   color: "text-zinc-500"  },
  FIRST_HALF:  { text: "1st Half",  color: "text-green-400" },
  HALF_TIME:   { text: "Half Time", color: "text-yellow-400"},
  SECOND_HALF: { text: "2nd Half",  color: "text-green-400" },
  COMPLETED:   { text: "Full Time", color: "text-zinc-400"  },
};

export default function FootballMatchPage() {
  const { match_id } = useParams();
  const { data: match, error } = useSWR(
    `/api/football/matches?id=${match_id}`,
    fetcher,
    { refreshInterval: 8000 }
  );

  if (error) return <div className="text-red-400 p-8">Failed to load match.</div>;
  if (!match) return <div className="p-8 text-zinc-500 animate-pulse">Loading match...</div>;

  const sl = STATUS_LABEL[match.status] || { text: match.status, color: "text-zinc-500" };
  const isLive = ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"].includes(match.status);

  const team1Goals = (match.goals || []).filter((g: any) => g.team === match.teams?.team1);
  const team2Goals = (match.goals || []).filter((g: any) => g.team === match.teams?.team2);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <Link href="/sports/football" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Matches
      </Link>

      {/* Scoreboard */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`glass p-8 rounded-3xl border relative overflow-hidden ${isLive ? "border-green-500/30" : "border-zinc-800"}`}>
        {isLive && <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 blur-3xl rounded-full" />}

        {/* Status pill */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
            )}
            <span className={`text-sm font-bold tracking-widest uppercase ${sl.color}`}>{sl.text}</span>
          </div>
        </div>

        {/* Teams & Score */}
        <div className="flex justify-between items-center gap-6">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold tracking-wider mb-3">{match.teams?.team1}</h2>
            <div className={`text-7xl font-sports tracking-widest ${isLive ? "glow-text" : ""}`}>
              {match.score?.team1 ?? 0}
            </div>
            {/* Team 1 scorers */}
            <div className="mt-4 space-y-1">
              {team1Goals.map((g: any, i: number) => (
                <div key={i} className="text-xs text-zinc-400">⚽ {g.player}</div>
              ))}
            </div>
          </div>

          <div className="text-zinc-700 font-sports text-4xl">—</div>

          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold tracking-wider mb-3">{match.teams?.team2}</h2>
            <div className="text-7xl font-sports tracking-widest">
              {match.score?.team2 ?? 0}
            </div>
            {/* Team 2 scorers */}
            <div className="mt-4 space-y-1">
              {team2Goals.map((g: any, i: number) => (
                <div key={i} className="text-xs text-zinc-400">⚽ {g.player}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Winner banner */}
        {match.status === "COMPLETED" && match.result?.winner && (
          <div className="mt-8 py-3 bg-accent/10 border border-accent/20 rounded-xl text-center">
            <span className="text-accent font-bold text-lg">🏆 {match.result.winner} wins!</span>
            {match.result.final_score && <span className="text-zinc-500 text-sm ml-2">({match.result.final_score})</span>}
          </div>
        )}
      </motion.div>

      {/* Goals Timeline */}
      {match.goals?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="glass p-6 rounded-3xl border border-zinc-800">
          <h3 className="font-sports text-lg mb-4 tracking-wide">Goals</h3>
          <div className="space-y-3">
            {match.goals.map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">⚽</span>
                <div className={`flex-1 flex items-center gap-2 p-2 px-3 rounded-xl text-sm font-medium ${
                  g.team === match.teams?.team1 ? "bg-accent/10 text-accent" : "bg-zinc-800 text-zinc-300"
                }`}>
                  <span className="font-bold">{g.player}</span>
                  <span className="text-xs opacity-60">for {g.team}</span>
                </div>
                {g.minute && <span className="text-xs text-zinc-500 font-mono">{g.minute}&apos;</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
