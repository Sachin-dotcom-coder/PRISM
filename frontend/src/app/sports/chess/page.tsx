"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchChessMatches,
  fetchChessStandings,
  ChessMatch,
  GroupedStandings,
} from "../../../lib/sportsAPI";

// ─── Loading / Error Components ───────────────────────────────────────────────
function LoadingSpinner() {
  return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-[#FFBF00] border-t-transparent rounded-full animate-spin" /></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-20">
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">{message}</p>
      <button onClick={onRetry} className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest border border-[#FFBF00]/30 px-4 py-2 rounded hover:bg-[#FFBF00]/10 transition-colors">Retry</button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-sm border border-dashed border-[#1A1A1A] rounded-xl">{label}</div>;
}

function fmtDate(d?: string) {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ChessDashboard() {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard" | "fixtures">("results");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black pt-20">
      <div className="w-full max-w-7xl p-4 sm:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Chess</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            <span className="text-gray-200">Event:</span> PRISM 2025 <span className="mx-2 text-[#333]">|</span> 
            <span className="text-gray-200">Venue:</span> SVNIT Indoor Sports Complex
          </p>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-full w-fit mx-auto sm:mx-0">
            {(["men", "women"] as const).map((g) => (
              <button 
                key={g} 
                onClick={() => setGender(g)} 
                className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${gender === g ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"}`}
              >
                {g === "men" ? "Men" : "Women"}
              </button>
            ))}
          </div>
          <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-[#1A1A1A]">
            {(["results", "leaderboard", "fixtures"] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 py-4 text-base tracking-widest font-bold text-center rounded-md transition-all duration-300 uppercase ${activeTab === tab ? "bg-[#111] text-[#FFBF00] shadow-[inset_0_-2px_0_0_#FFBF00]" : "text-gray-500 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === "results" && <Results gender={gender} />}
          {activeTab === "leaderboard" && <Leaderboard gender={gender} />}
          {activeTab === "fixtures" && <Fixtures gender={gender} />}
        </div>
      </div>
    </div>
  );
}

// ─── Results Tab ──────────────────────────────────────────────────────────────
function Results({ gender }: { gender: "men" | "women" }) {
  const [matches, setMatches] = useState<ChessMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); 
    setError("");
    try {
      const all = await fetchChessMatches(gender);
      setMatches(all.filter((m) => m.event_status === "completed"));
    } catch (err) { 
      console.error(err); 
      setError("Failed to load match results."); 
    } finally { 
      if (isInitial) setLoading(false); 
    }
  }, [gender]);

  useEffect(() => { 
    load(true); 
    const interval = setInterval(() => load(false), 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => load(true)} />;
  if (!matches.length) return <EmptyState label="No completed matches yet." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {matches.map((match) => (
        <div key={match._id} className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-6 hover:border-[#FFBF00]/20 transition-colors relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[#FFBF00] text-[10px] font-bold uppercase tracking-widest">Board #{match.event_id}</span>
            <span className="text-green-500 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 border border-green-500/20 bg-green-500/5 rounded">Completed</span>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className={`text-xl font-black uppercase tracking-widest transition-colors ${match.winner === match.department_1 ? "text-[#FFBF00]" : "text-white"}`}>
                {match.department_1}
              </span>
              {match.winner === match.department_1 && <span className="text-[10px] font-black bg-[#FFBF00] text-black px-2 py-0.5 rounded">WINNER</span>}
            </div>
            <div className="text-[10px] font-black text-[#222] text-center w-full separator relative">
              <span className="bg-black px-4 relative z-10">VERSUS</span>
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#111]"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xl font-black uppercase tracking-widest transition-colors ${match.winner === match.department_2 ? "text-[#FFBF00]" : "text-white"}`}>
                {match.department_2}
              </span>
              {match.winner === match.department_2 && <span className="text-[10px] font-black bg-[#FFBF00] text-black px-2 py-0.5 rounded">WINNER</span>}
            </div>
          </div>
          <div className="pt-4 border-t border-[#1A1A1A] flex justify-between items-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span>{fmtDate(match.event_date)}</span>
            <span>{match.category || "General"} Category</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
function Leaderboard({ gender }: { gender: "men" | "women" }) {
  const [grouped, setGrouped] = useState<GroupedStandings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); 
    setError("");
    try { 
      const res = await fetchChessStandings(gender);
      const rawData = (res as any)?.success || (res as any)?.data ? ((res as any).data || res) : res;
      setGrouped(rawData && typeof rawData === 'object' ? rawData : {});
    } catch (err) { 
      console.error(err); 
      setError("Failed to load standings."); 
    } finally { 
      if (isInitial) setLoading(false); 
    }
  }, [gender]);

  useEffect(() => { 
    load(true); 
    const interval = setInterval(() => load(false), 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => load(true)} />;
  
  const groups = Object.entries(grouped);
  if (!groups.length) return <EmptyState label="No standings available yet." />;

  return (
    <div className="space-y-12">
      {groups.map(([grp, teams]) => (
        <div key={grp} className="bg-[#000000] p-6 rounded-xl border border-[#1A1A1A]">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">Group {grp}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base whitespace-nowrap bg-transparent rounded-lg">
              <thead>
                <tr className="text-gray-400 border-b border-[#333] uppercase text-sm font-bold tracking-widest">
                  <th className="py-4 px-4">#</th>
                  <th className="py-4 px-4">Department</th>
                  <th className="py-4 px-3 text-center">Played</th>
                  <th className="py-4 px-3 text-center">Wins</th>
                  <th className="py-4 px-3 text-center">Losses</th>
                  <th className="py-4 px-3 text-center text-[#FFBF00] font-black text-base md:text-lg">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {teams.map((t, index) => (
                  <tr key={t.dept_name} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-5 px-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                    <td className={`py-5 px-4 font-black tracking-widest uppercase ${index === 0 ? "text-[#FFBF00]" : "text-white"}`}>{t.dept_name}</td>
                    <td className="py-5 px-3 text-center text-gray-400">{t.matches}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-bold">{t.wins}</td>
                    <td className="py-5 px-3 text-center text-gray-500">{t.losses}</td>
                    <td className="py-5 px-3 text-center font-black text-xl text-white">{t.points || t.wins * 3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 text-[10px] mt-4 tracking-widest uppercase font-bold">Win = 3 pts · Draw = 1 pt</p>
        </div>
      ))}
    </div>
  );
}

// ─── Fixtures Tab ─────────────────────────────────────────────────────────────
function Fixtures({ gender }: { gender: "men" | "women" }) {
  const [matches, setMatches] = useState<ChessMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); 
    setError("");
    try {
      const all = await fetchChessMatches(gender);
      setMatches(all.filter((m) => m.event_status === "scheduled" || m.event_status === "ongoing"));
    } catch (err) { 
      console.error(err); 
      setError("Failed to load fixtures."); 
    } finally { 
      if (isInitial) setLoading(false); 
    }
  }, [gender]);

  useEffect(() => { 
    load(true); 
    const interval = setInterval(() => load(false), 20000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => load(true)} />;
  if (!matches.length) return <EmptyState label="No upcoming fixtures." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((m) => (
        <div key={m._id} className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-xl transition-all hover:scale-[1.03] group shadow-[0_0_20px_rgba(255,191,0,0.05)]">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">Group Match</span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Board #{m.event_id}</span>
              {m.event_status === "ongoing" && <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00] animate-pulse">● LIVE BOARD</span>}
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <h4 className="text-xl font-black text-white uppercase group-hover:text-[#FFBF00] transition-colors truncate">
              {m.department_1}
            </h4>
            <div className="text-[10px] font-black text-zinc-800 font-mono">VS</div>
            <h4 className="text-xl font-black text-white uppercase group-hover:text-[#FFBF00] transition-colors truncate">
              {m.department_2}
            </h4>
          </div>
          <div className="pt-4 border-t border-[#1A1A1A] text-xs text-gray-500 font-medium tracking-wide flex justify-between">
            <span>{fmtDate(m.event_date)}</span>
            <span className="text-gray-400">{m.category || "General"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}