/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, ArrowLeft, RefreshCw, Pencil, Trash2, Activity, Trophy, Check, X } from 'lucide-react';
import Link from 'next/link';
import MatchForm from './components/MatchForm';
import { IBasketballMatch } from './types';
import { getMatches, deleteMatch } from './services/basketballApi';
import { useGender } from '@/app/components/Providers';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BasketballLeaderboardEntry {
  leaderboard_id: number;
  dept_name: string;
  category: 'boys' | 'girls';
  group: string;
  wins?: number;
  losses?: number;
  matches?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const LB_API = `${BASE_URL}/basketball-leaderboard`;

const RANK_COLORS = [
  "text-yellow-400 font-black",
  "text-zinc-300 font-black",
  "text-amber-600 font-black",
];

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function BasketballTeamRow({
  team, rank, onUpdate, onDelete,
}: {
  team: BasketballLeaderboardEntry;
  rank: number;
  onUpdate: (t: BasketballLeaderboardEntry) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing)
    return (
      <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors text-xs">
        <td className={`p-3 text-center w-10 ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            {/* REMOVED SHORTFORM BOX HERE */}
            <span className="font-[900] text-white tracking-widest uppercase">{team.dept_name}</span>
          </div>
        </td>
        <td className="p-3 text-center text-zinc-400 font-mono font-bold">{team.group}</td>
        <td className="p-3 text-center text-zinc-300">{team.matches ?? 0}</td>
        <td className="p-3 text-center text-green-400 font-black">{team.wins ?? 0}</td>
        <td className="p-3 text-center text-red-400">{team.losses ?? 0}</td>
        <td className="p-3 text-center text-[#FFBF00] font-mono font-black">
          {((team.wins ?? 0) * 2).toString()}
        </td>
        <td className="p-3">
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
        <input
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-[#FFBF00]"
          value={draft.dept_name}
          onChange={(e) => setDraft(p => ({ ...p, dept_name: e.target.value }))}
          placeholder="Dept Name"
        />
      </td>
      <td className="p-2">
        <input
          className="w-14 bg-zinc-800 border border-zinc-700 rounded p-1.5 text-center text-xs text-white outline-none focus:border-[#FFBF00]"
          value={draft.group}
          onChange={(e) => setDraft(p => ({ ...p, group: e.target.value.toUpperCase() }))}
        />
      </td>
      <td colSpan={4} className="p-2 text-center text-[10px] text-zinc-500 italic">Auto-calculated from matches</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-[#FFBF00] hover:bg-yellow-500 text-black">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BasketballAdminPage() {
  const { gender: globalGender, setGender: setGlobalGender } = useGender();
  const gender = globalGender === "f" ? "women" : "men";
  const lbCategory: 'boys' | 'girls' = gender === 'men' ? 'boys' : 'girls';

  const [matches, setMatches] = useState<IBasketballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<IBasketballMatch | null>(null);

  const [lbEntries, setLbEntries] = useState<BasketballLeaderboardEntry[]>([]);
  const [standings, setStandings] = useState<Record<string, any[]>>({});
  const [addMode, setAddMode] = useState(false);
  const [lbMsg, setLbMsg] = useState('');
  const [nextId, setNextId] = useState(1);
  const [newEntry, setNewEntry] = useState<Partial<BasketballLeaderboardEntry>>({
    dept_name: '',
    category: lbCategory,
    group: 'A',
  });

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMatches(gender);
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [gender]);

  const fetchLeaderboard = useCallback(async () => {
  try {
    // Pass the category (boys/girls) to the standings API
    const [entriesRes, standingsRes] = await Promise.all([
      fetch(`${LB_API}`),
      fetch(`${LB_API}/standings?category=${lbCategory}`), // ADDED QUERY PARAM
    ]);
    
    const entriesData = await entriesRes.json();
    const standingsData = await standingsRes.json();
    
    const entries: BasketballLeaderboardEntry[] = Array.isArray(entriesData) ? entriesData : [];
    setLbEntries(entries);

    // standingsData is now already filtered by the backend!
    if (standingsData && typeof standingsData === 'object') {
      const rekeyed: Record<string, any[]> = {};
      
      // Since the backend now returns groups like {"A": [...], "B": [...]},
      // and it's already filtered by gender, we just map it to our state keys.
      Object.keys(standingsData).forEach(groupName => {
        const key = `${lbCategory}-${groupName}`;
        rekeyed[key] = standingsData[groupName];
      });
      
      setStandings(rekeyed);
    }
    
    if (entries.length > 0) {
      setNextId(Math.max(...entries.map(e => e.leaderboard_id ?? 0)) + 1);
    }
  } catch (err) { 
    console.error("Leaderboard fetch error:", err); 
  }
}, [lbCategory]); // Re-run when gender/category changes

  useEffect(() => {
    fetchMatches();
    fetchLeaderboard();
  }, [gender, fetchMatches, fetchLeaderboard]);

  useEffect(() => {
    setNewEntry(p => ({ ...p, category: lbCategory }));
  }, [lbCategory]);

  const showMsg = (msg: string) => {
    setLbMsg(msg);
    setTimeout(() => setLbMsg(''), 3000);
  };

  // Match Handlers
  const handleAddNew = () => { setEditingMatch(null); setShowForm(true); };
  const handleEdit = (match: IBasketballMatch) => { setEditingMatch(match); setShowForm(true); };
  const handleDelete = async (match_id: number) => {
    if (!confirm('Delete match?')) return;
    try { await deleteMatch(match_id); fetchMatches(); fetchLeaderboard(); } catch (err: any) { alert(err.message); }
  };
  const onFormSuccess = () => { setShowForm(false); fetchMatches(); fetchLeaderboard(); };

  // Leaderboard Handlers
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
      setNewEntry({ dept_name: '', category: lbCategory, group: 'A' });
      fetchLeaderboard();
    }
  };

  const handleUpdateEntry = async (t: BasketballLeaderboardEntry) => {
    const res = await fetch(`${LB_API}/${t.leaderboard_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dept_name: t.dept_name, category: t.category, group: t.group }),
    });
    if (res.ok) { showMsg('✅ Updated!'); fetchLeaderboard(); }
  };

  const handleDeleteEntry = async (leaderboard_id: number) => {
    if (!confirm('Remove entry?')) return;
    const res = await fetch(`${LB_API}/${leaderboard_id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('🗑 Entry removed'); fetchLeaderboard(); }
  };

  // Filtered list of departments for the current gender toggle
  const filteredEntries = useMemo(() => lbEntries.filter(e => e.category === lbCategory), [lbEntries, lbCategory]);
  const groups = useMemo(() => [...new Set(filteredEntries.map(e => e.group))].sort(), [filteredEntries]);

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
            <h1 className="text-3xl font-[900] tracking-widest text-[#FFBF00] uppercase">Basketball CMS</h1>
          </div>
        </div>

        {!showForm && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
              <button onClick={() => setGlobalGender('m')} className={`px-6 py-2 rounded-md text-sm font-bold uppercase transition-all ${gender === 'men' ? 'bg-[#FFBF00] text-black' : 'text-zinc-500'}`}>Men</button>
              <button onClick={() => setGlobalGender('f')} className={`px-6 py-2 rounded-md text-sm font-bold uppercase transition-all ${gender === 'women' ? 'bg-[#FFBF00] text-black' : 'text-zinc-500'}`}>Women</button>
            </div>
            <button onClick={() => { fetchMatches(); fetchLeaderboard(); }} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-yellow-500 text-black rounded-lg text-sm font-bold transition-all"><Plus className="w-4 h-4" /> Create Match</button>
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
                 <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase">
                   <tr>
                     <th className="text-left p-4">ID</th>
                     <th className="text-left p-4">Stage</th>
                     <th className="text-left p-4">Departments</th>
                     <th className="text-center p-4">Final Score</th>
                     <th className="text-center p-4">Status</th>
                     <th className="text-right p-4">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/30">
                   {matches.map((match) => (
                     <tr key={match.match_id} className="hover:bg-zinc-900/40 transition-colors">
                       <td className="p-4 text-zinc-500 font-mono">{match.match_id}</td>
                       <td className="p-4"><div className="text-white font-bold capitalize">{match.match_stage}</div></td>
                       <td className="p-4">
                         <span className="font-[900] text-white tracking-widest uppercase">{match.team1_department}</span>
                         <span className="text-[#FFBF00] mx-2 text-xs font-bold font-mono">VS</span>
                         <span className="font-[900] text-white tracking-widest uppercase">{match.team2_department}</span>
                       </td>
                       <td className="p-4 text-center font-mono text-[#FFBF00] font-bold">
                         {match.games?.[0] ? `${match.games[0].team1_score} - ${match.games[0].team2_score}` : '-'}
                       </td>
                       <td className="p-4 text-center">
                         <span className="px-2 py-1 text-[10px] uppercase font-[900] border border-blue-500/30 text-blue-400 rounded bg-blue-500/10">
                           {match.match_status}
                         </span>
                       </td>
                       <td className="p-4 text-right">
                         <div className="flex gap-2 justify-end">
                           <button onClick={() => handleEdit(match)} className="p-2 rounded bg-zinc-800 text-zinc-400 hover:text-[#FFBF00]"><Pencil className="w-4 h-4"/></button>
                           <button onClick={() => handleDelete(match.match_id)} className="p-2 rounded bg-zinc-800 text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </section>

          {/* Leaderboard Table */}
          <section className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#FFBF00]" />
                <h2 className="text-lg font-[900] text-white uppercase tracking-widest">Leaderboard — {lbCategory}</h2>
              </div>
              <button onClick={() => setAddMode(!addMode)} className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] text-black rounded-lg text-sm font-bold">
                {addMode ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} Dept
              </button>
            </div>

            {addMode && (
              <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Dept Name" value={newEntry.dept_name} onChange={(e) => setNewEntry(p => ({ ...p, dept_name: e.target.value }))} className="bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"/>
                <input placeholder="Group" value={newEntry.group} onChange={(e) => setNewEntry(p => ({ ...p, group: e.target.value.toUpperCase() }))} className="bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"/>
                <button onClick={handleAddEntry} className="bg-[#FFBF00] text-black font-bold rounded-lg px-4">Register</button>
              </div>
            )}

            <div className="divide-y divide-zinc-800/50">
              {groups.map(gp => {
                const groupKey = `${lbCategory}-${gp}`;
                const rawStandings: any[] = standings[groupKey] ?? [];
                
                // Sort by wins descending
                const sortedStandings = [...rawStandings].sort((a, b) => (b.wins || 0) - (a.wins || 0));
                
                const entryLookup: Record<string, BasketballLeaderboardEntry> = {};
                filteredEntries.filter(e => e.group === gp).forEach(e => { entryLookup[e.dept_name] = e; });

                const gpTeams: BasketballLeaderboardEntry[] = sortedStandings.length > 0
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
                  <div key={groupKey} className="p-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00]" /> Group {gp}
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
                      <table className="w-full text-xs">
                        <thead className="bg-zinc-900/60 text-zinc-500 uppercase font-black">
                          <tr>
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
                          {gpTeams.map((t, i) => (
                            <BasketballTeamRow key={t.leaderboard_id} team={t} rank={i} onUpdate={handleUpdateEntry} onDelete={() => handleDeleteEntry(t.leaderboard_id)} />
                          ))}
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