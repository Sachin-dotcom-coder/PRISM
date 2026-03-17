/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RANK_STYLES = [
  {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    badge: "bg-yellow-500 text-yellow-900",
    label: "text-yellow-400",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",
  },
  {
    bg: "bg-zinc-400/10 border-zinc-400/30",
    badge: "bg-zinc-300 text-zinc-900",
    label: "text-zinc-300",
    glow: "shadow-[0_0_15px_rgba(161,161,170,0.1)]",
  },
  {
    bg: "bg-amber-700/10 border-amber-700/30",
    badge: "bg-amber-600 text-amber-100",
    label: "text-amber-500",
    glow: "",
  },
];

export default function HomepageLeaderboard() {
  const { gender } = useGender();
  const { data: teams, error } = useSWR(`/api/homepage-leaderboard?gender=${gender}`, fetcher, {
    refreshInterval: 10000,
  });

  if (error) return <div className="text-red-400 p-4 text-center">Failed to load standings.</div>;
  if (!teams) return <div className="text-zinc-500 animate-pulse p-4 text-center">Loading standings...</div>;

  const validTeams: any[] = Array.isArray(teams) ? teams : [];

  if (validTeams.length === 0) return (
    <div className="p-10 text-center text-zinc-500 glass rounded-2xl border border-zinc-800">
      No teams yet.{" "}
      <Link href="/admin/leaderboard" className="text-accent underline">Add via Admin Panel</Link>
    </div>
  );

  return (
    <div className="w-full space-y-3">
      {validTeams.map((team, index) => {
        const style = RANK_STYLES[index] ?? null;
        const isTop3 = index < 3;

        return (
          <motion.div
            key={team._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              isTop3
                ? `${style!.bg} ${style!.glow}`
                : "bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50"
            }`}
          >
            {/* Rank badge */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
              isTop3 ? style!.badge : "bg-zinc-800 text-zinc-500"
            }`}>
              {index + 1}
            </div>

            {/* Team info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {team.shortName?.slice(0, 4) || team.name?.slice(0, 3)}
                </div>
                <span className={`font-bold text-sm truncate ${isTop3 ? style!.label : "text-zinc-300"}`}>
                  {team.name}
                </span>
              </div>
            </div>

            {/* Stats: 1st / 2nd / 3rd medals + Points */}
            <div className="flex items-center gap-4 text-right shrink-0">
              <div className="text-center hidden sm:block">
                <div className="text-xs text-yellow-500 font-semibold">🥇</div>
                <div className="text-yellow-400 font-bold text-sm">{team.First ?? 0}</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-xs text-zinc-400 font-semibold">🥈</div>
                <div className="text-zinc-300 font-bold text-sm">{team.Second ?? 0}</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-xs text-amber-600 font-semibold">🥉</div>
                <div className="text-amber-500 font-bold text-sm">{team.Third ?? 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-zinc-600 uppercase font-semibold">Pts</div>
                <div className={`font-black text-lg ${isTop3 ? style!.label : "text-zinc-300"}`}>
                  {team.points ?? 0}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
