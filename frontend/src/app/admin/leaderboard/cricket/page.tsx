/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
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
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Group {team.group || "A"}</span>
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
        <div className="grid grid-cols-3 gap-1">
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-28" value={draft.name} onChange={e => f("name", e.target.value)} />
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-16" value={draft.shortName} onChange={e => f("shortName", e.target.value)} />
          <select className="bg-zinc-800 rounded px-2 py-1 text-xs w-20" value={draft.group || "A"} onChange={e => f("group", e.target.value)}>
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
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

export default function CricketLeaderboardAdmin() {
  const { gender } = useGender();
  const API = `/api/leaderboard?gender=${gender}`;
  const { data: teams, error, mutate } = useSWR(API, fetcher);
  const validTeams: Team[] = Array.isArray(teams) ? teams : [];
  const [saveMsg, setSaveMsg] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", wins: 0, losses: 0, nrr: 0, group: "A" });

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const handleUpdate = async (team: Team) => {
    const res = await fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(team) });
    if (res.ok) { showMsg(`✅ ${team.name} updated!`); mutate(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete ${team.name}?`)) return;
    const res = await fetch(`${API}&id=${team._id}`, { method: "DELETE" });
    if (res.ok) { showMsg(`🗑 ${team.name} removed`); mutate(); }
    else showMsg("❌ Delete failed");
  };

  const handleAdd = async () => {
    if (!newTeam.name.trim() || !newTeam.shortName.trim()) { showMsg("❌ Name and Short Name required"); return; }
    const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTeam) });
    if (res.ok) { showMsg(`✅ ${newTeam.name} added!`); setNewTeam({ name: "", shortName: "", wins: 0, losses: 0, nrr: 0, group: "A" }); setAddMode(false); mutate(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-5 p-4 glass rounded-2xl border border-zinc-800/50">
        <span className="text-2xl">🏏</span>
        <div>
          <h2 className="font-sports text-xl tracking-wide">Cricket Leaderboard</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Database: <code className="text-accent bg-zinc-900 px-1.5 py-0.5 rounded">cricketDB → {gender === 'f' ? 'teams_f' : 'teams'}</code>
          </p>
        </div>
      </div>
      <div className="glass rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
          <span className="text-sm font-semibold text-zinc-400">{validTeams.length} teams · Pts = W×2 · Sorted by Points → NRR</span>
          <button onClick={() => setAddMode(!addMode)} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-semibold transition-all">
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Team</>}
          </button>
        </div>

        {addMode && (
          <div className="p-5 bg-zinc-900/50 border-b border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[["Full Name","name","text","e.g. Computer Science"],["Short","shortName","text","CSE"],["Wins","wins","number","0"],["Losses","losses","number","0"],["NRR","nrr","number","0.00"]].map(([label,key,type,ph]) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">{label}</label>
                  <input type={type} placeholder={ph} value={(newTeam as any)[key]}
                    onChange={e => setNewTeam(p => ({ ...p, [key]: type === "number" ? (parseFloat(e.target.value)||0) : e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-accent" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Group</label>
                <select value={newTeam.group} onChange={e => setNewTeam(p => ({ ...p, group: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-accent font-bold">
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                </select>
              </div>
            </div>
            <button onClick={handleAdd} className="px-5 py-2 bg-accent hover:bg-accent/80 text-white font-bold rounded-lg text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        )}

<<<<<<< Updated upstream
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
=======
        {saveMsg && <div className={`px-6 py-2 text-sm font-semibold ${saveMsg.startsWith("✅") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>{saveMsg}</div>}
        {error && <div className="p-8 text-center text-red-400">Failed to load.</div>}
        {!teams && <div className="p-8 text-center text-zinc-500 animate-pulse">Loading...</div>}
        {validTeams.length === 0 && teams && <div className="p-10 text-center text-zinc-500">No teams. Click &quot;Add Team&quot;.</div>}

        {validTeams.length > 0 && (
          <div className="divide-y divide-zinc-800">
            {["A", "B"].map(gp => {
              const gpTeams = validTeams.filter(t => (t.group || "A") === gp);
              return (
                <div key={gp} className="p-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Group {gp} Standing
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                          <th className="p-3 text-center w-12">#</th><th className="p-3 text-left">Team</th>
                          <th className="p-3 text-center">W</th><th className="p-3 text-center">L</th>
                          <th className="p-3 text-center">M</th><th className="p-3 text-center text-accent">Pts</th>
                          <th className="p-3 text-center">NRR</th><th className="p-3 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {gpTeams.length === 0 ? (
                          <tr><td colSpan={8} className="p-6 text-center text-zinc-600 text-xs italic">No teams in Group {gp} yet.</td></tr>
                        ) : (
                          gpTeams.map((t, i) => <TeamRow key={t._id} team={t} rank={i} onUpdate={handleUpdate} onDelete={() => handleDelete(t)} />)
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="px-6 py-3 text-xs text-zinc-600 border-t border-zinc-800/50">💡 Matches = W+L · Points = W×2 — auto-calculated on save</div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
