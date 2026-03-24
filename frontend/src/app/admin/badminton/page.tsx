/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Activity, Trash2, Pencil, Check, X, Trophy } from "lucide-react";
import { useGender } from "@/app/components/Providers";

// --- API FETCHERS ---
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- TYPES ---
export type BTeam = {
  _id?: string;
  leaderboard_id: number;
  dept_name: string;
  category: "boys" | "girls";
  group: string;
  wins?: number;
  losses?: number;
  matches?: number;
};

const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

// --- SUB-COMPONENT: LEADERBOARD ROW ---
function BTeamRow({ team, rank, onUpdate, onDelete }: { team: BTeam; rank: number; onUpdate: (t: BTeam) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const f = (k: keyof BTeam, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
            ID:{team.leaderboard_id}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-200 text-sm">{team.dept_name}</span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">
              {team.category}
            </span>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-xs font-mono">{team.group}</td>
      <td className="p-3 text-center text-zinc-100 text-xs font-bold">{team.wins ?? 0}</td>
      <td className="p-3 text-center text-zinc-400 text-xs">{team.losses ?? 0}</td>
      <td className="p-3 text-center text-accent font-mono text-sm">{team.matches ?? 0}</td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-blue-500/20 bg-blue-500/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <input className="input-field py-1 text-xs mb-1" value={draft.dept_name} onChange={e => f("dept_name", e.target.value)} placeholder="Dept Name" />
        <div className="flex gap-1">
          <select className="input-field py-1 text-[10px]" value={draft.category} onChange={e => f("category", e.target.value as any)}>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
        </div>
      </td>
      <td className="p-2"><input className="w-12 input-field p-1 text-center text-xs" value={draft.group} onChange={e => f("group", e.target.value.toUpperCase())} /></td>
      <td colSpan={3} className="p-2 text-right text-[10px] text-zinc-500 italic">Auto-calculated from matches</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

// --- MAIN PAGE ---
export default function BadmintonAdminPage() {
  // Backend API routes (proxied via next.config.ts rewrites)
  const MATCHES_API = "/api/badminton";           // GET/POST /api/badminton
  const LB_API = "/api/badminton-leaderboard";    // GET/POST /api/badminton-leaderboard

  // Men / Women toggle (maps to gender field on matches, category boys/girls on leaderboard)
  const { gender: globalGender } = useGender();
  const genderTab = globalGender === "f" ? "women" : "men";
  // boys/girls is the leaderboard category that maps to men/women respectively
  const lbCategory: "boys" | "girls" = genderTab === "men" ? "boys" : "girls";

  // SWR: fetch matches filtered by gender
  const { data: matchesResponse, mutate: mutateMatches } = useSWR(
    `${MATCHES_API}?gender=${genderTab}`,
    fetcher
  );

  // SWR: fetch all leaderboard entries (we filter client-side by category)
  const { data: allEntries, mutate: mutateEntries } = useSWR(LB_API, fetcher);

  // SWR: fetch standings (we filter client-side by category)
  const { data: standings, mutate: mutateStandings } = useSWR(`${LB_API}/standings`, fetcher);

  // The backend wraps matches in { success, data: [...] }, handle both cases
  const validMatches: any[] = Array.isArray(matchesResponse)
    ? matchesResponse
    : Array.isArray(matchesResponse?.data)
    ? matchesResponse.data
    : [];

  const validEntries: BTeam[] = Array.isArray(allEntries) ? allEntries : [];

  // Filter leaderboard entries by current category tab
  const filteredEntries = validEntries.filter(e => e.category === lbCategory);

  const groups = filteredEntries.length > 0
    ? [...new Set(filteredEntries.map(e => e.group))]
    : ["A", "B"];

  // State
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [newMatch, setNewMatch] = useState({
    match_id: Math.floor(Math.random() * 9000) + 1000,
    team1_department: "",
    team2_department: "",
    match_stage: "group" as "group" | "semifinal" | "final",
    match_date: new Date().toISOString().slice(0, 10),
    gender: genderTab,
    venue: "",
    match_status: "scheduled" as "scheduled" | "completed",
    games: [] as any[],
    team1_score: 0,
    team2_score: 0,
    winner: "" as string | null
  });

  // Keep gender in match form in sync with tab
  useEffect(() => {
    setNewMatch(prev => ({ ...prev, gender: genderTab }));
  }, [genderTab]);

  const [newEntry, setNewEntry] = useState<Partial<BTeam>>({
    leaderboard_id: Math.floor(Math.random() * 10000),
    dept_name: "",
    category: lbCategory,
    group: "A"
  });

  // Keep new entry category in sync with tab
  useEffect(() => {
    setNewEntry(prev => ({ ...prev, category: lbCategory }));
  }, [lbCategory]);

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const addGame = () => {
    setNewMatch(prev => ({
      ...prev,
      games: [...prev.games, {
        game_number: prev.games.length + 1,
        game_type: "single",
        sets: [
          { team1_score: 0, team2_score: 0 },
          { team1_score: 0, team2_score: 0 },
          { team1_score: 0, team2_score: 0 }
        ],
        team1_score: 0,
        team2_score: 0,
        winner: null
      }]
    }));
  };

  const removeGame = (idx: number) => {
    setNewMatch(prev => {
      const games = prev.games.filter((_, i) => i !== idx).map((g, i) => ({ ...g, game_number: i + 1 }));
      return { ...prev, games };
    });
  };

  const updateGameType = (idx: number, type: "single" | "double") => {
    setNewMatch(prev => {
      const games = [...prev.games];
      games[idx] = { ...games[idx], game_type: type };
      return { ...prev, games };
    });
  };

  const updateSet = (gameIdx: number, setIdx: number, team: 1 | 2, score: number) => {
    setNewMatch(prev => {
      const games = [...prev.games];
      const game = { ...games[gameIdx] };
      const sets = [...game.sets];
      sets[setIdx] = { ...sets[setIdx], [`team${team}_score`]: score };
      
      let t1Sets = 0, t2Sets = 0;
      sets.forEach(s => {
        if (s.team1_score > s.team2_score) t1Sets++;
        else if (s.team2_score > s.team1_score) t2Sets++;
      });
      
      game.sets = sets;
      game.team1_score = t1Sets;
      game.team2_score = t2Sets;
      game.winner = t1Sets > t2Sets ? prev.team1_department : t2Sets > t1Sets ? prev.team2_department : null;
      
      games[gameIdx] = game;
      
      let t1Games = 0, t2Games = 0;
      games.forEach(g => {
        if (g.team1_score > g.team2_score) t1Games++;
        else if (g.team2_score > g.team1_score) t2Games++;
      });
      
      return {
        ...prev,
        games,
        team1_score: t1Games,
        team2_score: t2Games,
        winner: t1Games > t2Games ? prev.team1_department : t2Games > t1Games ? prev.team2_department : null,
        match_status: (t1Games > 0 || t2Games > 0) ? "completed" : "scheduled"
      };
    });
  };

  // --- MATCH HANDLERS ---
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(MATCHES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMatch,
          match_date: new Date(newMatch.match_date).toISOString(),
        })
      });
      if (res.ok) {
        setIsCreatingMatch(false);
        setNewMatch({
          match_id: Math.floor(Math.random() * 9000) + 1000,
          team1_department: "",
          team2_department: "",
          match_stage: "group",
          match_date: new Date().toISOString().slice(0, 10),
          gender: genderTab,
          venue: "",
          match_status: "scheduled",
          games: [],
          team1_score: 0,
          team2_score: 0,
          winner: null
        });
        mutateMatches();
        showMsg("✅ Match created!");
      } else {
        const d = await res.json();
        showMsg(`❌ ${d.message || "Match creation failed"}`);
      }
    } catch { showMsg("❌ Match creation failed"); }
  };

  const handleDeleteMatch = async (id: string | number) => {
    if (!confirm("Delete this match?")) return;
    const res = await fetch(`${MATCHES_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      mutateMatches();
      showMsg("🗑 Match deleted");
    }
  };

  // --- LEADERBOARD HANDLERS ---
  const handleAddEntry = async () => {
    if (!newEntry.dept_name) return;
    const res = await fetch(LB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry)
    });
    if (res.ok) {
      showMsg("✅ Entry added!");
      setAddMode(false);
      setNewEntry({
        leaderboard_id: Math.floor(Math.random() * 10000),
        dept_name: "",
        category: lbCategory,
        group: "A"
      });
      mutateEntries();
      mutateStandings();
    } else {
      const d = await res.json();
      showMsg(`❌ ${d.message || "Failed"}`);
    }
  };

  const handleUpdateEntry = async (t: BTeam) => {
    const res = await fetch(`${LB_API}/${t.leaderboard_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    });
    if (res.ok) {
      showMsg("✅ Updated!");
      mutateEntries();
      mutateStandings();
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`${LB_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("🗑 Entry removed");
      mutateEntries();
      mutateStandings();
    }
  };

  return (
    <div className="space-y-12 pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl border border-blue-500/20 shadow-neon">🏸</div>
        <div>
          <h1 className="text-3xl font-sports tracking-wider glow-text-blue uppercase font-black text-white">Badminton Admin</h1>
          <p className="text-zinc-500 text-sm">Matches and Department Standings</p>
        </div>
      </div>

      {/* MEN / WOMEN TOGGLE (removed, using global context instead) */}

      {/* MATCHES SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
           <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-sports text-white">Matches — {genderTab === "men" ? "Men" : "Women"}</h2></div>
           <button onClick={() => setIsCreatingMatch(!isCreatingMatch)} className="btn-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
             {isCreatingMatch ? "Cancel" : <><Plus className="w-4 h-4" /> New Match</>}
           </button>
        </div>
         {isCreatingMatch && (
          <form onSubmit={handleCreateMatch} className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div>
                 <label className="label-sm">Match ID</label>
                 <input required type="number" value={newMatch.match_id} onChange={e => setNewMatch({...newMatch, match_id: +e.target.value})} className="input-field" />
               </div>
               <div>
                 <label className="label-sm">Team 1 (Dept)</label>
                 <select required value={newMatch.team1_department} onChange={e => setNewMatch({...newMatch, team1_department: e.target.value})} className="input-field">
                   <option value="">— Select Team 1 —</option>
                   {validEntries.filter(t => t.category === lbCategory).map(t => <option key={t.leaderboard_id} value={t.dept_name}>{t.dept_name}</option>)}
                 </select>
               </div>
               <div>
                 <label className="label-sm">Team 2 (Dept)</label>
                 <select required value={newMatch.team2_department} onChange={e => setNewMatch({...newMatch, team2_department: e.target.value})} className="input-field">
                   <option value="">— Select Team 2 —</option>
                   {validEntries.filter(t => t.category === lbCategory && t.dept_name !== newMatch.team1_department).map(t => <option key={t.leaderboard_id} value={t.dept_name}>{t.dept_name}</option>)}
                 </select>
               </div>
               <div>
                 <label className="label-sm">Stage</label>
                 <select value={newMatch.match_stage} onChange={e => setNewMatch({...newMatch, match_stage: e.target.value as any})} className="input-field">
                    <option value="group">Group</option>
                    <option value="semifinal">Semifinal</option>
                    <option value="final">Final</option>
                 </select>
               </div>
               <div>
                 <label className="label-sm">Date</label>
                 <input required type="date" value={newMatch.match_date} onChange={e => setNewMatch({...newMatch, match_date: e.target.value})} className="input-field" />
               </div>
               <div>
                  <label className="label-sm">Venue</label>
                  <input type="text" value={newMatch.venue} onChange={e => setNewMatch({...newMatch, venue: e.target.value})} className="input-field" placeholder="Court 1" />
                </div>
              </div>

              {/* Games and Sets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-500" /> Games / Sets
                  </h3>
                  <button type="button" onClick={addGame} className="text-[10px] font-black uppercase bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">
                    + Add Game
                  </button>
                </div>

                {newMatch.games.length === 0 ? (
                  <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-600 text-xs italic">
                    No games added. Click "+ Add Game" to enter scores.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newMatch.games.map((game: any, gIdx: number) => (
                      <div key={gIdx} className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-4 mt-2">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">G{game.game_number}</span>
                            <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 self-start">
                              {["single", "double"].map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => updateGameType(gIdx, t as any)}
                                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                    game.game_type === t 
                                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                      : "text-zinc-500 hover:text-zinc-300"
                                  }`}
                                >
                                  {t}s
                                </button>
                              ))}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeGame(gIdx)} className="p-2 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 transition-all rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-2.5">
                          {game.sets.map((set: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all gap-4">
                              <span className="text-sm font-black text-zinc-500 uppercase tracking-widest shrink-0">Set {sIdx + 1}</span>
                              <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2">{newMatch.team1_department || "T1"}</span>
                                  <input 
                                    type="number" 
                                    value={set.team1_score} 
                                    onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                                    onChange={e => updateSet(gIdx, sIdx, 1, +e.target.value)}
                                    className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl text-center py-3.5 text-2xl font-black text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all tabular-nums font-mono"
                                  />
                                </div>
                                <span className="text-zinc-700 font-black text-xl mt-8">—</span>
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2">{newMatch.team2_department || "T2"}</span>
                                  <input 
                                    type="number" 
                                    value={set.team2_score} 
                                    onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                                    onChange={e => updateSet(gIdx, sIdx, 2, +e.target.value)}
                                    className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl text-center py-3.5 text-2xl font-black text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all tabular-nums font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-5 flex items-center justify-between text-xs font-black uppercase tracking-wider py-1 border-t border-zinc-900">
                          <span className="text-zinc-500">Game Score: <span className="text-white ml-2 text-sm">{game.team1_score} - {game.team2_score}</span></span>
                          {game.winner && <span className="text-blue-500 flex items-center gap-2 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10"><Trophy className="w-4 h-4" /> {game.winner}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Result Summary Box */}
              <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Match Summary</p>
                  <h4 className="font-sports text-lg text-white uppercase tracking-tight">
                    {newMatch.team1_department || "Team 1"} <span className="text-blue-500 mx-2">{newMatch.team1_score} - {newMatch.team2_score}</span> {newMatch.team2_department || "Team 2"}
                  </h4>
                </div>
                {newMatch.winner && (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 text-right">Overall Winner</p>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-lg shadow-blue-600/20">{newMatch.winner}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="px-2 py-1 rounded-lg bg-zinc-800 font-black text-blue-400 uppercase">{genderTab}</span>
                <span>Match status will be "completed" if scores are entered.</span>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20">SAVE MATCH DATA</button>
          </form>
        )}
        {saveMsg && <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${saveMsg.includes('✅') ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{saveMsg}</div>}
        <div className="divide-y divide-zinc-800/50">
           {validMatches.length === 0 ? <div className="p-10 text-center text-zinc-500 italic">No {genderTab} matches scheduled.</div> : (
              validMatches.map(m => (
                <div key={m.match_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/30 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black bg-zinc-800 px-2 py-0.5 rounded text-blue-500 tracking-tighter">#{m.match_id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500 uppercase`}>{m.match_status}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase">{m.match_stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <h3 className="font-sports text-xl uppercase tracking-tighter text-white">{m.team1_department} <span className="text-zinc-600 font-normal lowercase italic px-1">vs</span> {m.team2_department}</h3>
                       {m.match_status !== 'scheduled' && (
                         <div className="text-lg font-black font-mono text-white bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-500/20 shadow-inner">
                           {m.team1_score ?? 0} <span className="text-blue-500 mx-1">-</span> {m.team2_score ?? 0}
                         </div>
                       )}
                     </div>
                     {m.games && m.games.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-2">
                         {m.games.map((g: any, i: number) => (
                           <div key={i} className="text-[10px] font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-zinc-400">
                             G{g.game_number}: <span className={g.team1_score > g.team2_score ? "text-blue-400 font-bold" : "text-zinc-300"}>{g.team1_score}</span>-<span className={g.team2_score > g.team1_score ? "text-blue-400 font-bold" : "text-zinc-300"}>{g.team2_score}</span>
                           </div>
                         ))}
                       </div>
                     )}
                     {m.venue && <p className="text-[11px] text-zinc-500 mt-2">📍 {m.venue}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteMatch(m.match_id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                    <Link href={`/admin/badminton/${m.match_id}`} className="px-6 py-2 bg-zinc-800 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg">Manage Match</Link>
                  </div>
                </div>
              ))
           )}
        </div>
      </section>

      {/* LEADERBOARD SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
           <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-sports text-white">Leaderboard — {genderTab === "men" ? "Boys" : "Girls"}</h2></div>
           <button onClick={() => setAddMode(!addMode)} className="btn-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
             {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Dept</>}
           </button>
        </div>
        {addMode && (
          <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               <div><label className="label-sm">ID</label><input type="number" value={newEntry.leaderboard_id} onChange={e => setNewEntry(p => ({...p, leaderboard_id: +e.target.value}))} className="input-field py-2" /></div>
               <div><label className="label-sm">Dept</label><input placeholder="CS" value={newEntry.dept_name} onChange={e => setNewEntry(p => ({...p, dept_name: e.target.value}))} className="input-field py-2" /></div>
               <div><label className="label-sm">Category</label>
                 <select value={newEntry.category} onChange={e => setNewEntry(p => ({...p, category: e.target.value as any}))} className="input-field py-2">
                   <option value="boys">Boys (Men)</option><option value="girls">Girls (Women)</option>
                 </select>
               </div>
               <div><label className="label-sm">Group</label><input value={newEntry.group} onChange={e => setNewEntry(p => ({...p, group: e.target.value.toUpperCase()}))} className="input-field py-2" /></div>
             </div>
             <button onClick={handleAddEntry} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg">REGISTER DEPARTMENT</button>
          </div>
        )}
        <div className="divide-y divide-zinc-800">
          {groups.map(gp => {
            const rawStandings: any[] = standings ? standings[gp] ?? [] : [];

            const gpTeams: BTeam[] = filteredEntries
              .filter(e => e.group === gp)
              .map(e => {
                const s = rawStandings.find((t: any) => t.dept_name === e.dept_name && t.category === e.category);
                return { ...e, wins: s?.wins ?? 0, losses: s?.losses ?? 0, matches: s?.matches ?? 0 };
              })
              .sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0));

            return (
              <div key={gp} className="p-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Group {gp} Standings</h3>
                <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/30">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase font-black tracking-tighter">
                        <th className="p-3 w-10">POS</th><th className="p-3 text-left">DEPARTMENT</th><th className="p-3">GP</th><th className="p-3">WINS</th><th className="p-3">LOSS</th><th className="p-3 text-accent">MP</th><th className="p-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpTeams.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-zinc-600 italic">No rankings for this group yet.</td></tr> :
                        gpTeams.map((t: any, i: number) => <BTeamRow key={t.dept_name ?? t._id} team={{ ...t, leaderboard_id: t.leaderboard_id || 0 }} rank={i} onUpdate={handleUpdateEntry} onDelete={() => handleDeleteEntry(t.leaderboard_id)} />)
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
        .glow-text-blue { text-shadow: 0 0 25px rgba(59, 130, 246, 0.3); }
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 12px; padding: 12px 14px; font-size: 15px; color: white; }
        .input-field:focus { border-color: #3b82f6; outline: none; }
        .label-sm { display: block; font-size: 11px; font-weight: 900; color: #777; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.12em; }
        .btn-blue { background: #1d4ed8; color: white; transition: all 0.2s; }
        .btn-blue:hover { background: #2563eb; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
      `}</style>
    </div>
  );
}
