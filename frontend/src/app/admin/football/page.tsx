/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Activity, Trash2 } from "lucide-react";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TEAMS = ["Mechanical","Electronics","Civil","Electrical","Computer Sc","Chemical","Science","AI","MBA"];

export default function FootballAdminDashboard() {
  const { gender } = useGender();
  const { data: matches, error, mutate } = useSWR(`/api/football/matches?gender=${gender}`, fetcher);
  const validMatches = Array.isArray(matches) ? matches : [];

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    match_id: `FB${String(Math.floor(Math.random() * 900) + 100)}`,
    team1: "", team2: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (form.team1 === form.team2) { setCreateError("Teams must be different."); return; }
    const payload = {
      match_id: form.match_id,
      sport: "football",
      status: "UPCOMING",
      teams: { team1: form.team1, team2: form.team2 },
      score: { team1: 0, team2: 0 },
      goals: [],
      result: { winner: null, final_score: null },
    };
    try {
      const res = await fetch(`/api/football/matches?gender=${gender}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); setCreateError(d.error || "Failed"); return; }
      setIsCreating(false);
      setForm({ match_id: `FB${String(Math.floor(Math.random() * 900) + 100)}`, team1: "", team2: "" });
      mutate();
    } catch { setCreateError("Network error."); }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      const res = await fetch(`/api/football/matches?gender=${gender}&id=${matchId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete");
      }
    } catch { alert("Network error"); }
  };

  const STATUS_COLOR: Record<string, string> = {
    UPCOMING: "text-zinc-500", FIRST_HALF: "text-green-400",
    HALF_TIME: "text-yellow-400", SECOND_HALF: "text-green-400", COMPLETED: "text-zinc-400",
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-6 rounded-2xl border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 text-2xl">⚽</div>
          <div>
            <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Total Matches</p>
            <p className="text-3xl font-sports">{validMatches.length}</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Live</p>
            <p className="text-3xl font-sports">
              {validMatches.filter((m: any) => ["FIRST_HALF","HALF_TIME","SECOND_HALF"].includes(m.status)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Match list */}
      <div className="glass rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <h2 className="text-xl font-sports tracking-wide">Football Matches</h2>
          <button onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-semibold transition-all">
            {isCreating ? "Cancel" : <><Plus className="w-4 h-4" /> New Match</>}
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className={`p-6 ${gender === 'f' ? 'bg-zinc-100/50 border-b border-zinc-300' : 'bg-zinc-900/50 border-b border-zinc-800'} space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Match ID</label>
                <input required value={form.match_id}
                  onChange={e => setForm(p => ({ ...p, match_id: e.target.value }))}
                  className={`w-full rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border-none text-white'}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 1</label>
                <select required value={form.team1}
                  onChange={e => setForm(p => ({ ...p, team1: e.target.value }))}
                  className={`w-full rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border-none text-white'}`}>
                  <option value="">— Select Team 1 —</option>
                  {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team 2</label>
                <select required value={form.team2}
                  onChange={e => setForm(p => ({ ...p, team2: e.target.value }))}
                  className={`w-full rounded-lg p-3 text-sm focus:ring-1 focus:ring-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border-none text-white'}`}>
                  <option value="">— Select Team 2 —</option>
                  {TEAMS.filter(t => t !== form.team1).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {createError && <p className="text-red-400 text-sm mt-2">⚠ {createError}</p>}
            <button type="submit" className={`w-full py-3 font-bold rounded-xl mt-4 transition-colors ${gender === 'f' ? 'bg-zinc-800 text-white hover:bg-zinc-900' : 'bg-zinc-100 text-zinc-900 hover:bg-white'}`}>
              Initialize Match
            </button>
          </form>
        )}

        <div className="divide-y divide-zinc-800/50">
          {!matches && !error ? (
            <div className="p-8 text-center text-zinc-500">Loading matches...</div>
          ) : validMatches.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No matches found.</div>
          ) : (
            validMatches.map((m: any) => (
              <div key={m.match_id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold bg-zinc-800 px-2 py-0.5 rounded">{m.match_id}</span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${STATUS_COLOR[m.status] || "text-zinc-500"}`}>{m.status.replace("_", " ")}</span>
                  </div>
                  <h3 className="font-sports text-xl tracking-wide">
                    {m.teams.team1} <span className="text-zinc-500 mx-1">vs</span> {m.teams.team2}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 font-semibold">Score: {m.score?.team1 ?? 0} − {m.score?.team2 ?? 0}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(m.match_id)}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Match"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <Link 
                    href={`/admin/football/${m.match_id}`}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all text-center ${gender === 'f' ? 'bg-zinc-800 text-white hover:bg-zinc-900' : 'bg-zinc-800 hover:bg-accent hover:text-white'}`}
                  >
                    Manage Match
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
