"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchTennisMatches,
  fetchTennisStandings,
  TennisMatch,
  TennisLeaderboardResponse,
  StandingRow,
  normaliseMatchType,
} from "@/lib/sportsAPI";

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

export default function LawnTennisDashboard() {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard" | "fixtures">("results");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      <div className="w-full max-w-7xl p-4 sm:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-5xl md:text-7xl tracking-tighter uppercase">Lawn Tennis</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide"><span className="text-gray-200">Event:</span> PRISM 2026 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Venue:</span> SVNIT Tennis Court</p>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-full w-fit">
              {(["men", "women"] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${gender === g ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"}`}>{g === "men" ? "Men" : "Women"}</button>
              ))}
            </div>
          </div>
          <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-[#1A1A1A]">
            {(["results", "leaderboard", "fixtures"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-base tracking-widest font-bold text-center rounded-md transition-all duration-300 uppercase ${activeTab === tab ? "bg-[#111] text-[#FFBF00] shadow-[inset_0_-2px_0_0_#FFBF00]" : "text-gray-500 hover:text-white"}`}>{tab}</button>
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

function Results({ gender }: { gender: "men" | "women" }) {
  const [matches, setMatches] = useState<TennisMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const all = await fetchTennisMatches(gender);
      setMatches(all.filter((m: TennisMatch) => m.status === "completed"));
    } catch (err) { console.error(err); setError("Failed to load match results."); }
    finally { setLoading(false); }
  }, [gender]);

  useEffect(() => { 
    load(); 
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!matches.length) return <EmptyState label="No completed matches yet." />;

  return (
    <div className="space-y-6">
      <h2 className="text-white font-black text-2xl tracking-widest uppercase pl-1 mb-6">Match Results</h2>
      {matches.map((match) => {
        const matchesWon1 = match.games.filter((g) => g.score_dept1 > g.score_dept2).length;
        const matchesWon2 = match.games.filter((g) => g.score_dept2 > g.score_dept1).length;
        return (
          <div key={match._id} className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 hover:border-[#FFBF00]/20 transition-colors">
            <div className="flex justify-between items-center mb-4 border-b border-[#1A1A1A] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest">{match.stage}</span>
                <span className="text-gray-600 text-xs font-bold uppercase tracking-widest border border-[#333] px-2 py-0.5 rounded">{match.category}</span>
              </div>
              <span className="text-gray-500 text-xs font-bold tracking-widest">{match.match_id}</span>
            </div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className={`flex flex-col items-start flex-1 ${match.winner_dept === match.dept_name1 ? "text-[#FFBF00]" : "text-white"}`}>
                <span className="font-black text-2xl md:text-3xl tracking-widest uppercase">{match.dept_name1}</span>
                {match.winner_dept === match.dept_name1 && <span className="text-xs font-bold tracking-widest mt-1 text-[#FFBF00]">WINNER</span>}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <span className={`text-4xl font-black ${match.winner_dept === match.dept_name1 ? "text-[#FFBF00]" : "text-white"}`}>{matchesWon1}</span>
                  <span className="text-[#333] font-black text-2xl">—</span>
                  <span className={`text-4xl font-black ${match.winner_dept === match.dept_name2 ? "text-[#FFBF00]" : "text-white"}`}>{matchesWon2}</span>
                </div>
                <span className="text-gray-600 text-xs font-bold uppercase tracking-widest mt-1">Matches</span>
              </div>
              <div className={`flex flex-col items-end flex-1 ${match.winner_dept === match.dept_name2 ? "text-[#FFBF00]" : "text-white"}`}>
                <span className="font-black text-2xl md:text-3xl tracking-widest uppercase">{match.dept_name2}</span>
                {match.winner_dept === match.dept_name2 && <span className="text-xs font-bold tracking-widest mt-1 text-[#FFBF00]">WINNER</span>}
              </div>
            </div>
            {match.games.length > 0 && (
              <div className="pt-4 border-t border-[#1A1A1A]">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Match Score</p>
                <div className="flex flex-wrap gap-3">
                  {match.games.map((set: any) => (
                    <div key={set.tie_id} className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg px-4 py-3 flex flex-col items-center min-w-[72px]">
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Match {set.tie_id}</span>
                      <span className={`text-lg font-black ${set.score_dept1 > set.score_dept2 ? "text-[#FFBF00]" : "text-white"}`}>{set.score_dept1}</span>
                      <span className="text-gray-700 text-xs">—</span>
                      <span className={`text-lg font-black ${set.score_dept2 > set.score_dept1 ? "text-[#FFBF00]" : "text-white"}`}>{set.score_dept2}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Leaderboard({ gender }: { gender: "men" | "women" }) {
  const category = gender === "men" ? "boys" : "girls";
  const [data, setData] = useState<TennisLeaderboardResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await fetchTennisStandings(category)); }
    catch (err) { console.error(err); setError("Failed to load standings."); }
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { 
    load(); 
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  // Tennis response: { boys: { A: [...], B: [...] } } — iterate all groups under the category
  const catData = data[category] ?? {};
  const groups = Object.entries(catData);
  if (!groups.length) return <EmptyState label="No standings available yet." />;

  return (
    <div className="space-y-12">
      {groups.map(([grp, teams]) => (
        <div key={grp} className="bg-[#000000] p-6 rounded-xl border border-[#1A1A1A]">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">Group {grp}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base whitespace-nowrap">
              <thead>
                <tr className="text-gray-400 border-b border-[#333] uppercase text-sm font-bold tracking-widest">
                  <th className="py-4 px-4">#</th><th className="py-4 px-4">Team</th>
                  <th className="py-4 px-3 text-center">P</th><th className="py-4 px-3 text-center">W</th>
                  <th className="py-4 px-3 text-center">L</th>
                  <th className="py-4 px-3 text-center text-[#FFBF00] font-black text-base md:text-lg">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {(teams as StandingRow[]).map((t, i) => (
                  <tr key={t.dept_name} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-5 px-4 text-gray-500 font-mono text-sm">{i + 1}</td>
                    <td className={`py-5 px-4 font-black tracking-widest uppercase ${i === 0 ? "text-[#FFBF00]" : "text-white"}`}>{t.dept_name}</td>
                    <td className="py-5 px-3 text-center text-gray-400">{t.played ?? t.matches}</td>
                    <td className="py-5 px-3 text-center text-gray-400">{t.wins}</td>
                    <td className="py-5 px-3 text-center text-gray-500">{t.losses}</td>
                    <td className="py-5 px-3 text-center font-black text-xl text-white">{t.points ?? t.wins * 3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Fixtures({ gender }: { gender: "men" | "women" }) {
  const [matches, setMatches] = useState<TennisMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const all = await fetchTennisMatches(gender);
      setMatches(all.filter((m: TennisMatch) => m.status === "scheduled"));
    } catch (err) { console.error(err); setError("Failed to load fixtures."); }
    finally { setLoading(false); }
  }, [gender]);

  useEffect(() => { 
    load(); 
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!matches.length) return <EmptyState label="No upcoming fixtures." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((m) => (
        <div key={m._id} className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-r-xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">{m.stage}</span>
              <span className="text-xs font-bold text-gray-600 border border-[#222] px-2 py-1 rounded uppercase tracking-widest">{m.match_type}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{m.match_id}</span>
            </div>
          </div>
          <h4 className="text-2xl font-black text-white mb-2 group-hover:text-[#FFBF00] transition-colors">
            {m.dept_name1} <span className="text-gray-600 font-bold text-sm mx-2">VS</span> {m.dept_name2}
          </h4>
          {m.category && <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">{m.category}</p>}
        </div>
      ))}
    </div>
  );
}