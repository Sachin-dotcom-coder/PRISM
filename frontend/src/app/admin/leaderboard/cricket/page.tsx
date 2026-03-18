/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function TeamRow({ team, onUpdate, onDelete }: { team: any; onUpdate: (t: any) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });
  const { gender } = useGender();

  const handleSave = () => { onUpdate(draft); setEditing(false); };
  const handleCancel = () => { setDraft({ ...team }); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs border border-zinc-700 font-bold">
            {team.shortName}
          </div>
          <span className="font-bold text-zinc-200">{team.name}</span>
        </div>
      </td>
      <td className="p-4 text-center font-mono text-zinc-400">{team.matches}</td>
      <td className="p-4 text-center font-mono text-green-400">{team.wins}</td>
      <td className="p-4 text-center font-mono text-red-400">{team.losses}</td>
      <td className="p-4 text-center font-mono text-zinc-400">{team.nrr}</td>
      <td className="p-4 text-center font-sports text-xl text-[#FFBF00]">{team.points}</td>
      <td className="p-4 text-right">
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(true)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all text-zinc-400"><Pencil className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 hover:text-white transition-all text-zinc-400"><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="bg-[#FFBF00]/5 border-b border-[#FFBF00]/20">
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <input className={`bg-zinc-800 rounded px-2 py-1 text-sm ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} placeholder="Name" />
          <input className={`bg-zinc-800 rounded px-2 py-1 text-xs w-20 ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} value={draft.shortName} onChange={e => setDraft({...draft, shortName: e.target.value})} placeholder="Short" />
        </div>
      </td>
      <td className="p-4 text-center text-xs text-zinc-500">{(draft.wins||0)+(draft.losses||0)}</td>
      <td className="p-4"><input type="number" className={`w-16 bg-zinc-800 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} value={draft.wins} onChange={e => setDraft({...draft, wins: +e.target.value})} /></td>
      <td className="p-4"><input type="number" className={`w-16 bg-zinc-800 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} value={draft.losses} onChange={e => setDraft({...draft, losses: +e.target.value})} /></td>
      <td className="p-4"><input type="number" step="0.001" className={`w-20 bg-zinc-800 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} value={draft.nrr} onChange={e => setDraft({...draft, nrr: +e.target.value})} /></td>
      <td className="p-4 text-center font-sports text-xl text-[#FFBF00]">{(draft.wins||0)*2}</td>
      <td className="p-4 text-right">
        <div className="flex gap-2 justify-end">
          <button onClick={handleSave} className="p-2 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-4 h-4" /></button>
          <button onClick={handleCancel} className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function CricketLeaderboardAdmin() {
  const { gender } = useGender();
  const { data: teams, mutate } = useSWR(`/api/leaderboard?gender=${gender}`, fetcher);
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "" });

  const handleUpdate = async (team: any) => {
    const res = await fetch(`/api/leaderboard?gender=${gender}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team),
    });
    if (res.ok) mutate();
  };

  const handleDelete = async (team: any) => {
    if (!confirm(`Delete ${team.name}?`)) return;
    // We'll use a fetch with id if we add a DELETE endpoint
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/leaderboard?gender=${gender}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeam),
    });
    if (res.ok) {
      setAddMode(false);
      setNewTeam({ name: "", shortName: "" });
      mutate();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
        <h1 className="text-2xl font-sports tracking-wide">Cricket Leaderboard</h1>
      </div>

      <div className="bg-zinc-950/50 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Team Standings</h2>
             <span className="text-xs px-2 py-0.5 rounded bg-[#FFBF00]/20 text-[#FFBF00] font-bold uppercase">Points System: Win=2, Loss=0</span>
          </div>
          <button 
            onClick={() => setAddMode(!addMode)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00] hover:bg-[#FFBF00]/80 text-black rounded-lg text-sm font-bold transition-all"
          >
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Team</>}
          </button>
        </div>

        {addMode && (
          <form onSubmit={handleAdd} className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Team Name</label>
                <input required value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} placeholder="e.g. Mechanical" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Short Name</label>
                <input required value={newTeam.shortName} onChange={e => setNewTeam({...newTeam, shortName: e.target.value})} className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#FFBF00] outline-none ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : ''}`} placeholder="e.g. MECH" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
              Initialize Team
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left p-4">Team</th>
                <th className="p-4 text-center">Played</th>
                <th className="p-4 text-center">Wins</th>
                <th className="p-4 text-center">Losses</th>
                <th className="p-4 text-center">NRR</th>
                <th className="p-4 text-center text-[#FFBF00]">Points</th>
                <th className="p-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {!teams ? (
                <tr><td colSpan={7} className="p-10 text-center text-zinc-500 animate-pulse">Loading teams...</td></tr>
              ) : !Array.isArray(teams) ? (
                <tr><td colSpan={7} className="p-10 text-center text-red-500">Error: {teams.error || 'Failed to load teams. Check backend connection.'}</td></tr>
              ) : teams.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-zinc-500">No teams registered.</td></tr>
              ) : (
                teams.map((team: any) => (
                  <TeamRow key={team._id} team={team} onUpdate={handleUpdate} onDelete={() => handleDelete(team)} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
