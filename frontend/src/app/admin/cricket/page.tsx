/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Trophy, Activity, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

type Team = { _id: string; name: string; shortName: string; wins: number; losses: number; matches: number; points: number; nrr: number; group: string };

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
      <td className="p-3 text-center text-zinc-500 text-xs">{team.nrr ?? 0}</td>
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
            <select className="bg-zinc-800 rounded px-1 py-1 text-[10px] w-12 font-bold text-accent" value={draft.group||"A"} onChange={e => f("group", e.target.value)}>
              <option value="A">GP A</option><option value="B">GP B</option>
            </select>
          </div>
        </div>
      </td>
      <td className="p-2"><input type="number" min={0} className="w-12 bg-zinc-800 rounded px-2 py-1 text-xs text-center" value={draft.wins} onChange={e => f("wins", +e.target.value)} /></td>
      <td className="p-2"><input type="number" min={0} className="w-12 bg-zinc-800 rounded px-2 py-1 text-xs text-center" value={draft.losses} onChange={e => f("losses", +e.target.value)} /></td>
      <td className="p-2 text-center text-xs text-zinc-500">{(draft.wins||0)+(draft.losses||0)}</td>
      <td className="p-2 text-center text-xs text-accent font-bold">{(draft.wins||0)*2}</td>
      <td className="p-2"><input type="number" step={0.01} className="w-16 bg-zinc-800 rounded px-2 py-1 text-xs text-center" value={draft.nrr??0} onChange={e => f("nrr", parseFloat(e.target.value)||0)} /></td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function CricketAdminPage() {
  const { gender } = useGender();
  const genderLabel = gender === "f" ? "Women's" : "Men's";
  
  // API Routes
  const MATCHES_API = `/api/matches?gender=${gender}`;
  const LB_API = `/api/leaderboard?gender=${gender}`;
  
  // Fetching Data
  const { data: matches, mutate: mutateMatches } = useSWR(MATCHES_API, fetcher);
  const { data: teams, mutate: mutateTeams } = useSWR(LB_API, fetcher);

  const validMatches = Array.isArray(matches) ? matches : [];
  const validTeams: Team[] = Array.isArray(teams) ? teams : [];

  // Match Form State
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newMatch, setNewMatch] = useState({
    match_id: `CRIC${Math.floor(Math.random() * 1000)}`,
    team1: "", team1Short: "",
    team2: "", team2Short: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    tossWinner: "",
    tossDecision: "Bat",
    stage: "Group"
  });

  // LB Form State
  const [saveMsg, setSaveMsg] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", wins: 0, losses: 0, nrr: 0, group: "A" });

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  // Handlers
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    // Derive batting/bowling teams from toss
    const tossWinner = newMatch.tossWinner || newMatch.team1;
    const otherTeam = tossWinner === newMatch.team1 ? newMatch.team2 : newMatch.team1;
    const battingTeam = newMatch.tossDecision === "Bat" ? tossWinner : otherTeam;
    const bowlingTeam = battingTeam === newMatch.team1 ? newMatch.team2 : newMatch.team1;

    const payload = {
      match_id: newMatch.match_id,
      date: newMatch.date,
      startTime: newMatch.startTime,
      stage: newMatch.stage,
      toss: { winner: newMatch.tossWinner, decision: newMatch.tossDecision },
      batting_team: battingTeam,
      bowling_team: bowlingTeam,
      teams: {
        team1: { name: newMatch.team1, shortName: newMatch.team1Short, players: [] },
        team2: { name: newMatch.team2, shortName: newMatch.team2Short, players: [] }
      }
    };
    try {
      const res = await fetch(MATCHES_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json(); setCreateError(data.error || "Failed"); return; }
      setIsCreatingMatch(false);
      setNewMatch({ match_id: `CRIC${Math.floor(Math.random() * 1000)}`, team1: "", team1Short: "", team2: "", team2Short: "", date: new Date().toISOString().split("T")[0], startTime: "14:00", tossWinner: "", tossDecision: "Bat", stage: "Group" });
      mutateMatches();
    } catch { setCreateError("Network error."); }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`${MATCHES_API}&id=${matchId}`, { method: "DELETE" });
    if (res.ok) mutateMatches();
    else alert("Delete failed");
  };

  const handleUpdateTeam = async (team: Team) => {
    const res = await fetch(LB_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(team) });
    if (res.ok) { showMsg(`✅ ${team.name} updated!`); mutateTeams(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!confirm(`Delete ${team.name}?`)) return;
    const res = await fetch(`${LB_API}&id=${team._id}`, { method: "DELETE" });
    if (res.ok) { showMsg(`🗑 ${team.name} removed`); mutateTeams(); }
    else showMsg("❌ Delete failed");
  };

  const handleAddTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.shortName.trim()) { showMsg("❌ Name/Short Name required"); return; }
    const res = await fetch(LB_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTeam) });
    if (res.ok) { showMsg(`✅ ${newTeam.name} added!`); setNewTeam({ name: "", shortName: "", wins: 0, losses: 0, nrr: 0, group: "A" }); setAddMode(false); mutateTeams(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl border border-accent/20 shadow-neon">🏏</div>
        <div>
          <h1 className="text-3xl font-sports tracking-wider glow-text uppercase">{genderLabel} Cricket Admin</h1>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input required placeholder="Match ID" value={newMatch.match_id} onChange={e => setNewMatch({...newMatch, match_id: e.target.value})} className="input-field" />
               <select value={newMatch.tossWinner} onChange={e => setNewMatch({...newMatch, tossWinner: e.target.value})} className="input-field">
                 <option value="">— Select Toss Winner —</option>
                 {newMatch.team1 && <option value={newMatch.team1}>{newMatch.team1}</option>}
                 {newMatch.team2 && <option value={newMatch.team2}>{newMatch.team2}</option>}
               </select>
               <select value={newMatch.tossDecision} onChange={e => setNewMatch({...newMatch, tossDecision: e.target.value})} className="input-field">
                 <option value="Bat">Bat</option><option value="Bowl">Bowl</option>
               </select>
               <select value={newMatch.stage} onChange={e => setNewMatch({...newMatch, stage: e.target.value})} className="input-field">
                 <option value="Group">Group Stage</option>
                 <option value="Semi-Final">Semi-Final</option>
                 <option value="Final">Final</option>
               </select>
               <div className="flex gap-2">
                 <select required value={newMatch.team1} onChange={e => {
                   const s = validTeams.find(t => t.name === e.target.value);
                   setNewMatch({...newMatch, team1: s?.name||"", team1Short: s?.shortName||""});
                 }} className="input-field flex-1">
                   <option value="">— Team 1 —</option>
                   {validTeams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                 </select>
                 <select required value={newMatch.team2} onChange={e => {
                   const s = validTeams.find(t => t.name === e.target.value);
                   setNewMatch({...newMatch, team2: s?.name||"", team2Short: s?.shortName||""});
                 }} className="input-field flex-1">
                   <option value="">— Team 2 —</option>
                   {validTeams.filter(t => t.name !== newMatch.team1).map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                 </select>
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
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${m.status==='LIVE' ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{m.status}</span>
                    {m.stage && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-accent/10 border-accent/30 text-accent">{m.stage}</span>}
                  </div>
                  <h3 className="font-sports text-xl tracking-wide">{m.teams.team1.shortName} <span className="text-zinc-600">vs</span> {m.teams.team2.shortName}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{m.date} · {m.startTime}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleDeleteMatch(m.match_id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                  <Link href={`/admin/match/${m.match_id}`} className="px-6 py-2 bg-zinc-800 hover:bg-accent text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-neon">Manage Live</Link>
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
               {[["Full Name","name","text"],["Short","shortName","text"],["Wins","wins","number"],["Losses","losses","number"],["NRR","nrr","number"]].map(([l,k,t]) => (
                 <div key={k}>
                   <label className="label-sm">{l}</label>
                   <input type={t} value={(newTeam as any)[k]} onChange={e => setNewTeam(p=>({...p,[k]:t==='number'?+e.target.value:e.target.value}))} className="input-field py-2" />
                 </div>
               ))}
               <div>
                 <label className="label-sm">Group</label>
                 <select value={newTeam.group} onChange={e=>setNewTeam(p=>({...p,group:e.target.value}))} className="input-field py-2 font-bold">
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
                        <th className="p-3 text-center">NRR</th><th className="p-3 w-20"></th>
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
