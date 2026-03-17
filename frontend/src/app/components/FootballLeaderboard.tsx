/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RANK_STYLES = [
  { bg: "bg-yellow-500/10 border-yellow-500/30", badge: "bg-yellow-500 text-yellow-900", label: "text-yellow-400", glow: "shadow-[0_0_20px_rgba(234,179,8,0.12)]" },
  { bg: "bg-zinc-400/10 border-zinc-400/30", badge: "bg-zinc-300 text-zinc-900", label: "text-zinc-300", glow: "" },
  { bg: "bg-amber-700/10 border-amber-700/30", badge: "bg-amber-600 text-amber-100", label: "text-amber-500", glow: "" },
];

export default function FootballLeaderboard() {
  const { gender } = useGender();
  const { data: teams, error } = useSWR(`/api/football/leaderboard?gender=${gender}`, fetcher, {
    refreshInterval: 10000,
  });

  if (error) return <div className="text-red-400 p-4 text-center text-sm font-bold">Fetch Error: {error.message}</div>;
  if (!teams) return <div className="text-zinc-500 animate-pulse p-4 text-center text-sm">Connecting to backend...</div>;

  // Handle API error response returned as JSON
  if ((teams as any).error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="text-red-400 text-center text-sm font-bold">Backend Error</div>
        <div className="text-red-500 text-center text-xs mt-1 font-mono">{(teams as any).error}</div>
      </div>
    );
  }

  const validTeams: any[] = Array.isArray(teams) ? teams : [];

  return (
    <div className="w-full glass rounded-2xl overflow-hidden border border-zinc-800/50 relative group">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      <div className="p-5 border-b border-zinc-900 bg-background/50 flex items-center justify-between">
        <h3 className="font-sports text-xl uppercase tracking-wider" style={{ color: "#4ade80" }}>
          ⚽ Standings
        </h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-wider text-xs border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">M</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">D</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center text-green-400">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {validTeams.map((team: any, index: number) => {
              const style = RANK_STYLES[index] ?? null;
              const isTop3 = index < 3;
              return (
                <motion.tr
                  key={team._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className={`hover:bg-zinc-900/30 transition-colors ${isTop3 ? style!.bg.split(" ")[0] : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isTop3 ? style!.badge : "text-zinc-500"}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] border border-zinc-700 font-bold">
                        {team.shortName?.slice(0, 3)}
                      </div>
                      <span className={`font-bold text-xs ${isTop3 ? style!.label : "text-zinc-200"}`}>{team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-400 text-xs">{team.matches ?? 0}</td>
                  <td className="px-4 py-3 text-center text-zinc-400 text-xs">{team.wins ?? 0}</td>
                  <td className="px-4 py-3 text-center text-zinc-400 text-xs">{team.draws ?? 0}</td>
                  <td className="px-4 py-3 text-center text-zinc-400 text-xs">{team.losses ?? 0}</td>
                  <td className="px-4 py-3 text-center text-zinc-400 text-xs">{team.goalDifference ?? 0}</td>
                  <td className="px-4 py-3 text-center text-green-400 font-sports text-base font-bold">
                    {team.points ?? 0}
                  </td>
                </motion.tr>
              );
            })}
            {validTeams.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500 text-xs">
                  No teams in standings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
