/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, RefreshCw, Pencil, Trash2, Activity, Trophy, Check, X } from 'lucide-react';
import Link from 'next/link';
import MatchForm from './components/MatchForm';
import { ILawnTennisMatch } from './types';
import { getMatches, deleteMatch } from './services/lawnTennisApi';
import { useGender } from '@/app/components/Providers';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TennisLeaderboardEntry {
  _id: string;
  dept_name: string;
  category: 'boys' | 'girls';
  group: string;
  // computed from standings endpoint
  played?: number;
  wins?: number;
  losses?: number;
  points?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const LB_API = `${BASE_URL}/tennis-lead`;

const RANK_COLORS = [
  "text-yellow-400 font-black",
  "text-zinc-300 font-black",
  "text-amber-600 font-black",
];

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function TennisTeamRow({
  team, rank, onUpdate, onDelete,
}: {
  team: TennisLeaderboardEntry;
  rank: number;
  onUpdate: (t: TennisLeaderboardEntry) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing)
    return (
      <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
        <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/20 flex items-center justify-center text-[10px] font-black text-[#FFBF00]">
              {team.dept_name.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-[900] text-white tracking-widest text-sm">{team.dept_name}</span>
          </div>
        </td>
        <td className="p-3 text-center text-zinc-400 text-xs font-mono font-bold">{team.group}</td>
        <td className="p-3 text-center text-zinc-300 text-sm">{team.played ?? 0}</td>
        <td className="p-3 text-center text-green-400 text-sm font-black">{team.wins ?? 0}</td>
        <td className="p-3 text-center text-red-400 text-sm">{team.losses ?? 0}</td>
        <td className="p-3 text-center text-[#FFBF00] font-mono text-sm font-black">{team.points ?? 0}</td>
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
      <td colSpan={4} className="p-2 text-center text-[10px] text-zinc-500 italic">Auto-calculated from completed league matches</td>
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
export default function LawnTennisAdminPage() {
  const { gender: globalGender } = useGender();
  const gender = globalGender === "f" ? "women" : "men";
  // Tennis leaderboard uses "boys"/"girls", mapping from men/women tab
  const lbCategory: 'boys' | 'girls' = gender === 'men' ? 'boys' : 'girls';

  // ── Match state ──
  const [matches, setMatches] = useState<ILawnTennisMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<ILawnTennisMatch | null>(null);

  // ── Leaderboard state ──
  const [lbEntries, setLbEntries] = useState<TennisLeaderboardEntry[]>([]);
  // standings shape: { boys: { A: [...], B: [...] }, girls: { A: [...] } }
  const [standings, setStandings] = useState<Record<string, Record<string, any[]>>>({});
  const [addMode, setAddMode] = useState(false);
  const [lbMsg, setLbMsg] = useState('');
  const [newEntry, setNewEntry] = useState<Partial<TennisLeaderboardEntry>>({
    dept_name: '',
    category: lbCategory,
    group: 'A',
  });

  // ─── Fetch helpers ────────────────────────────────────────────────────────
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMatches(gender as "men" | "women");
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
      const [entriesRes, standingsRes] = await Promise.all([
        fetch(`${LB_API}`),
        fetch(`${LB_API}/standings`),
      ]);
      const entriesData = await entriesRes.json();
      const standingsData = await standingsRes.json();
      setLbEntries(Array.isArray(entriesData) ? entriesData : []);
      setStandings(standingsData && typeof standingsData === 'object' ? standingsData : {});
    } catch {
      // silently fail leaderboard
    }
  }, []);

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

  // ─── Match handlers ───────────────────────────────────────────────────────
  const handleAddNew = () => { setEditingMatch(null); setShowForm(true); };
  const handleEdit = (match: ILawnTennisMatch) => { setEditingMatch(match); setShowForm(true); };
  const handleDelete = async (match_id: string) => {
    if (!confirm('Delete this match?')) return;
    try { await deleteMatch(match_id); fetchMatches(); } catch (err: any) { alert(err.message || 'Deletion failed'); }
  };
  const onFormSuccess = () => { setShowForm(false); fetchMatches(); };

  // ─── Leaderboard handlers ─────────────────────────────────────────────────
  const handleAddEntry = async () => {
    if (!newEntry.dept_name) return;
    const res = await fetch(LB_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
    if (res.ok) {
      showMsg('✅ Department registered!');
      setAddMode(false);
      setNewEntry({ dept_name: '', category: lbCategory, group: 'A' });
      fetchLeaderboard();
    } else {
      const d = await res.json();
      showMsg(`❌ ${d.message || 'Failed to register'}`);
    }
  };

  const handleUpdateEntry = async (t: TennisLeaderboardEntry) => {
    const res = await fetch(`${LB_API}/${t._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dept_name: t.dept_name, category: t.category, group: t.group }),
    });
    if (res.ok) { showMsg('✅ Updated!'); fetchLeaderboard(); }
    else { const d = await res.json(); showMsg(`❌ ${d.message || 'Update failed'}`); }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Remove this department from leaderboard?')) return;
    const res = await fetch(`${LB_API}/${id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('🗑 Entry removed'); fetchLeaderboard(); }
  };

  // ─── Leaderboard data prep ────────────────────────────────────────────────
  const filteredEntries = lbEntries.filter(e => e.category === lbCategory);
  // standings[lbCategory] → { A: [...], B: [...] }
  const categoryStandings: Record<string, any[]> = standings[lbCategory] ?? {};

  // Build groups from registered entries for this category
  const groups = [...new Set(filteredEntries.map(e => e.group))];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto pb-24 min-h-screen bg-black text-white">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/20 flex items-center justify-center text-[#FFBF00]">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-[900] tracking-widest text-[#FFBF00] uppercase">Lawn Tennis CMS</h1>
          </div>
        </div>

        {!showForm && (
          <div className="flex gap-3">
            <button
              onClick={() => { fetchMatches(); fetchLeaderboard(); }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg text-sm font-bold transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-yellow-500 text-black rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,191,0,0.4)]"
            >
              <Plus className="w-4 h-4" /> Create Match
            </button>
          </div>
        )}
      </div>

      {/* ── Match Form ── */}
      {showForm ? (
        <MatchForm
          initialData={editingMatch}
          gender={gender as "men" | "women"}
          onSuccess={onFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          {/* ════════════ MATCHES TABLE ════════════ */}
          <section className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#FFBF00]" />
              <h2 className="text-lg font-[900] text-white uppercase tracking-widest">
                Matches — {gender === 'men' ? 'Men' : 'Women'}
              </h2>
            </div>
            {error && <div className="bg-red-500/10 text-red-500 p-4 font-semibold text-center">{error}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Type & Stage</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Departments</th>
                    <th className="text-center p-4">Tie Matches</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-center p-4">Winner</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {loading && matches.length === 0 ? (
                    <tr><td colSpan={8} className="p-10 text-center text-[#FFBF00] font-bold animate-pulse">Fetching Matches...</td></tr>
                  ) : matches.length === 0 ? (
                    <tr><td colSpan={8} className="p-10 text-center text-zinc-500">No {gender} tennis matches found. Create one above.</td></tr>
                  ) : (
                    matches.map((match) => (
                      <tr key={match.match_id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-4 text-zinc-500 font-mono text-xs">{match.match_id}</td>
                        <td className="p-4">
                          <div className="text-white font-bold capitalize">{match.match_type}</div>
                          <div className="text-zinc-500 text-xs tracking-wider capitalize">{match.stage.replace('_', ' ')}</div>
                        </td>
                        <td className="p-4 text-zinc-400 text-xs font-bold uppercase">{match.category}</td>
                        <td className="p-4">
                          <span className="font-[900] text-white tracking-widest">{match.dept_name1}</span>
                          <span className="text-[#FFBF00] mx-2 text-xs font-bold font-mono">VS</span>
                          <span className="font-[900] text-white tracking-widest">{match.dept_name2}</span>
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-300 font-bold bg-zinc-900/30">
                          <div className="flex flex-col gap-1 items-center min-w-[120px]">
                            {match.games?.map((g, idx) => (
                              <div key={idx} className="flex items-center gap-2 group/score relative">
                                <span className="text-[10px] text-zinc-600 uppercase font-black w-16 text-right truncate transition-colors">
                                  {g.game_name?.includes('Doubles') ? 'Doubles' : (g.game_name || `Set ${idx + 1}`)}
                                </span>
                                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-zinc-800 transition-all hover:border-[#FFBF00]/30 min-w-[60px] justify-center">
                                  <span className={`font-mono text-xs ${Number(g.score_dept1) > Number(g.score_dept2) ? 'text-[#FFBF00] font-black' : 'text-zinc-500'}`}>
                                    {g.score_dept1 === '' ? '0' : g.score_dept1}
                                  </span>
                                  <span className="text-zinc-700 font-mono text-[10px]">-</span>
                                  <span className={`font-mono text-xs ${Number(g.score_dept2) > Number(g.score_dept1) ? 'text-[#FFBF00] font-black' : 'text-zinc-500'}`}>
                                    {g.score_dept2 === '' ? '0' : g.score_dept2}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 text-[10px] uppercase font-[900] tracking-widest rounded border ${
                            match.status === 'scheduled' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                            'border-green-500/30 text-green-400 bg-green-500/10'
                          }`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="p-4 text-center font-[900] text-white tracking-widest">{match.winner_dept || '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleEdit(match)} className="p-2 rounded bg-zinc-800 hover:bg-[#FFBF00] transition-all text-zinc-400 hover:text-black shadow-md"><Pencil className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(match.match_id)} className="p-2 rounded bg-zinc-800 hover:bg-red-600 transition-all text-zinc-400 hover:text-white shadow-md"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ════════════ LEADERBOARD ════════════ */}
          <section className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#FFBF00]" />
                <h2 className="text-lg font-[900] text-white uppercase tracking-widest">
                  Leaderboard — {lbCategory === 'boys' ? 'Boys (Men)' : 'Girls (Women)'}
                </h2>
              </div>
              <button
                onClick={() => setAddMode(!addMode)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-yellow-500 text-black rounded-lg text-sm font-bold transition-all shadow-[0_0_12px_rgba(255,191,0,0.3)]"
              >
                {addMode ? <><X className="w-4 h-4"/> Cancel</> : <><Plus className="w-4 h-4"/> Add Dept</>}
              </button>
            </div>

            {/* Add dept form */}
            {addMode && (
              <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Department</label>
                    <input
                      placeholder="e.g. CS"
                      value={newEntry.dept_name}
                      onChange={(e) => setNewEntry(p => ({ ...p, dept_name: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#FFBF00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Category</label>
                    <select
                      value={newEntry.category}
                      onChange={(e) => setNewEntry(p => ({ ...p, category: e.target.value as 'boys' | 'girls' }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#FFBF00]"
                    >
                      <option value="boys">Boys (Men)</option>
                      <option value="girls">Girls (Women)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Group</label>
                    <input
                      value={newEntry.group}
                      onChange={(e) => setNewEntry(p => ({ ...p, group: e.target.value.toUpperCase() }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#FFBF00]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddEntry}
                  className="w-full py-3 bg-[#FFBF00] hover:bg-yellow-500 text-black font-[900] rounded-xl tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all"
                >
                  Register Department
                </button>
              </div>
            )}

            {/* Status message */}
            {lbMsg && (
              <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${lbMsg.includes('✅') ? 'bg-[#FFBF00]/10 text-[#FFBF00]' : 'bg-red-500/10 text-red-400'}`}>
                {lbMsg}
              </div>
            )}

            {/* Standings by group */}
            {groups.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 italic">
                No {lbCategory} leaderboard entries yet. Add departments above to get started.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {groups.map(gp => {
                  // Use standings data if available, enriched with _id from entries
                  const rawStandingsForGroup: any[] = categoryStandings[gp] ?? [];
                  // Build entry lookup by dept_name for this group+category
                  const entryLookup: Record<string, TennisLeaderboardEntry> = {};
                  filteredEntries.filter(e => e.group === gp).forEach(e => { entryLookup[e.dept_name] = e; });

                  // If standings exist, enrich with _id; otherwise, show registered entries only
                  const gpTeams: TennisLeaderboardEntry[] = rawStandingsForGroup.length > 0
                    ? rawStandingsForGroup
                        .filter((t: any) => entryLookup[t.dept_name]) // only entries for this gender
                        .map((t: any) => ({
                          ...t,
                          _id: t._id ?? entryLookup[t.dept_name]?._id ?? '',
                          category: lbCategory,
                          group: gp,
                        }))
                    : filteredEntries.filter(e => e.group === gp);

                  return (
                    <div key={gp} className="p-6">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00]" />
                        Group {gp} Standings
                        <span className="ml-2 text-zinc-600 font-normal lowercase normal-case tracking-normal">
                          (points from completed league matches)
                        </span>
                      </h3>
                      <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/30">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase font-black tracking-tighter">
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
                              <tr><td colSpan={8} className="p-8 text-center text-zinc-600 italic">No teams in this group yet.</td></tr>
                            ) : (
                              gpTeams.map((t, i) => (
                                <TennisTeamRow
                                  key={t._id || t.dept_name}
                                  team={t}
                                  rank={i}
                                  onUpdate={handleUpdateEntry}
                                  onDelete={() => handleDeleteEntry(t._id)}
                                />
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
