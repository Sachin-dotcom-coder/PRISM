/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

type HTeam = { _id: string; name: string; shortName: string; First: number; Second: number; Third: number; points: number };

function HTeamRow({ team, rank, onUpdate, onDelete }: { team: HTeam; rank: number; onUpdate: (t: HTeam) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });
  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);
  const f = (k: keyof HTeam, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
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
      <td className="p-3 text-center">
        <span className="text-yellow-400 font-bold text-sm">{team.First ?? 0}</span>
        <span className="text-yellow-600 text-xs ml-0.5">🥇</span>
      </td>
      <td className="p-3 text-center">
        <span className="text-zinc-300 font-bold text-sm">{team.Second ?? 0}</span>
        <span className="text-zinc-400 text-xs ml-0.5">🥈</span>
      </td>
      <td className="p-3 text-center">
        <span className="text-amber-600 font-bold text-sm">{team.Third ?? 0}</span>
        <span className="text-amber-700 text-xs ml-0.5">🥉</span>
      </td>
      <td className="p-3 text-center text-accent font-bold text-base">{team.points ?? 0}</td>
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
        <div className="space-y-1">
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-28 block" value={draft.name} onChange={e => f("name", e.target.value)} placeholder="Full Name" />
          <input className="bg-zinc-800 rounded px-2 py-1 text-xs w-16 block" value={draft.shortName} onChange={e => f("shortName", e.target.value)} placeholder="Short" />
        </div>
      </td>
      <td className="p-2"><input type="number" min={0} className="w-14 bg-zinc-800 rounded px-1 py-1.5 text-xs text-center text-yellow-400" value={draft.First||0} onChange={e => f("First", +e.target.value)} /></td>
      <td className="p-2"><input type="number" min={0} className="w-14 bg-zinc-800 rounded px-1 py-1.5 text-xs text-center text-zinc-300" value={draft.Second||0} onChange={e => f("Second", +e.target.value)} /></td>
      <td className="p-2"><input type="number" min={0} className="w-14 bg-zinc-800 rounded px-1 py-1.5 text-xs text-center text-amber-600" value={draft.Third||0} onChange={e => f("Third", +e.target.value)} /></td>
      <td className="p-2"><input type="number" min={0} className="w-14 bg-zinc-800 rounded px-1 py-1.5 text-xs text-center text-accent font-bold" value={draft.points||0} onChange={e => f("points", +e.target.value)} /></td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function HomepageLeaderboardAdmin() {
  const { gender } = useGender();
  const API = `/api/homepage-leaderboard?gender=${gender}`;
  const { data: teams, error, mutate } = useSWR(API, fetcher);
  const validTeams: HTeam[] = Array.isArray(teams) ? teams : [];
  const [saveMsg, setSaveMsg] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", First: 0, Second: 0, Third: 0, points: 0 });
  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const handleUpdate = async (t: HTeam) => {
    const res = await fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    if (res.ok) { showMsg(`✅ ${t.name} updated!`); mutate(); }
    else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  const handleDelete = async (t: HTeam) => {
    if (!confirm(`Delete ${t.name}?`)) return;
    const res = await fetch(`${API}&id=${t._id}`, { method: "DELETE" });
    if (res.ok) { showMsg(`🗑 ${t.name} removed`); mutate(); }
    else showMsg("❌ Delete failed");
  };

  const handleAdd = async () => {
    if (!newTeam.name.trim() || !newTeam.shortName.trim()) { showMsg("❌ Name and Short Name required"); return; }
    const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTeam) });
    if (res.ok) {
      showMsg(`✅ ${newTeam.name} added!`);
      setNewTeam({ name: "", shortName: "", First: 0, Second: 0, Third: 0, points: 0 });
      setAddMode(false); mutate();
    } else { const d = await res.json(); showMsg(`❌ ${d.error}`); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-zinc-800/50">
        <span className="text-2xl">🏠</span>
        <div>
          <h2 className="font-sports text-xl tracking-wide">Homepage Leaderboard</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Database: <code className="text-accent bg-zinc-900 px-1.5 py-0.5 rounded">Homepage → {gender === 'f' ? 'Leaderboard_f' : 'Leaderboard'}</code>
            <span className="ml-3 text-zinc-600">Fields: First 🥇 · Second 🥈 · Third 🥉 · Points</span>
          </p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
          <span className="text-sm font-semibold text-zinc-400">{validTeams.length} teams · Sorted by Points</span>
          <button onClick={() => setAddMode(!addMode)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-semibold transition-all">
            {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Team</>}
          </button>
        </div>

        {addMode && (
          <div className="p-5 bg-zinc-900/50 border-b border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {([["Full Name","name","text"],["Short","shortName","text"],["1st 🥇","First","number"],["2nd 🥈","Second","number"],["3rd 🥉","Third","number"],["Points","points","number"]] as [string,string,string][]).map(([label,key,type]) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">{label}</label>
                  <input type={type} value={(newTeam as any)[key]}
                    onChange={e => setNewTeam(p => ({ ...p, [key]: type === "number" ? (+e.target.value||0) : e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-accent" />
                </div>
              ))}
            </div>
            <button onClick={handleAdd} className="px-5 py-2 bg-accent hover:bg-accent/80 text-white font-bold rounded-lg text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Team
            </button>
          </div>
        )}

        {saveMsg && <div className={`px-6 py-2 text-sm font-semibold ${saveMsg.startsWith("✅") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>{saveMsg}</div>}
        {error && <div className="p-8 text-center text-red-400">Failed to load from Homepage → Leaderboard</div>}
        {!teams && <div className="p-8 text-center text-zinc-500 animate-pulse">Loading...</div>}
        {validTeams.length === 0 && teams && <div className="p-10 text-center text-zinc-500">No teams yet. Add one above.</div>}

        {validTeams.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-3 text-center w-10">#</th>
                  <th className="p-3 text-left">Team</th>
                  <th className="p-3 text-center text-yellow-400">1st 🥇</th>
                  <th className="p-3 text-center text-zinc-300">2nd 🥈</th>
                  <th className="p-3 text-center text-amber-600">3rd 🥉</th>
                  <th className="p-3 text-center text-accent">Pts</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {validTeams.map((t, i) => (
                  <HTeamRow key={t._id} team={t} rank={i} onUpdate={handleUpdate} onDelete={() => handleDelete(t)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 text-xs text-zinc-600 border-t border-zinc-800/50">
          💡 Enter 1st/2nd/3rd place counts and total Points manually. All values are stored as-is.
        </div>
      </div>
    </div>
  );
}
