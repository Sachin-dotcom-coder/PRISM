 /* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, Trophy, Activity,
  Check, X, AlertCircle, CheckCircle2
} from "lucide-react";
import { DEPARTMENT_OPTIONS } from "../../shared/departmentOptions";

// ── Types ────────────────────────────────────────────────
interface ISet {
  team1_score: number;
  team2_score: number;
}

interface IGame {
  game_number: number;
  game_type: "single" | "double";
  sets: ISet[];
  team1_score: number;
  team2_score: number;
  winner: string | null;
}

interface IBadmintonMatch {
  _id?: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date: string;
  team1_score: number;
  team2_score: number;
  games: IGame[];
  total_games: number;
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
}

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    const json = await r.json();
    // Backend wraps response: { success, data } or returns array/object directly
    return json?.data ?? json;
  });

const MATCHES_API = "/api/badminton";

function GameRow({
  game,
  index,
  team1,
  team2,
  onUpdate,
  onRemove,
}: {
  game: IGame;
  index: number;
  team1: string;
  team2: string;
  onUpdate: (idx: number, g: IGame) => void;
  onRemove: (idx: number) => void;
}) {
  const updateSet = (setIdx: number, team: 1 | 2, score: number) => {
    const sets = [...game.sets];
    sets[setIdx] = { ...sets[setIdx], [`team${team}_score`]: score };
    
    let t1Sets = 0, t2Sets = 0;
    sets.forEach(s => {
      if (s.team1_score > s.team2_score) t1Sets++;
      else if (s.team2_score > s.team1_score) t2Sets++;
    });
    
    onUpdate(index, {
      ...game,
      sets,
      team1_score: t1Sets,
      team2_score: t2Sets,
      winner: t1Sets > t2Sets ? team1 : t2Sets > t1Sets ? team2 : null
    });
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-4">
          <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">G{game.game_number}</span>
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 self-start">
            {["single", "double"].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onUpdate(index, { ...game, game_type: t as any })}
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
        <button type="button" onClick={() => onRemove(index)} className="p-2 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 transition-all rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="space-y-2.5">
        {game.sets.map((set, sIdx) => (
          <div key={sIdx} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all gap-4">
            <span className="text-sm font-black text-zinc-500 uppercase tracking-widest shrink-0">Set {sIdx + 1}</span>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2">{team1 || "T1"}</span>
                <input 
                  type="number" 
                  value={set.team1_score} 
                  onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                  onChange={(e) => updateSet(sIdx, 1, +e.target.value)}
                  className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl text-center py-3.5 text-2xl font-black text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all tabular-nums font-mono"
                />
              </div>
              <span className="text-zinc-700 font-black text-xl mt-8">—</span>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2">{team2 || "T2"}</span>
                <input 
                  type="number" 
                  value={set.team2_score} 
                  onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                  onChange={(e) => updateSet(sIdx, 2, +e.target.value)}
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
  );
}

// ── Main Page ────────────────────────────────────────────
export default function BadmintonMatchPage() {
  const params = useParams();
  const router = useRouter();
  const match_id = params?.match_id as string;

  const { data: match, error, mutate } = useSWR<IBadmintonMatch>(
    match_id ? `${MATCHES_API}/${match_id}` : null,
    fetcher
  );

  const [form, setForm] = useState<IBadmintonMatch | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Initialize form when match loads
  useEffect(() => {
    if (match && !form) {
      setForm({
        ...match,
        match_date:
          typeof match.match_date === "string"
            ? match.match_date.slice(0, 16)
            : new Date(match.match_date).toISOString().slice(0, 16),
        games: match.games ?? [],
        winner: match.winner ?? "",
      });
    }
  }, [match, form]);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-400 font-bold">Failed to load match #{match_id}</p>
        <Link href="/admin/badminton" className="text-blue-400 text-sm underline">← Back to Badminton Admin</Link>
      </div>
    );
  }

  if (!match || !form) {
    return (
      <div className="p-8 text-zinc-500 animate-pulse text-center">
        Loading match #{match_id}...
      </div>
    );
  }

  // ── Form helpers ─────────────────────────────────────
  const set = <K extends keyof IBadmintonMatch>(k: K, v: IBadmintonMatch[K]) =>
    setForm((p) => p ? { ...p, [k]: v } : p);

  const addGame = () => {
    if (!form) return;
    const next: IGame = {
      game_number: form.games.length + 1,
      game_type: "single",
      sets: [
        { team1_score: 0, team2_score: 0 },
        { team1_score: 0, team2_score: 0 },
        { team1_score: 0, team2_score: 0 }
      ],
      team1_score: 0,
      team2_score: 0,
      winner: null
    };
    setForm((p) => p ? { ...p, games: [...p.games, next], total_games: p.games.length + 1 } : p);
  };

  const removeGame = (idx: number) => {
    if (!form) return;
    const updated = form.games
      .filter((_, i) => i !== idx)
      .map((g, i) => ({ ...g, game_number: i + 1 }));
    setForm((p) => p ? { ...p, games: updated, total_games: updated.length } : p);
  };

  const updateGame = (idx: number, g: IGame) => {
    if (!form) return;
    const updated = [...form.games];
    updated[idx] = g;
    setForm((p) => p ? { ...p, games: updated } : p);
  };

  const autoComputeScores = () => {
    if (!form) return;
    let t1 = 0, t2 = 0;
    form.games.forEach((g) => {
      if (g.winner === form.team1_department) t1++;
      else if (g.winner === form.team2_department) t2++;
    });
    setForm((p) =>
      p ? {
        ...p,
        team1_score: t1,
        team2_score: t2,
        winner: t1 > t2 ? p.team1_department : t2 > t1 ? p.team2_department : "",
      } : p
    );
  };

  // ── Save to backend ──────────────────────────────────
  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        match_stage: form.match_stage,
        team1_department: form.team1_department,
        team2_department: form.team2_department,
        match_date: new Date(form.match_date).toISOString(),
        team1_score: Number(form.team1_score),
        team2_score: Number(form.team2_score),
        games: form.games.map((g) => ({
          game_number: g.game_number,
          game_type: g.game_type,
          sets: g.sets.map(s => ({
            team1_score: Number(s.team1_score || 0),
            team2_score: Number(s.team2_score || 0)
          })),
          team1_score: Number(g.team1_score || 0),
          team2_score: Number(g.team2_score || 0),
          winner: g.winner
        })),
        total_games: form.games.length,
        winner: form.winner || null,
        match_status: form.match_status,
        gender: form.gender,
      };

      const res = await fetch(`${MATCHES_API}/${form.match_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showMsg("ok", "✅ Match saved successfully!");
        mutate();
      } else {
        const d = await res.json();
        showMsg("err", `❌ ${d.message || "Save failed"}`);
      }
    } catch (e: any) {
      showMsg("err", `❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    scheduled: "bg-zinc-800 text-zinc-400",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/badminton"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Badminton
        </Link>
        <span className="text-xs font-black bg-zinc-800 px-3 py-1.5 rounded-lg tracking-widest text-blue-400">
          MATCH #{match.match_id}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">
          🏸
        </div>
        <div>
          <h1 className="text-2xl font-sports font-black uppercase tracking-wider text-white">
            {match.team1_department}{" "}
            <span className="text-zinc-600 font-normal italic lowercase text-lg">vs</span>{" "}
            {match.team2_department}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {match.match_stage} • {match.gender}
          </p>
        </div>
      </div>

      {/* Save message */}
      {msg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm border ${
            msg.type === "ok"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {msg.type === "ok" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      {/* ── MATCH DETAILS ────────────────────────────── */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center gap-3">
          <Activity className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Match Details</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Status */}
          <div>
            <label className="label-sm">Status</label>
            <select
              value={form.match_status}
              onChange={(e) => set("match_status", e.target.value)}
              className={`input-field border ${statusColor[form.match_status] ?? "border-zinc-700"}`}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="label-sm">Stage</label>
            <select
              value={form.match_stage}
              onChange={(e) => set("match_stage", e.target.value)}
              className="input-field"
            >
              <option value="group">Group</option>
              <option value="semifinal">Semifinal</option>
              <option value="final">Final</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="label-sm">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value as "men" | "women")}
              className="input-field"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>

          {/* Team 1 */}
          <div>
            <label className="label-sm">Team 1 Department</label>
            <select
              value={form.team1_department}
              onChange={(e) => set("team1_department", e.target.value)}
              className="input-field"
            >
              {DEPARTMENT_OPTIONS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          {/* Team 2 */}
          <div>
            <label className="label-sm">Team 2 Department</label>
            <select
              value={form.team2_department}
              onChange={(e) => set("team2_department", e.target.value)}
              className="input-field"
            >
              {DEPARTMENT_OPTIONS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label-sm">Match Date & Time</label>
            <input
              type="datetime-local"
              value={form.match_date}
              onChange={(e) => set("match_date", e.target.value)}
              className="input-field"
            />
          </div>

        </div>
      </section>

      {/* ── GAMES / SETS ─────────────────────────────── */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Games / Sets
              <span className="ml-2 text-zinc-600 font-normal normal-case text-xs">
                ({form.games.length} game{form.games.length !== 1 ? "s" : ""})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={addGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Game
          </button>
        </div>

        <div className="p-6 space-y-3">
          {form.games.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-600 text-sm">No games added yet.</p>
              <p className="text-zinc-700 text-xs mt-1">Click "Add Game" to add individual game scores.</p>
            </div>
          ) : (
            form.games.map((g, i) => (
              <GameRow
                key={i}
                game={g}
                index={i}
                team1={form.team1_department}
                team2={form.team2_department}
                onUpdate={updateGame}
                onRemove={removeGame}
              />
            ))
          )}
        </div>

        {form.games.length > 0 && (
          <div className="px-6 pb-5">
            <button
              type="button"
              onClick={autoComputeScores}
              className="w-full py-3 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Auto-compute Overall Score & Winner from Games
            </button>
          </div>
        )}
      </section>

      {/* ── OVERALL RESULT ───────────────────────────── */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center gap-3">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Overall Result</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Overall score */}
          <div>
            <label className="label-sm">Overall Score (Games Won)</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="label-sm">{form.team1_department || "Team 1"}</label>
                <input
                  type="number"
                  min={0}
                  value={form.team1_score}
                  onChange={(e) => set("team1_score", Number(e.target.value))}
                  className="input-field text-center text-2xl font-black"
                  placeholder="0"
                />
              </div>
              <div className="text-zinc-600 font-black text-xl mt-5">—</div>
              <div className="flex-1">
                <label className="label-sm">{form.team2_department || "Team 2"}</label>
                <input
                  type="number"
                  min={0}
                  value={form.team2_score}
                  onChange={(e) => set("team2_score", Number(e.target.value))}
                  className="input-field text-center text-2xl font-black"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Winner */}
          <div>
            <label className="label-sm">Winner</label>
            <div className="flex gap-2">
              {[form.team1_department, form.team2_department].map((dept) =>
                dept ? (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => set("winner", dept === form.winner ? "" : dept)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black uppercase transition-all border ${
                      form.winner === dept
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    {form.winner === dept && "🏆 "}
                    {dept}
                  </button>
                ) : null
              )}
              <button
                type="button"
                onClick={() => set("winner", "")}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase transition-all border ${
                  !form.winner
                    ? "bg-zinc-600 text-white border-zinc-500"
                    : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {!form.winner && form.match_status === "completed" && (
              <p className="text-xs text-zinc-600 mt-1">No winner selected (Draw / No Result)</p>
            )}
          </div>
        </div>
      </section>

      {/* ── SAVE BUTTON ──────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {saving ? (
          <>⏳ Saving to Database...</>
        ) : (
          <><Save className="w-5 h-5" /> Save Match Data</>
        )}
      </button>

      <style jsx global>{`
        .glass { background: rgba(8,8,8,0.8); backdrop-filter: blur(16px); }
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 12px; padding: 12px 14px; font-size: 15px; color: white; outline: none; }
        .input-field:focus { border-color: #3b82f6; }
        .label-sm { display: block; font-size: 11px; font-weight: 900; color: #777; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.12em; }
        select.input-field option { background: #111; color: white; }
      `}</style>
    </div>
  );
}
