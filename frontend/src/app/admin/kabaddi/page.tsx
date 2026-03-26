/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Trophy, Activity, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Fetch failed: ${url}`, res.status);
      throw new Error(`API Error: ${res.status}`);
    }
    const data = await res.json();
    console.log(`Fetched from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};
const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

type Team = { _id: string; name: string; shortName: string; wins: number; losses: number; matches: number; points: number; scoreDiff: number; group: string };

function TeamRow({ team, rank, onUpdate, onDelete }: { team: Team; rank: number; onUpdate: (t: Team) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });
  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);
  const f = (k: keyof Team, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft({ ...team }); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className={`p-3 text-center w-12 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">{team.shortName}</div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-200 text-sm">{team.name}</span>
            <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">Group {team.group || "A"}</span>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.wins}</td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.losses}</td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.matches}</td>
      <td className="p-3 text-center text-accent font-bold">{team.points}</td>
      <td className="p-3 text-center text-zinc-500 text-xs">{team.scoreDiff ?? 0}</td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-accent hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-accent/30 bg-accent/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <div className="flex flex-col gap-1">
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-28" value={draft.name} onChange={e => f("name", e.target.value)} />
          <div className="flex gap-1">
            <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-16" value={draft.shortName} onChange={e => f("shortName", e.target.value)} />
            <select className="bg-zinc-800 rounded px-1 py-1 text-[10px] w-12 font-bold text-accent" value={draft.group || "A"} onChange={e => f("group", e.target.value)}>
              <option value="A">GP A</option><option value="B">GP B</option>
            </select>
          </div>
        </div>
      </td>
      <td className="p-2"><input type="number" min={0} className="w-12 bg-zinc-800 rounded px-2 py-1 text-xs text-center" value={draft.wins} onChange={e => f("wins", +e.target.value)} /></td>
      <td className="p-2"><input type="number" min={0} className="w-12 bg-zinc-800 rounded px-2 py-1 text-xs text-center" value={draft.losses} onChange={e => f("losses", +e.target.value)} /></td>
      <td className="p-2 text-center text-xs text-zinc-500">{(draft.wins || 0) + (draft.losses || 0)}</td>
      <td className="p-2 text-center text-xs text-accent font-bold">{(draft.wins || 0) * 2}</td>
      <td className="p-2"><input type="number" className="w-16 bg-zinc-800 rounded px-2 py-1 text-xs text-center" value={draft.scoreDiff ?? 0} onChange={e => f("scoreDiff", parseFloat(e.target.value) || 0)} /></td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function KabaddiAdminPage() {
  const { gender } = useGender();
  const genderLabel = gender === "f" ? "Women's" : "Men's";

  // API Routes
  const MATCHES_API = `/api/kabaddi?gender=${gender}`;
  const LB_API = `/api/kabaddi-leaderboard?category=${gender === "m" ? "boys" : "girls"}`;

  // Fetching Data
  const { data: matches, mutate: mutateMatches } = useSWR(MATCHES_API, fetcher);
  const { data: teams, mutate: mutateTeams } = useSWR(LB_API, fetcher);

  const validMatches = Array.isArray(matches) ? matches : [];
  const validTeams: Team[] = Array.isArray(teams) ? teams : [];

  useEffect(() => {
    console.log("Leaderboard data:", teams);
  }, [teams]);

  // Match Form State
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newMatch, setNewMatch] = useState({
    match_id: `KBD${Math.floor(Math.random() * 1000)}`,
    team_a: "", team_a_short: "",
    team_b: "", team_b_short: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "20:00",
    format: "Standard",
    status: "UPCOMING",
  });

  // LB Form State
  const [saveMsg, setSaveMsg] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", wins: 0, losses: 0, scoreDiff: 0, group: "A" });

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  // Handlers
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    const payload = {
      match_id: newMatch.match_id,
      date: newMatch.date,
      startTime: newMatch.startTime,
      format: newMatch.format,
      status: newMatch.status,
      teams: {
        team_a: { name: newMatch.team_a, score: 0 },
        team_b: { name: newMatch.team_b, score: 0 }
      },
      current_half: 1,
      recent_raids: [],
      halves: []
    };
    try {
      console.log("Creating match with payload:", payload);
      console.log("API URL:", MATCHES_API);
      const res = await fetch(MATCHES_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      console.log("Response status:", res.status);
      if (!res.ok) { const data = await res.json(); console.error("Error response:", data); setCreateError(data.error || "Failed"); return; }
      const createdData = await res.json();
      console.log("Match created:", createdData);
      setIsCreatingMatch(false);
      setNewMatch({ match_id: `KBD${Math.floor(Math.random() * 1000)}`, team_a: "", team_a_short: "", team_b: "", team_b_short: "", date: new Date().toISOString().split("T")[0], startTime: "20:00", format: "Standard", status: "UPCOMING" });
      mutateMatches();
    } catch (error) {
      console.error("Catch error:", error);
      setCreateError("Network error.");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure?")) return;
    console.log("Deleting match:", matchId, "API:", MATCHES_API);
    try {
      const res = await fetch(`${MATCHES_API}&id=${matchId}`, { method: "DELETE" });
      console.log("Delete response status:", res.status);
      if (res.ok) {
        console.log("Match deleted successfully");
        mutateMatches();
      }
      else {
        const error = await res.json();
        console.error("Delete error:", error);
        alert("Delete failed: " + (error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete catch error:", error);
      alert("Delete error: Network issue");
    }
  };

  const handleUpdateTeam = async (team: Team) => {
    try {
      console.log("Updating team:", team, "API:", LB_API);
      const res = await fetch(LB_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(team) });
      console.log("Update response status:", res.status);
      if (res.ok) {
        const updated = await res.json();
        console.log("Team updated:", updated);
        showMsg(`✅ ${team.name} updated!`);
        mutateTeams();
      }
      else {
        const d = await res.json();
        console.error("Update error:", d);
        showMsg(`❌ ${d.error || "Update failed"}`);
      }
    } catch (error) {
      console.error("Update catch error:", error);
      showMsg("❌ Network error");
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!confirm(`Delete ${team.name}?`)) return;
    try {
      console.log("Deleting team:", team, "API:", LB_API);
      const res = await fetch(`${LB_API}&id=${team._id}`, { method: "DELETE" });
      console.log("Delete response status:", res.status);
      if (res.ok) {
        console.log("Team deleted successfully");
        showMsg(`🗑 ${team.name} removed`);
        mutateTeams();
      } else {
        console.error("Delete failed");
        showMsg("❌ Delete failed");
      }
    } catch (error) {
      console.error("Delete catch error:", error);
      showMsg("❌ Network error");
    }
  };

  const handleAddTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.shortName.trim()) { showMsg("❌ Name/Short Name required"); return; }
    try {
      console.log("Adding team:", newTeam, "API:", LB_API);
      const res = await fetch(LB_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTeam) });
      console.log("Add response status:", res.status);
      if (res.ok) {
        const added = await res.json();
        console.log("Team added:", added);
        showMsg(`✅ ${newTeam.name} added!`);
        setNewTeam({ name: "", shortName: "", wins: 0, losses: 0, scoreDiff: 0, group: "A" });
        setAddMode(false);
        mutateTeams();
      } else {
        const d = await res.json();
        console.error("Add error:", d);
        showMsg(`❌ ${d.error || "Failed to add"}`);
      }
    } catch (error) {
      console.error("Add catch error:", error);
      showMsg("❌ Network error");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl border border-accent/20 shadow-neon">🤼</div>
        <div>
          <h1 className="text-3xl font-sports tracking-wider glow-text uppercase">{genderLabel} Kabaddi Admin</h1>
          <p className="text-zinc-500 text-sm">Manage matches and leaderboard in one place</p>
        </div>
      </div>

      {/* MATCH SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-sports tracking-wide">Match Management</h2>
          </div>
          <button onClick={() => setIsCreatingMatch(!isCreatingMatch)} className="btn-accent px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            {isCreatingMatch ? "Cancel" : <><Plus className="w-4 h-4" /> New Match</>}
          </button>
        </div>

        {isCreatingMatch && (
          <form onSubmit={handleCreateMatch} className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="label-sm">Match ID</label>
                <input required placeholder="Match ID" value={newMatch.match_id} onChange={e => setNewMatch({ ...newMatch, match_id: e.target.value })} className="input-field" />
              </div>
              <div className="space-y-1">
                <label className="label-sm">Status</label>
                <select value={newMatch.status} onChange={e => setNewMatch({ ...newMatch, status: e.target.value })} className="input-field">
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">LIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-sm">Date</label>
                <input type="date" required value={newMatch.date} onChange={e => setNewMatch({ ...newMatch, date: e.target.value })} className="input-field" />
              </div>
              <div className="space-y-1">
                <label className="label-sm">Start Time</label>
                <input type="time" required value={newMatch.startTime} onChange={e => setNewMatch({ ...newMatch, startTime: e.target.value })} className="input-field" />
              </div>
              <div className="space-y-1">
                <label className="label-sm">Teams</label>
                <div className="flex gap-2">
                  <select required value={newMatch.team_a} onChange={e => {
                    const s = validTeams.find(t => t.name === e.target.value);
                    setNewMatch({ ...newMatch, team_a: s?.name || "", team_a_short: s?.shortName || "" });
                  }} className="input-field flex-1 text-xs">
                    <option value="">— Team A —</option>
                    {validTeams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                  </select>
                  <select required value={newMatch.team_b} onChange={e => {
                    const s = validTeams.find(t => t.name === e.target.value);
                    setNewMatch({ ...newMatch, team_b: s?.name || "", team_b_short: s?.shortName || "" });
                  }} className="input-field flex-1 text-xs">
                    <option value="">— Team B —</option>
                    {validTeams.filter(t => t.name !== newMatch.team_a).map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {createError && <p className="text-red-500 text-sm">⚠ {createError}</p>}
            <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">INITIALIZE MATCH</button>
          </form>
        )}

        <div className="divide-y divide-zinc-800/50">
          {validMatches.length === 0 ? <div className="p-10 text-center text-zinc-500">No matches found.</div> : (
            validMatches.map(m => (
              <div key={m._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold bg-zinc-800 px-2 py-0.5 rounded text-accent">{m.match_id}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${m.status === 'LIVE' ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{m.status}</span>
                  </div>
                  <h3 className="font-sports text-xl tracking-wide">{m.teams.team_a.name} <span className="text-zinc-600">vs</span> {m.teams.team_b.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{m.date} · {m.startTime}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleDeleteMatch(m.match_id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                  <Link href={`/admin/kabaddi/match/${m.match_id}`} className="px-6 py-2 bg-zinc-800 hover:bg-accent text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-neon">Manage Live</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* LEADERBOARD SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-sports tracking-wide">Leaderboard Standings</h2>
          </div>
          <button onClick={() => setAddMode(!addMode)} className="btn-accent px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Team</>}
          </button>
        </div>

        {addMode && (
          <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[["Full Name", "name", "text"], ["Short", "shortName", "text"], ["Wins", "wins", "number"], ["Losses", "losses", "number"], ["Score Diff", "scoreDiff", "number"]].map(([l, k, t]) => (
                <div key={k}>
                  <label className="label-sm">{l}</label>
                  <input type={t} value={(newTeam as any)[k]} onChange={e => setNewTeam(p => ({ ...p, [k]: t === 'number' ? +e.target.value : e.target.value }))} className="input-field py-2" />
                </div>
              ))}
              <div>
                <label className="label-sm">Group</label>
                <select value={newTeam.group} onChange={e => setNewTeam(p => ({ ...p, group: e.target.value }))} className="input-field py-2 font-bold">
                  <option value="A">Group A</option><option value="B">Group B</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddTeam} className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/80 transition-all">ADD TEAM</button>
          </div>
        )}

        <div className="divide-y divide-zinc-800">
          {saveMsg && <div className={`px-6 py-3 text-center text-sm font-bold border-b border-zinc-800 ${saveMsg.startsWith('✅') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{saveMsg}</div>}
          {["A", "B"].map(gp => {
            const gpTeams = validTeams.filter(t => (t.group || "A") === gp);
            return (
              <div key={gp} className="p-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Group {gp} Standing
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/20">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-500 uppercase tracking-wider font-bold">
                        <th className="p-3 text-center w-12">#</th><th className="p-3 text-left">Team</th>
                        <th className="p-3 text-center">W</th><th className="p-3 text-center">L</th>
                        <th className="p-3 text-center">M</th><th className="p-3 text-center text-accent">Pts</th>
                        <th className="p-3 text-center">Score D.</th><th className="p-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpTeams.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-zinc-600 italic">No teams in Group {gp}.</td></tr> :
                        gpTeams.map((t, i) => <TeamRow key={t._id} team={t} rank={i} onUpdate={handleUpdateTeam} onDelete={() => handleDeleteTeam(t)} />)
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style jsx global>{`
        .glass { background: rgba(10, 10, 10, 0.7); backdrop-filter: blur(12px); }
        .glow-text { text-shadow: 0 0 20px rgba(var(--accent-rgb), 0.3); }
        .input-field { width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 12px; font-size: 14px; color: white; transition: all 0.3s; }
        .input-field:focus { border-color: #FFBF00; outline: none; box-shadow: 0 0 0 1px #FFBF00; }
        .label-sm { display: block; font-size: 10px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.1em; }
        .btn-accent { background: #FFBF00; color: black; transition: all 0.3s; }
        .btn-accent:hover { background: #E6AC00; box-shadow: 0 0 20px rgba(255, 191, 0, 0.4); }
      `}</style>
    </div>
  );
}
