/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Trophy, Activity, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const { gender } = useGender();
  const { data: matches, error: matchesError, mutate: mutateMatches } = useSWR(`/api/matches?gender=${gender}`, fetcher);
  const { data: teams } = useSWR(`/api/leaderboard?gender=${gender}`, fetcher);

  const validMatches = Array.isArray(matches) ? matches : [];
  const validTeams = Array.isArray(teams) ? teams : [];

  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newMatch, setNewMatch] = useState({
    match_id: `CRIC${Math.floor(Math.random() * 1000)}`,
    team1: "",
    team1Short: "",
    team2: "",
    team2Short: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    tossWinner: "",
    tossDecision: "Bat"
  });

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    const payload = {
      match_id: newMatch.match_id,
      date: newMatch.date,
      startTime: newMatch.startTime,
      toss: {
        winner: newMatch.tossWinner,
        decision: newMatch.tossDecision
      },
      teams: {
        team1: { name: newMatch.team1, shortName: newMatch.team1Short, players: [] },
        team2: { name: newMatch.team2, shortName: newMatch.team2Short, players: [] }
      }
    };

    try {
      const res = await fetch(`/api/matches?gender=${gender}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setCreateError(data.error || "Failed to create match. Please try again.");
        return;
      }

      setIsCreatingMatch(false);
      setNewMatch({
        match_id: `CRIC${Math.floor(Math.random() * 1000)}`,
        team1: "", team1Short: "",
        team2: "", team2Short: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "14:00",
        tossWinner: "",
        tossDecision: "Bat"
      });
      mutateMatches();
    } catch {
      setCreateError("Network error. Please check your connection.");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      const res = await fetch(`/api/matches?gender=${gender}&id=${matchId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutateMatches();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete match");
      }
    } catch {
      alert("Network error. Could not delete match.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/leaderboard/cricket" className="glass p-6 rounded-2xl border border-zinc-800 hover:border-accent transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sports text-lg">{gender === 'f' ? "Women's" : "Men's"} Cricket Leaderboard</h3>
                <p className="text-sm text-zinc-500">Manage teams, wins, and standings</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </Link>
        <Link href="/admin/leaderboard" className="glass p-6 rounded-2xl border border-zinc-800 hover:border-accent transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sports text-lg">{gender === 'f' ? "Women's" : "Men's"} Homepage Leaderboard</h3>
                <p className="text-sm text-zinc-500">Update top performers on homepage</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Match Management Section */}
      <div className="glass rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <h2 className="text-xl font-sports tracking-wide">Match Management</h2>
          <button 
            onClick={() => setIsCreatingMatch(!isCreatingMatch)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-semibold transition-all"
          >
            {isCreatingMatch ? "Cancel" : <><Plus className="w-4 h-4" /> New Match</>}
          </button>
        </div>

        {isCreatingMatch && (
          <form onSubmit={handleCreateMatch} className={`p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match ID</label>
                <input required value={newMatch.match_id} onChange={e => setNewMatch({...newMatch, match_id: e.target.value})} className={`w-full rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent bg-zinc-800 border-none text-white`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Toss Winner</label>
                <select value={newMatch.tossWinner} onChange={e => setNewMatch({...newMatch, tossWinner: e.target.value})} className={`w-full rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent bg-zinc-800 border-none text-white`}>
                  <option value="">— Select Toss Winner —</option>
                  {newMatch.team1 && <option value={newMatch.team1}>{newMatch.team1}</option>}
                  {newMatch.team2 && <option value={newMatch.team2}>{newMatch.team2}</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Toss Decision</label>
                <select value={newMatch.tossDecision} onChange={e => setNewMatch({...newMatch, tossDecision: e.target.value})} className={`w-full rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent bg-zinc-800 border-none text-white`}>
                  <option value="Bat">Bat</option>
                  <option value="Bowl">Bowl</option>
                </select>
              </div>
              
              {/* Team 1 setup */}
              <div className={`p-4 bg-background rounded-xl border border-zinc-800/50 space-y-3`}>
                <h4 className="text-sm font-bold text-zinc-400">Team 1</h4>
                <select
                  required
                  value={newMatch.team1}
                  onChange={e => {
                    const selected = validTeams.find((t: any) => t.name === e.target.value);
                    setNewMatch({
                      ...newMatch,
                      team1: selected?.name || "",
                      team1Short: selected?.shortName || ""
                    });
                  }}
                  className={`w-full rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-accent bg-zinc-800 border-none text-white`}
                >
                  <option value="">— Select Team 1 —</option>
                  {validTeams.map((t: any) => (
                    <option key={t._id} value={t.name}>{t.name} ({t.shortName})</option>
                  ))}
                </select>
                {newMatch.team1 && (
                  <p className="text-xs text-zinc-500">Short Name: <span className="text-accent font-bold">{newMatch.team1Short}</span></p>
                )}
              </div>

               {/* Team 2 setup */}
               <div className={`p-4 bg-background rounded-xl border border-zinc-800/50 space-y-3`}>
                <h4 className="text-sm font-bold text-zinc-400">Team 2</h4>
                <select
                  required
                  value={newMatch.team2}
                  onChange={e => {
                    const selected = validTeams.find((t: any) => t.name === e.target.value);
                    setNewMatch({
                      ...newMatch,
                      team2: selected?.name || "",
                      team2Short: selected?.shortName || ""
                    });
                  }}
                  className={`w-full rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-accent bg-zinc-800 border-none text-white`}
                >
                  <option value="">— Select Team 2 —</option>
                  {validTeams.filter((t: any) => t.name !== newMatch.team1).map((t: any) => (
                    <option key={t._id} value={t.name}>{t.name} ({t.shortName})</option>
                  ))}
                </select>
                {newMatch.team2 && (
                  <p className="text-xs text-zinc-500">Short Name: <span className="text-accent font-bold">{newMatch.team2Short}</span></p>
                )}
              </div>
            </div>
            
            {createError && (
              <div className="p-3 bg-red-900/40 border border-red-700/50 rounded-lg text-sm text-red-400">
                ⚠ {createError}
              </div>
            )}
            <button type="submit" className={`w-full py-3 font-bold rounded-xl mt-4 transition-colors bg-zinc-100 text-zinc-900 hover:bg-white`}>
              Initialize Match
            </button>
          </form>
        )}

        <div className="divide-y divide-zinc-800/50">
          {!matches && !matchesError ? (
            <div className="p-8 text-center text-zinc-500">Loading matches...</div>
          ) : validMatches.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No matches found. Create one.</div>
          ) : (
            validMatches.map((match: any) => (
              <div key={match._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold bg-zinc-800 px-2 py-0.5 rounded">{match.match_id}</span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${match.status === "LIVE" ? "text-red-500" : "text-zinc-500"}`}>{match.status}</span>
                  </div>
                  <h3 className="font-sports text-xl tracking-wide">{match.teams.team1.shortName} vs {match.teams.team2.shortName}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{match.date}</p>
                  {match.toss?.winner && (
                    <p className="text-xs text-accent mt-1 font-semibold">{match.toss.winner} elected to {match.toss.decision}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteMatch(match.match_id)}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Match"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <Link 
                    href={`/admin/match/${match.match_id}`}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all text-center bg-zinc-800 hover:bg-accent hover:text-white`}
                  >
                    Manage Live Score
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
