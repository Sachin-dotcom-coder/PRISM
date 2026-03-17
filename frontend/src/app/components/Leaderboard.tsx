/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Leaderboard() {
  const { gender } = useGender();
  // SWR automatically polls every 5 seconds for real-time updates as per guidelines
  const { data: teams, error } = useSWR(`/api/leaderboard?gender=${gender}`, fetcher, {
    refreshInterval: 5000, 
  });

  if (error) return <div className="text-danger p-4 text-center">Failed to load leaderboard.</div>;
  if (!teams) return <div className="text-zinc-500 animate-pulse p-4 text-center">Loading live standings...</div>;

  const validTeams = Array.isArray(teams) ? teams : [];

  return (
    <div className="w-full glass rounded-2xl overflow-hidden border border-zinc-800/50 relative group">
      {/* Glow Effect */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent group-hover:via-accent transition-all duration-500" />
      
      <div className="p-5 border-b border-zinc-900 bg-background/50 flex items-center justify-between">
        <h3 className="font-sports text-xl uppercase tracking-wider glow-text">
          Tournament Standings
        </h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-wider text-xs border-b border-zinc-800">
            <tr>
              <th scope="col" className="px-6 py-4">Position</th>
              <th scope="col" className="px-6 py-4">Team</th>
              <th scope="col" className="px-6 py-4 text-center">P</th>
              <th scope="col" className="px-6 py-4 text-center">W</th>
              <th scope="col" className="px-6 py-4 text-center">L</th>
              <th scope="col" className="px-6 py-4 text-center">NRR</th>
              <th scope="col" className="px-6 py-4 text-center text-[#FFBF00]">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {validTeams.map((team: any, index: number) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={team._id} 
                className="hover:bg-zinc-900/30 transition-colors"
              >
                <td className="px-6 py-4 font-sports text-lg text-zinc-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-bold tracking-wide flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs border border-zinc-700">
                    {team.shortName}
                  </div>
                  <span className="text-zinc-200">{team.name}</span>
                </td>
                <td className="px-6 py-4 text-center text-zinc-400 font-medium">
                  {team.matches}
                </td>
                <td className="px-6 py-4 text-center text-zinc-400 font-medium">
                  {team.wins}
                </td>
                <td className="px-6 py-4 text-center text-zinc-400 font-medium">
                  {team.losses}
                </td>
                <td className="px-6 py-4 text-center text-zinc-400 font-medium">
                  {team.nrr?.toFixed(3) || "0.000"}
                </td>
                <td className="px-6 py-4 text-center text-[#FFBF00] font-sports text-xl drop-shadow-md">
                  {team.points}
                </td>
              </motion.tr>
            ))}
            
            {validTeams.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                  No teams added to the leaderboard yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
