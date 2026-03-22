/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Activity, Trash2, Pencil, Check, X, Trophy } from "lucide-react";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

type FTeam = {
  _id: string; name: string; shortName: string;
  wins: number; draws: number; losses: number; matches: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number;
  group: string;
};

function FTeamRow({ team, rank, onUpdate, onDelete }: { team: FTeam; rank: number; onUpdate: (t: FTeam) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });
  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);
  const f = (k: keyof FTeam, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft({ ...team }); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">{team.shortName}</div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-200 text-sm">{team.name}</span>
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Group {team.group || "A"}</span>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-xs font-sports">{team.matches}</td>
      <td className="p-3 text-center text-zinc-100 text-xs font-bold">{team.wins}</td>
      <td className="p-3 text-center text-zinc-400 text-xs">{team.draws}</td>
      <td className="p-3 text-center text-zinc-400 text-xs">{team.losses}</td>
      <td className="p-3 text-center text-green-400 text-xs font-bold">{team.goalDifference}</td>
      <td className="p-3 text-center text-accent font-sports text-sm">{team.points}</td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-green-600 hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-green-500/20 bg-green-500/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <div className="space-y-1">
          <input className="input-field py-1 text-xs" value={draft.name} onChange={e => f("name", e.target.value)} />
          <div className="flex gap-1">
            <input className="input-field py-1 text-xs w-20" value={draft.shortName} onChange={e => f("shortName", e.target.value)} />
            <select className="input-field py-1 text-[10px] w-16 font-bold text-green-500" value={draft.group||"A"} onChange={e => f("group", e.target.value)}>
              <option value="A">GP A</option><option value="B">GP B</option>
            </select>
          </div>
        </div>
      </td>
      <td className="p-2 text-center text-zinc-600 text-[10px]">{(draft.wins||0)+(draft.draws||0)+(draft.losses||0)}</td>
      <td className="p-2"><input type="number" className="w-10 input-field p-1 text-center text-xs" value={draft.wins} onChange={e => f("wins", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className="w-10 input-field p-1 text-center text-xs" value={draft.draws} onChange={e => f("draws", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className="w-10 input-field p-1 text-center text-xs" value={draft.losses} onChange={e => f("losses", +e.target.value)} /></td>
      <td className="p-2 text-center text-[10px] text-green-500">{(draft.goalsFor||0)-(draft.goalsAgainst||0)}</td>
      <td className="p-2 text-center font-sports text-accent text-xs">{(draft.wins||0)*3+(draft.draws||0)}</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function FootballAdminPage() {
  const { gender } = useGender();
  const genderLabel = gender === "f" ? "Women's" : "Men's";
  
  const MATCHES_API = `/api/football/matches?gender=${gender}`;
  const LB_API = `/api/football/leaderboard?gender=${gender}`;
  
  const { data: matches, mutate: mutateMatches } = useSWR(MATCHES_API, fetcher);
  const { data: teams, mutate: mutateTeams } = useSWR(LB_API, fetcher);

  const validMatches = Array.isArray(matches) ? matches : [];
  const validTeams: FTeam[] = Array.isArray(teams) ? teams : [];

  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newMatch, setNewMatch] = useState({ 
    match_id: `FB${Math.floor(Math.random() * 900) + 100}`, 
    team1: "", 
    team2: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "04:30 PM"
  });

  const [saveMsg, setSaveMsg] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, group: "A" });

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    const payload = { 
      ...newMatch, 
      sport: "football", 
      status: "UPCOMING", 
      score: { team1: 0, team2: 0 }, 
      teams: { team1: newMatch.team1, team2: newMatch.team2 },
      date: newMatch.date,
      startTime: newMatch.startTime
    };
    try {
      const res = await fetch(MATCHES_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); setCreateError(d.error || "Failed"); return; }
      setIsCreatingMatch(false);
      setNewMatch({ 
        match_id: `FB${Math.floor(Math.random() * 900) + 100}`, 
        team1: "", 
        team2: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "04:30 PM"
      });
      mutateMatches();
    } catch { setCreateError("Network error."); }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`${MATCHES_API}&id=${id}`, { method: "DELETE" });
    if (res.ok) mutateMatches();
    else alert("Delete failed");
  };

  const handleUpdateTeam = async (t: FTeam) => {
    console.log(`[FootballAdminPage] Updating team group to: ${t.group}`);
    const res = await fetch(LB_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    if (res.ok) { showMsg(`✅ ${t.name} updated!`); mutateTeams(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  const handleDeleteTeam = async (t: FTeam) => {
    if (!confirm(`Delete ${t.name}?`)) return;
    const res = await fetch(`${LB_API}&id=${t._id}`, { method: "DELETE" });
    if (res.ok) { showMsg(`🗑 ${t.name} removed`); mutateTeams(); }
    else showMsg("❌ Delete failed");
  };

  const handleAddTeam = async () => {
    if (!newTeam.name.trim()) return;
    const res = await fetch(LB_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTeam) });
    if (res.ok) { showMsg(`✅ ${newTeam.name} added!`); setNewTeam({ name: "", shortName: "", wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, group: "A" }); setAddMode(false); mutateTeams(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-2xl border border-green-500/20 shadow-neon">⚽</div>
        <div>
          <h1 className="text-3xl font-sports tracking-wider glow-text uppercase font-black">{genderLabel} Football Admin</h1>
          <p className="text-zinc-500 text-sm">Matches and Pool Standings</p>
        </div>
      </div>

      {/* MATCHES */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
           <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-green-500" /><h2 className="text-xl font-sports">Matches</h2></div>
           <button onClick={() => setIsCreatingMatch(!isCreatingMatch)} className="btn-green px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
             {isCreatingMatch ? "Cancel" : <><Plus className="w-4 h-4" /> New Match</>}
           </button>
        </div>
        {isCreatingMatch && (
          <form onSubmit={handleCreateMatch} className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4 animate-in slide-in-from-top">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <input required placeholder="Match ID" value={newMatch.match_id} onChange={e=>setNewMatch({...newMatch, match_id: e.target.value})} className="input-field" />
               <select required value={newMatch.team1} onChange={e=>setNewMatch({...newMatch, team1: e.target.value})} className="input-field">
                 <option value="">— Team 1 —</option>
                 {validTeams.map(t=><option key={t._id} value={t.name}>{t.name}</option>)}
               </select>
               <select required value={newMatch.team2} onChange={e=>setNewMatch({...newMatch, team2: e.target.value})} className="input-field">
                 <option value="">— Team 2 —</option>
                 {validTeams.filter(t=>t.name!==newMatch.team1).map(t=><option key={t._id} value={t.name}>{t.name}</option>)}
               </select>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="label-sm">Match Date</label>
                  <input type="date" value={newMatch.date} onChange={e=>setNewMatch({...newMatch, date: e.target.value})} className="input-field" />
               </div>
               <div>
                  <label className="label-sm">Start Time</label>
                  <input placeholder="e.g. 04:30 PM" value={newMatch.startTime} onChange={e=>setNewMatch({...newMatch, startTime: e.target.value})} className="input-field" />
               </div>
             </div>
             {createError && <p className="text-red-500 text-sm">{createError}</p>}
             <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-all">INITIALIZE MATCH</button>
          </form>
        )}
        <div className="divide-y divide-zinc-800/50">
           {validMatches.length === 0 ? <div className="p-10 text-center text-zinc-500 font-medium italic">No matches scheduled.</div> : (
              validMatches.map(m => (
                <div key={m.match_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/30 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black bg-zinc-800 px-2 py-0.5 rounded text-green-500 tracking-tighter">{m.match_id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${m.status.includes('HALF') ? 'bg-green-500/10 border-green-500 text-green-500 animate-pulse' : 'bg-background border-zinc-800 text-zinc-500'}`}>{m.status.replace('_',' ')}</span>
                    </div>
                    <h3 className="font-sports text-xl uppercase tracking-tighter">{m.teams.team1} <span className="text-zinc-600 font-normal lowercase italic px-1">vs</span> {m.teams.team2}</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-bold">LIVE SCORE: <span className="text-zinc-300">{m.score?.team1 ?? 0} − {m.score?.team2 ?? 0}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>handleDeleteMatch(m.match_id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                    <Link href={`/admin/football/${m.match_id}`} className="px-6 py-2 bg-zinc-800 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">Manage Match</Link>
                  </div>
                </div>
              ))
           )}
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
           <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-green-500" /><h2 className="text-xl font-sports">Leaderboard</h2></div>
           <button onClick={()=>setAddMode(!addMode)} className="btn-green px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
             {addMode ? "Cancel" : <><Plus className="w-4 s-4" /> Add Team</>}
           </button>
        </div>
        {addMode && (
          <form className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4 animate-in slide-in-from-top">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               {[["Name","name","text"],["Short","shortName","text"],["W","wins","number"],["D","draws","number"],["L","losses","number"],["GF","goalsFor","number"],["GA","goalsAgainst","number"]].map(([l,k,t])=>(
                 <div key={k}><label className="label-sm">{l}</label><input type={t} value={(newTeam as any)[k]} onChange={e=>setNewTeam(p=>({...p,[k]:t==='number'?+e.target.value:e.target.value}))} className="input-field py-2" /></div>
               ))}
               <div><label className="label-sm">Group</label><select value={newTeam.group} onChange={e=>setNewTeam(p=>({...p,group:e.target.value}))} className="input-field py-2 font-bold text-green-500"><option value="A">Group A</option><option value="B">Group B</option></select></div>
             </div>
             <button type="button" onClick={handleAddTeam} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg">ADD FRANCHISE</button>
          </form>
        )}
        <div className="divide-y divide-zinc-800">
          {saveMsg && <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${saveMsg.includes('✅')?'bg-green-500/10 text-green-500':'bg-red-500/10 text-red-500'}`}>{saveMsg}</div>}
          {["A", "B"].map(gp => {
            const gpTeams = validTeams.filter(t => (t.group || "A") === gp);
            return (
              <div key={gp} className="p-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Group {gp} Pool</h3>
                <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/30">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase font-black tracking-tighter">
                        <th className="p-3 w-10">POS</th><th className="p-3 text-left">FRANCHISE</th><th className="p-3">M</th><th className="p-3">W</th><th className="p-3">D</th><th className="p-3">L</th><th className="p-3 text-green-500">GD</th><th className="p-3 text-accent">PTS</th><th className="p-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpTeams.length === 0 ? <tr><td colSpan={9} className="p-8 text-center text-zinc-600 italic">No rankings yet.</td></tr> : 
                        gpTeams.map((t, i) => <FTeamRow key={t._id} team={t} rank={i} onUpdate={handleUpdateTeam} onDelete={() => handleDeleteTeam(t)} />)
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
        .glass { background: rgba(8, 8, 8, 0.8); backdrop-filter: blur(16px); }
        .glow-text { text-shadow: 0 0 25px rgba(34, 197, 94, 0.3); }
        .shadow-neon { box-shadow: 0 0 15px rgba(34, 197, 94, 0.2); }
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 10px; padding: 10px; font-size: 13px; color: white; }
        .input-field:focus { border-color: #22c55e; outline: none; }
        .label-sm { display: block; font-size: 9px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.1em; }
        .btn-green { background: #15803d; color: white; transition: all 0.2s; }
        .btn-green:hover { background: #16a34a; box-shadow: 0 0 15px rgba(34,197,94,0.4); }
      `}</style>
    </div>
  );
}
