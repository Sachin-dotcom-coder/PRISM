/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, RefreshCw, Pencil, Trash2, Activity, Trophy, Check, X } from 'lucide-react';
import Link from 'next/link';
import MatchForm from './components/MatchForm';
import { ITableTennisMatch } from './types';
import { getMatches, deleteMatch } from './services/tableTennisApi';
import { useGender } from '@/app/components/Providers';
import { DEPARTMENT_OPTIONS } from '../shared/departmentOptions';

interface TTLeaderboardEntry {
  leaderboard_id: number;
  dept_name: string;
  category: 'men' | 'women';
  group: string;
  points: string;
  wins?: number;
  losses?: number;
  matches?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const LB_API = `${BASE_URL}/tt-lead`;

const RANK_COLORS = [
  "text-yellow-400 font-bold",
  "text-zinc-300 font-bold",
  "text-amber-600 font-bold",
];

// ─── Leaderboard Row ─────────────────────────────────────────────────────────
function TTTeamRow({ team, rank, onUpdate, onDelete }: { 
  team: TTLeaderboardEntry; 
  rank: number; 
  onUpdate: (t: TTLeaderboardEntry) => void; 
  onDelete: () => void; 
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const GROUPS = ["A", "B", "C", "D"];

  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
      <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
      <td className="p-3">
        <span className="font-[900] text-white tracking-widest uppercase text-sm">{team.dept_name}</span>
      </td>
      <td className="p-3 text-center text-zinc-400 text-xs font-mono font-bold">{team.group}</td>
      <td className="p-3 text-center text-zinc-300 text-sm">{team.matches ?? 0}</td>
      <td className="p-3 text-center text-green-400 text-sm font-black">{team.wins ?? 0}</td>
      <td className="p-3 text-center text-red-400 text-sm">{team.losses ?? 0}</td>
      <td className="p-3 text-center text-[#FFBF00] font-mono text-sm font-black">{(team.wins || 0) * 3}</td>
      <td className="p-3 text-right">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-[#FFBF00] hover:text-black transition-all text-zinc-400">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-[#FFBF00]/20 bg-[#FFBF00]/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <select className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-[#FFBF00]" value={draft.dept_name} onChange={(e: any) => setDraft((p: any) => ({ ...p, dept_name: e.target.value }))}>
          {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </td>
      <td className="p-2">
        <select className="w-14 bg-zinc-800 border border-zinc-700 rounded p-1.5 text-center text-xs text-white outline-none focus:border-[#FFBF00]" value={draft.group} onChange={(e: any) => setDraft((p: any) => ({ ...p, group: e.target.value }))}>
          {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </td>
      <td className="p-2">
        <input className="w-14 bg-zinc-800 border border-zinc-700 rounded p-1.5 text-center text-xs text-white outline-none focus:border-[#FFBF00]" value={draft.points} onChange={(e: any) => setDraft((p: any) => ({ ...p, points: e.target.value }))} />
      </td>
      <td colSpan={3} className="p-2 text-center text-[10px] text-zinc-500 italic uppercase tracking-tighter">Auto-calculated (Matches/Wins/Loss)</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-[#FFBF00] text-black hover:bg-yellow-500 transition-all"><Check className="w-4 h-4" /></button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-all"><X className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TableTennisAdminPage() {
  const { gender: globalGender } = useGender();
  const gender = globalGender === "f" ? "women" : "men";
  const lbCategory = gender; // Synchronized with matches (men/women)

  const [matches, setMatches] = useState<ITableTennisMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<ITableTennisMatch | null>(null);

  const [lbEntries, setLbEntries] = useState<TTLeaderboardEntry[]>([]);
  const [standings, setStandings] = useState<Record<string, any[]>>({});
  const [addMode, setAddMode] = useState(false);
  const [lbMsg, setLbMsg] = useState('');
  const [nextId, setNextId] = useState(1);
  const [newEntry, setNewEntry] = useState<Partial<TTLeaderboardEntry>>({
    dept_name: '', category: lbCategory, group: 'A', points: '0',
  });

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMatches(gender as any);
      setMatches(res || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gender]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const [entriesRes, standingsRes] = await Promise.all([
        fetch(`${LB_API}`),
        fetch(`${LB_API}/standings?category=${lbCategory}`),
      ]);
      const entriesRaw = await entriesRes.json();
      const standingsData = await standingsRes.json();
      // Backend returns { data: [...] } shape
      const entries: TTLeaderboardEntry[] = Array.isArray(entriesRaw)
        ? entriesRaw
        : Array.isArray(entriesRaw?.data)
          ? entriesRaw.data
          : [];
      setLbEntries(entries);
      setStandings(standingsData && typeof standingsData === 'object' ? standingsData : {});
      console.log("TT Leaderboard rows fetched:", entries.length);
      console.log("TT Standings dict fetched:", Object.keys(standingsData || {}).length);
      if (entries.length > 0) {
        setNextId(Math.max(...entries.map((e: any) => e.leaderboard_id ?? 0)) + 1);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  }, [lbCategory]);

  useEffect(() => {
    fetchMatches();
    fetchLeaderboard();
  }, [gender, fetchMatches, fetchLeaderboard]);

  useEffect(() => {
    setNewEntry((p: any) => ({ ...p, category: lbCategory }));
  }, [lbCategory]);

  const showMsg = (msg: string) => { setLbMsg(msg); setTimeout(() => setLbMsg(''), 3000); };

  // ─── Handlers ───────────────────────────────────────────────
  const handleAddNew = () => { setEditingMatch(null); setShowForm(true); };
  const handleEdit = (match: ITableTennisMatch) => { setEditingMatch(match); setShowForm(true); };
  const handleDelete = async (match_id: number) => {
    if (!confirm('Delete match?')) return;
    try { await deleteMatch(match_id); fetchMatches(); fetchLeaderboard(); } catch (err: any) { alert(err.message); }
  };
  const onFormSuccess = () => { setShowForm(false); fetchMatches(); fetchLeaderboard(); };

  const handleAddEntry = async () => {
    if (!newEntry.dept_name) return;
    const res = await fetch(LB_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEntry, leaderboard_id: nextId }),
    });
    if (res.ok) {
      showMsg('✅ Department registered!');
      setAddMode(false);
      setNewEntry({ dept_name: '', category: lbCategory, group: 'A', points: '0' });
      fetchLeaderboard();
    }
  };

  const handleUpdateEntry = async (t: TTLeaderboardEntry) => {
    const res = await fetch(`${LB_API}/${t.leaderboard_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dept_name: t.dept_name, category: t.category, group: t.group, points: t.points }),
    });
    if (res.ok) { showMsg('✅ Updated!'); fetchLeaderboard(); }
  };

  const handleDeleteEntry = async (leaderboard_id: number) => {
    if (!confirm('Remove entry?')) return;
    const res = await fetch(`${LB_API}/${leaderboard_id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('🗑 Entry removed'); fetchLeaderboard(); }
  };

  const filteredEntries = useMemo(() => lbEntries.filter(e => e.category === lbCategory), [lbEntries, lbCategory]);
  // Ensure Group A and B are always rendered even if empty
  const groups = useMemo(() => {
    const existingGroups = [...new Set(filteredEntries.map(e => e.group))];
    return Array.from(new Set([...existingGroups, "A", "B"])).sort();
  }, [filteredEntries]);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto pb-24 min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/20 flex items-center justify-center text-[#FFBF00]">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-[900] tracking-widest text-[#FFBF00] uppercase">Table Tennis CMS</h1>
          </div>
        </div>

        {!showForm && (
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchMatches(); fetchLeaderboard(); }} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 transition-all hover:bg-zinc-800">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-6 py-2 bg-[#FFBF00] hover:bg-yellow-500 text-black rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-[#FFBF00]/20">
              <Plus className="w-4 h-4" /> Create Match
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <MatchForm initialData={editingMatch} gender={gender} onSuccess={onFormSuccess} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          {/* Matches Table */}
          <section className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
             <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 flex items-center gap-3">
               <Activity className="w-5 h-5 text-[#FFBF00]" />
               <h2 className="text-lg font-[900] text-white uppercase tracking-widest">Matches — {gender}</h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider">
                   <tr>
                     <th className="text-left p-4">ID</th>
                     <th className="text-left p-4">Departments</th>
                     <th className="text-left p-4">Stage</th>
                     <th className="text-center p-4">Date</th>
                     <th className="text-center p-4">Sets Won</th>
                     <th className="text-center p-4">Status</th>
                     <th className="text-center p-4">Winner</th>
                     <th className="text-right p-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/30">
                   {loading && matches.length === 0 ? (
                     <tr><td colSpan={8} className="p-10 text-center text-[#FFBF00] font-bold animate-pulse">Loading matches...</td></tr>
                   ) : matches.length === 0 ? (
                     <tr><td colSpan={8} className="p-10 text-center text-zinc-500">No table tennis matches found.</td></tr>
                   ) : (
                     matches.map((match) => (
                       <tr key={match.match_id} className="hover:bg-zinc-900/40 transition-colors group">
                         <td className="p-4 text-zinc-500 font-mono text-xs">{match.match_id}</td>
                         <td className="p-4">
                           <span className="font-bold text-white tracking-widest uppercase">{match.team1_department}</span>
                           <span className="text-[#FFBF00] mx-2 text-[10px] font-black font-mono bg-[#FFBF00]/10 px-1.5 py-0.5 rounded">VS</span>
                           <span className="font-bold text-white tracking-widest uppercase">{match.team2_department}</span>
                         </td>
                         <td className="p-4"><div className="text-white font-bold text-xs uppercase tracking-tighter opacity-70">{match.match_stage}</div></td>
                         <td className="p-4 text-center text-zinc-400 text-[10px] uppercase font-mono">{new Date(match.match_date).toLocaleString()}</td>
                         <td className="p-4 text-center">
                           <div className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                             <span className="text-[#FFBF00] font-black text-base">{match.team1_score ?? 0}</span>
                             <span className="text-zinc-600 font-black">-</span>
                             <span className="text-[#FFBF00] font-black text-base">{match.team2_score ?? 0}</span>
                           </div>
                         </td>
                         <td className="p-4 text-center">
                           <span className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-[0.2em] rounded border ${
                             match.match_status === 'scheduled' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                             'border-green-500/30 text-green-400 bg-green-500/10'
                           }`}>
                             {match.match_status}
                           </span>
                         </td>
                         <td className="p-4 text-center font-black text-[#FFBF00] tracking-widest uppercase text-xs">{match.winner || '-'}</td>
                         <td className="p-4 text-right">
                           <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(match)} className="p-2 rounded bg-zinc-800 text-zinc-400 hover:text-[#FFBF00] transition-all"><Pencil className="w-4 h-4"/></button>
                             <button onClick={() => handleDelete(match.match_id)} className="p-2 rounded bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </section>

          {/* Leaderboard Section */}
          <section className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#FFBF00]" />
                <h2 className="text-lg font-[900] text-white uppercase tracking-widest">Leaderboard — {lbCategory}</h2>
              </div>
              <button onClick={() => setAddMode(!addMode)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg text-sm font-bold transition-all hover:bg-zinc-800">
                {addMode ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} Add Dept
              </button>
            </div>

            {addMode && (
              <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Department Name</label>
                  <select value={newEntry.dept_name} onChange={(e: any) => setNewEntry((p: any) => ({ ...p, dept_name: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#FFBF00]">
                    <option value="">Select Dept</option>
                    {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Group</label>
                  <select value={newEntry.group} onChange={(e: any) => setNewEntry((p: any) => ({ ...p, group: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#FFBF00]">
                    {["A", "B", "C", "D"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Points</label>
                  <input placeholder="0" value={newEntry.points} onChange={(e: any) => setNewEntry((p: any) => ({ ...p, points: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#FFBF00]"/>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button onClick={handleAddEntry} className="w-full h-[46px] bg-[#FFBF00] text-black font-black rounded-lg uppercase tracking-widest text-sm shadow-lg hover:shadow-[#FFBF00]/20 transition-all">Register Department</button>
                </div>
              </div>
            )}

            {lbMsg && (
              <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${lbMsg.includes('✅') ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'bg-red-500/10 text-red-400'}`}>
                {lbMsg}
              </div>
            )}

            <div className="divide-y divide-zinc-800/50">
              {groups.map(gp => {
                const rawStandings: any[] = standings[gp] ?? [];
                // Sort by wins
                const sortedStandings = [...rawStandings].sort((a, b) => (b.wins || 0) - (a.wins || 0));
                
                const entryLookup: Record<string, TTLeaderboardEntry> = {};
                filteredEntries.filter(e => e.group === gp).forEach(e => { entryLookup[e.dept_name] = e; });

                const gpTeams: TTLeaderboardEntry[] = sortedStandings.length > 0
                  ? sortedStandings
                      .filter((t: any) => entryLookup[t.dept_name])
                      .map((t: any) => ({
                        ...t,
                        leaderboard_id: entryLookup[t.dept_name]?.leaderboard_id ?? 0,
                        category: lbCategory,
                        group: gp,
                      }))
                  : filteredEntries.filter(e => e.group === gp);

                return (
                  <div key={gp} className="p-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00]" />
                      Group {gp} Standings
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/30">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase font-bold tracking-tighter">
                            <th className="p-3 w-10">POS</th>
                            <th className="p-3 text-left">Department</th>
                            <th className="p-3">Group</th>
                            <th className="p-3">MP</th>
                            <th className="p-3">Wins</th>
                            <th className="p-3">Loss</th>
                            <th className="p-3 text-[#FFBF00]">PTS</th>
                            <th className="p-3 w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {gpTeams.length === 0 ? (
                            <tr><td colSpan={8} className="p-8 text-center text-zinc-700 italic">No teams registered in Group {gp}.</td></tr>
                          ) : (
                            gpTeams.map((t, i) => (
                              <TTTeamRow key={t.leaderboard_id || t.dept_name} team={t} rank={i} onUpdate={handleUpdateEntry} onDelete={() => handleDeleteEntry(t.leaderboard_id)} />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
