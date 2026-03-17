/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

type FTeam = {
  _id: string; name: string; shortName: string;
  wins: number; draws: number; losses: number; matches: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number;
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
          <span className="font-semibold text-zinc-200 text-sm">{team.name}</span>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.matches}</td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.wins}</td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.draws}</td>
      <td className="p-3 text-center text-zinc-400 text-sm">{team.losses}</td>
      <td className="p-3 text-center text-green-400 text-sm font-medium">{team.goalsFor}</td>
      <td className="p-3 text-center text-red-400 text-sm font-medium">{team.goalsAgainst}</td>
      <td className="p-3 text-center text-zinc-300 text-sm font-medium">{team.goalDifference}</td>
      <td className="p-3 text-center text-accent font-bold text-base">{team.points}</td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-green-700 hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  // Edit row
  const numField = (label: string, key: keyof FTeam) => (
    <td key={String(key)} className="p-1.5">
      <div className="text-center">
        <div className="text-[10px] text-zinc-600 uppercase mb-0.5">{label}</div>
        <input type="number" min={0} className="w-12 bg-zinc-800 rounded px-1 py-1 text-xs text-center" value={draft[key] as number || 0} onChange={e => f(key, +e.target.value)} />
      </div>
    </td>
  );

  return (
    <tr className="border-b border-green-500/20 bg-green-500/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <div className="space-y-1">
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-28 block" value={draft.name} onChange={e => f("name", e.target.value)} placeholder="Full Name" />
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-16 block" value={draft.shortName} onChange={e => f("shortName", e.target.value)} placeholder="Short" />
        </div>
      </td>
      {/* Auto-calculated M column */}
      <td className="p-1.5 text-center text-xs text-zinc-500">{(draft.wins||0)+(draft.draws||0)+(draft.losses||0)}</td>
      {numField("W", "wins")}
      {numField("D", "draws")}
      {numField("L", "losses")}
      {numField("GF", "goalsFor")}
      {numField("GA", "goalsAgainst")}
      {/* Auto-calculated GD */}
      <td className="p-1.5 text-center text-xs text-zinc-400">{(draft.goalsFor||0)-(draft.goalsAgainst||0)}</td>
      {/* Auto-calculated Pts */}
      <td className="p-1.5 text-center text-xs text-accent font-bold">{(draft.wins||0)*3+(draft.draws||0)}</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function FootballLeaderboardAdmin() {
  const { gender } = useGender();
  const API = `/api/football/leaderboard?gender=${gender}`;
  const { data: teams, error, mutate } = useSWR(API, fetcher);
  const validTeams: FTeam[] = Array.isArray(teams) ? teams : [];
  const [saveMsg, setSaveMsg] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const handleUpdate = async (t: FTeam) => {
    const res = await fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    if (res.ok) { showMsg(`✅ ${t.name} updated!`); mutate(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  const handleDelete = async (t: FTeam) => {
    if (!confirm(`Delete ${t.name}?`)) return;
    const res = await fetch(`${API}&id=${t._id}`, { method: "DELETE" }); // Use & instead of ? since API already has ?gender=
    if (res.ok) { showMsg(`🗑 ${t.name} removed`); mutate(); }
    else showMsg("❌ Delete failed");
  };

  const handleAdd = async () => {
    if (!newTeam.name.trim() || !newTeam.shortName.trim()) { showMsg("❌ Name and Short Name required"); return; }
    const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTeam) });
    if (res.ok) {
      showMsg(`✅ ${newTeam.name} added!`);
      setNewTeam({ name: "", shortName: "", wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
      setAddMode(false); mutate();
    } else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-zinc-800/50">
        <span className="text-2xl">⚽</span>
        <div>
          <h2 className="font-sports text-xl tracking-wide">Football Leaderboard</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Database: <code className="text-green-400 bg-zinc-900 px-1.5 py-0.5 rounded">footballDB → teams_m</code>
            <span className="ml-3 text-zinc-600">Pts = W×3 + D · GD = GF−GA</span>
          </p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
          <span className="text-sm font-semibold text-zinc-400">{validTeams.length} teams</span>
          <button onClick={() => setAddMode(!addMode)}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all">
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Team</>}
          </button>
        </div>

        {addMode && (
          <div className="p-5 bg-zinc-900/50 border-b border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {([["Full Name","name","text"],["Short","shortName","text"],["Wins","wins","number"],["Draws","draws","number"],["Losses","losses","number"],["Goals For","goalsFor","number"],["Goals Against","goalsAgainst","number"]] as [string,string,string][]).map(([label,key,type]) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">{label}</label>
                  <input type={type} value={(newTeam as any)[key]}
                    onChange={e => setNewTeam(p => ({ ...p, [key]: type === "number" ? (+e.target.value||0) : e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-green-500" />
                </div>
              ))}
            </div>
            <button onClick={handleAdd}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Team
            </button>
          </div>
        )}

        {saveMsg && <div className={`px-6 py-2 text-sm font-semibold ${saveMsg.startsWith("✅") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>{saveMsg}</div>}
        {error && <div className="p-8 text-center text-red-400">Failed to load from footballDB → teams_m</div>}
        {!teams && <div className="p-8 text-center text-zinc-500 animate-pulse">Loading...</div>}
        {validTeams.length === 0 && teams && <div className="p-10 text-center text-zinc-500">No teams yet. Add one above.</div>}

        {validTeams.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-3 text-center w-10">#</th>
                  <th className="p-3 text-left">Team</th>
                  <th className="p-3 text-center">M</th>
                  <th className="p-3 text-center">W</th>
                  <th className="p-3 text-center">D</th>
                  <th className="p-3 text-center">L</th>
                  <th className="p-3 text-center text-green-400">GF</th>
                  <th className="p-3 text-center text-red-400">GA</th>
                  <th className="p-3 text-center">GD</th>
                  <th className="p-3 text-center text-accent">Pts</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {validTeams.map((t, i) => (
                  <FTeamRow key={t._id} team={t} rank={i} onUpdate={handleUpdate} onDelete={() => handleDelete(t)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 text-xs text-zinc-600 border-t border-zinc-800/50">
          💡 M, GD, Pts are auto-calculated on save. Enter W / D / L / GF / GA only.
        </div>
      </div>
    </div>
  );
}
