/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BattingTable from "./BattingTable";
import BowlingTable from "./BowlingTable";
import Leaderboard from "@/app/components/Leaderboard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MatchPage() {
  const { match_id } = useParams();
  const [activeTab, setActiveTab] = useState<"Details" | "Scorecard" | "Standings">("Scorecard");

  const { data: match, error } = useSWR(`/api/matches?id=${match_id}`, fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div className="text-danger p-8">Error loading match details.</div>;
  if (!match) return <div className="p-8 text-zinc-500 animate-pulse">Loading scorecard...</div>;

  const team1 = match.teams?.team1;
  const team2 = match.teams?.team2;
  // Support both old format (batting_team) and new format (team)
  const t1Innings = match.innings?.find((i: any) => 
    i.team === team1?.name || i.batting_team === team1?.name
  );
  const t2Innings = match.innings?.find((i: any) => 
    i.team === team2?.name || i.batting_team === team2?.name
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Top Header Section */}
      <div className="glass rounded-3xl p-6 md:p-10 border border-zinc-800 shadow-xl relative overflow-hidden">
        {match.status === "LIVE" && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-accentGlow blur-3xl rounded-full opacity-30 animate-pulse" />
        )}

        <div className="flex justify-between items-center bg-zinc-900/50 p-3 px-5 rounded-full border border-zinc-800 w-fit mx-auto mb-10">
          <span className="text-sm font-semibold tracking-widest uppercase text-zinc-400">
            {match.format} • {match.sport}
          </span>
          <span className="mx-4 text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            {match.status === "LIVE" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
            )}
            <span className={`text-sm font-bold tracking-widest uppercase ${match.status === "LIVE" ? "text-danger" : "text-zinc-500"}`}>
              {match.status}
            </span>
          </div>
        </div>

        {/* Scores */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-4 border-b border-zinc-800/50 pb-10">
          
          {/* Team 1 */}
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold tracking-wider mb-2">{team1?.longName || team1?.name}</h2>
            {t1Innings ? (
              <div className="font-sports text-5xl tracking-widest glow-text">
                {t1Innings.runs}/{t1Innings.wickets} <span className="text-2xl text-zinc-500 tracking-normal">({t1Innings.overs})</span>
              </div>
            ) : (
              <div className="font-sports text-3xl text-zinc-600">Yet to bat</div>
            )}
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center px-8 border-x border-zinc-800/50 h-24">
            <span className="text-4xl font-sports text-zinc-800 italic pr-2 text-balance leading-none">VS</span>
          </div>

          {/* Team 2 */}
          <div className="text-center md:text-right flex-1">
             <h2 className="text-3xl font-bold tracking-wider mb-2">{team2?.longName || team2?.name}</h2>
            {t2Innings ? (
              <div className="font-sports text-5xl tracking-widest text-zinc-200">
                {t2Innings.runs}/{t2Innings.wickets} <span className="text-2xl text-zinc-500 tracking-normal">({t2Innings.overs})</span>
              </div>
            ) : (
              <div className="font-sports text-3xl text-zinc-600">Yet to bat</div>
            )}
          </div>
        </div>

        <div className="pt-6 text-center text-accent tracking-wide font-medium">
          {typeof match.result === "string" && match.result
            ? match.result
            : typeof match.result === "object" && match.result?.winner
            ? `Winner: ${match.result.winner}`
            : match.toss?.winner
            ? `${match.toss.winner} chose to ${match.toss.decision}`
            : "Match Starts Soon"}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-zinc-800 pb-px">
        {["Details", "Scorecard", "Standings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 text-sm font-semibold tracking-wider uppercase transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? "text-accent border-b-2 border-accent" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 pb-20">
        <AnimatePresence mode="wait">
          
          {activeTab === "Details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass p-8 rounded-2xl border border-zinc-800 space-y-6"
            >
              <h3 className="font-sports text-2xl mb-6">Match Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-400">
                <div>
                  <p className="text-sm font-semibold text-zinc-600 uppercase mb-1">Date</p>
                  <p className="font-medium text-zinc-200">{match.date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600 uppercase mb-1">Start Time</p>
                  <p className="font-medium text-zinc-200">{match.startTime}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600 uppercase mb-1">Toss</p>
                  <p className="font-medium text-zinc-200">{match.toss?.winner ? `${match.toss.winner} won the toss and elected to ${match.toss.decision.toLowerCase()}` : "TBD"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600 uppercase mb-1">Status</p>
                  <p className="font-medium text-zinc-200">{match.status}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Scorecard" && (
            <motion.div
              key="scorecard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Recent Balls */}
              {match.recent_balls?.length > 0 && (
                <div className="glass p-4 px-6 border-l-4 border-accent rounded-r-xl flex items-center gap-4 overflow-x-auto no-scrollbar">
                  <span className="text-xs uppercase font-bold tracking-widest text-zinc-500 whitespace-nowrap">Recent</span>
                  <div className="flex items-center gap-2">
                    {match.recent_balls.map((ball: string, i: number) => (
                      <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        ball === "W" ? "bg-danger text-white" 
                        : ball === "4" || ball === "6" ? "bg-accent/20 text-accent border border-accent/30" 
                        : "bg-zinc-800 text-zinc-300"
                      }`}>
                        {ball}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Innings */}
              {match.innings?.map((inning: any, idx: number) => (
                <div key={idx} className="space-y-6">
                  <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded-xl flex justify-between items-center">
                    <h3 className="font-sports text-xl uppercase tracking-wider">{inning.team} Innings</h3>
                    <span className="font-bold text-xl">{inning.runs}-{inning.wickets} <span className="text-zinc-500 text-sm">({inning.overs})</span></span>
                  </div>
                  
                  <BattingTable batters={inning.batters || []} />
                  
                  {inning.fow?.length > 0 && (
                    <div className="text-sm p-4 bg-zinc-900/30 font-medium text-zinc-400 rounded-md">
                      <span className="text-zinc-500 font-bold mr-2">Fall of wickets:</span> 
                      {inning.fow.map((f: any, i: number) => `${f.score}-${f.wicket} (${f.over})`).join(", ")}
                    </div>
                  )}

                  <BowlingTable bowlers={inning.bowlers || []} />
                </div>
              ))}
              
              {!match.innings || match.innings.length === 0 && (
                <div className="p-12 text-center text-zinc-500">
                  Match hasn't started yet. Scorecard will appear here.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Standings" && (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Leaderboard />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
