"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchVolleyballMatches,
  fetchVolleyballStandings,
  VolleyballMatch,
  GroupedStandings,
} from "../../../lib/sportsAPI";

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
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function VolleyballDashboard() {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard" | "fixtures">("results");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      <div className="w-full max-w-7xl p-4 sm:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Volleyball</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide"><span className="text-gray-200">Event:</span> PRISM 2026 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Venue:</span> SVNIT Volleyball Court</p>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-full w-fit mx-auto sm:mx-0">
            {(["men", "women"] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${gender === g ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"}`}>{g === "men" ? "Men" : "Women"}</button>
            ))}
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
  const [matches, setMatches] = useState<VolleyballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const all = await fetchVolleyballMatches(gender);
      setMatches(all.filter((m) => m.match_status === "completed"));
    } catch (err) { console.error(err); setError("Failed to load match results."); }
    finally { setLoading(false); }
  }, [gender]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!matches.length) return <EmptyState label="No completed matches yet." />;

  return (
    <div className="space-y-6">
      <h2 className="text-white font-black text-2xl tracking-widest uppercase pl-1 mb-6">Match Results</h2>
      {matches.map((match) => (
        <div key={match._id} className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 hover:border-[#FFBF00]/20 transition-colors">
          <div className="flex justify-between items-center mb-4 border-b border-[#1A1A1A] pb-3">
            <span className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest">{match.match_stage}</span>
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Completed</span>
          </div>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className={`flex flex-col items-start flex-1 ${match.winner === match.team1_department ? "text-[#FFBF00]" : "text-white"}`}>
              <span className="font-black text-2xl md:text-3xl tracking-widest uppercase">{match.team1_department}</span>
              {match.winner === match.team1_department && <span className="text-xs font-bold tracking-widest mt-1 text-[#FFBF00]">WINNER</span>}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 md:gap-5">
                <span className={`text-4xl md:text-5xl font-black tracking-tighter ${match.winner === match.team1_department ? "text-[#FFBF00]" : "text-white"}`}>{match.team1_score ?? 0}</span>
                <span className="text-2xl font-black text-[#333]">—</span>
                <span className={`text-4xl md:text-5xl font-black tracking-tighter ${match.winner === match.team2_department ? "text-[#FFBF00]" : "text-white"}`}>{match.team2_score ?? 0}</span>
              </div>
              <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sets</span>
            </div>
            <div className={`flex flex-col items-end flex-1 ${match.winner === match.team2_department ? "text-[#FFBF00]" : "text-white"}`}>
              <span className="font-black text-2xl md:text-3xl tracking-widest uppercase">{match.team2_department}</span>
              {match.winner === match.team2_department && <span className="text-xs font-bold tracking-widest mt-1 text-[#FFBF00]">WINNER</span>}
            </div>
          </div>
          {match.games.length > 0 && (
            <div className="pt-4 border-t border-[#1A1A1A]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Set Scores (Points)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-gray-600 border-b border-[#1A1A1A] uppercase text-xs font-bold tracking-widest">
                      <th className="py-2 px-3 text-left">Set</th>
                      <th className="py-2 px-3 text-center">{match.team1_department}</th>
                      <th className="py-2 px-3 text-center">{match.team2_department}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {match.games.map((g) => (
                      <tr key={g.game_number} className="hover:bg-[#0A0A0A] transition-colors">
                        <td className="py-2 px-3 text-gray-500 font-bold">Set {g.game_number}</td>
                        <td className={`py-2 px-3 text-center font-black ${g.team1_score > g.team2_score ? "text-[#FFBF00]" : "text-white"}`}>{g.team1_score}</td>
                        <td className={`py-2 px-3 text-center font-black ${g.team2_score > g.team1_score ? "text-[#FFBF00]" : "text-white"}`}>{g.team2_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ gender }: { gender: "men" | "women" }) {
  const category = gender === "men" ? "boys" : "girls";
  const [grouped, setGrouped] = useState<GroupedStandings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setGrouped(await fetchVolleyballStandings(category)); }
    catch (err) { console.error(err); setError("Failed to load standings."); }
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const groups = Object.entries(grouped);
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
                {teams.map((t, i) => (
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
          <p className="text-gray-600 text-xs mt-4 tracking-widest uppercase font-bold">Win = 3 pts · Loss = 0 pts</p>
        </div>
      ))}
    </div>
  );
}

function Fixtures({ gender }: { gender: "men" | "women" }) {
  const [matches, setMatches] = useState<VolleyballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const all = await fetchVolleyballMatches(gender);
      setMatches(all.filter((m) => m.match_status === "scheduled" || m.match_status === "ongoing"));
    } catch (err) { console.error(err); setError("Failed to load fixtures."); }
    finally { setLoading(false); }
  }, [gender]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!matches.length) return <EmptyState label="No upcoming fixtures." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((m) => (
        <div key={m._id} className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-r-xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">{m.match_stage}</span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">#{m.match_id}</span>
              {m.match_status === "ongoing" && <span className="text-[10px] font-black uppercase tracking-widest text-green-400 animate-pulse">● Live</span>}
            </div>
          </div>
          <h4 className="text-2xl font-black text-white mb-2 group-hover:text-[#FFBF00] transition-colors">
            {m.team1_department} <span className="text-gray-600 font-bold text-sm mx-2">VS</span> {m.team2_department}
          </h4>
          <p className="text-sm text-gray-400 font-medium tracking-wide">{fmtDate(m.match_date)}{m.venue ? ` · ${m.venue}` : ""}</p>
        </div>
      ))}
    </div>
  );
}