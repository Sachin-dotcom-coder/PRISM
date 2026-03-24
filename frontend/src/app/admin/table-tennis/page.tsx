/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Plus, ArrowLeft, RefreshCw, Pencil, Trash2, Activity, Trophy, Check, X } from 'lucide-react';
import Link from 'next/link';
import MatchForm from './components/MatchForm';
import { ITableTennisMatch } from './types';
import { getMatches, deleteMatch } from './services/tableTennisApi';
import { useGender } from '@/app/components/Providers';

// ─── Types ───────────────────────────────────────────────────────────────────
interface TTLeaderboardEntry {
  _id?: string;
  leaderboard_id: number;
  dept_name: string;
  category: string;
  group: string;
  wins?: number;
  losses?: number;
  matches?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const LB_API = `${BASE_URL}/tt-lead`;

const RANK_COLORS = [
  "text-yellow-400 font-black",
  "text-zinc-300 font-black",
  "text-amber-600 font-black",
];

// ─── Leaderboard Row ─────────────────────────────────────────────────────────
function TTTeamRow({ team, rank, onUpdate, onDelete }: any) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  const f = (k: string, v: any) => setDraft((p: any) => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className="p-3 text-center">{rank + 1}</td>
      <td className="p-3 text-white font-bold">{team.dept_name}</td>
      <td className="p-3 text-center">{team.group}</td>
      <td className="p-3 text-center text-green-400">{team.wins ?? 0}</td>
      <td className="p-3 text-center text-red-400">{team.losses ?? 0}</td>
      <td className="p-3 text-center">{team.matches ?? 0}</td>
      <td className="p-3 text-right">
        <button onClick={() => setEditing(true)}><Pencil /></button>
        <button onClick={onDelete}><Trash2 /></button>
      </td>
    </tr>
  );

  return (
    <tr>
      <td>{rank + 1}</td>
      <td><input value={draft.dept_name} onChange={(e) => f("dept_name", e.target.value)} /></td>
      <td><input value={draft.group} onChange={(e) => f("group", e.target.value)} /></td>
      <td colSpan={3}>Auto</td>
      <td>
        <button onClick={save}><Check /></button>
        <button onClick={() => setEditing(false)}><X /></button>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TableTennisAdminPage() {
  const { gender: globalGender } = useGender();
  const gender = globalGender === "f" ? "women" : "men";

  const [matches, setMatches] = useState<ITableTennisMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<ITableTennisMatch | null>(null);

  const [lbEntries, setLbEntries] = useState<TTLeaderboardEntry[]>([]);
  const [standings, setStandings] = useState<Record<string, any[]>>({});

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMatches(gender as any);
      setMatches(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gender]);

  const fetchLeaderboard = useCallback(async () => {
    const res = await fetch(`${LB_API}/standings`);
    const data = await res.json();
    setStandings(data || {});
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchLeaderboard();
  }, [fetchMatches, fetchLeaderboard]);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl font-bold mb-4">Table Tennis Admin Panel</h1>

      {/* MATCHES */}
      <h2 className="text-lg font-bold mb-2">Matches</h2>

      {loading ? "Loading..." : matches.map((m) => (
        <div key={m.match_id} className="border p-2 mb-2">
          {m.team1_department} vs {m.team2_department} → {m.winner}
        </div>
      ))}

      {/* LEADERBOARD */}
      <h2 className="text-lg font-bold mt-6 mb-2">Leaderboard</h2>

      {Object.keys(standings).map((g) => (
        <div key={g}>
          <h3>Group {g}</h3>
          {standings[g].map((t: any, i: number) => (
            <div key={i}>
              {t.dept_name} - {t.wins} pts
            </div>
          ))}
        </div>
      ))}

    </div>
  );
}