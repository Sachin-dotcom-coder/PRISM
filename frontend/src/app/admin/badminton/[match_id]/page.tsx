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
interface IGame {
  game_number: number;
  team1_score: number | "";
  team2_score: number | "";
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

// ── Game Row Component ───────────────────────────────────
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
  const t1Wins =
    game.team1_score !== "" && game.team2_score !== "" &&
    Number(game.team1_score) > Number(game.team2_score);
  const t2Wins =
    game.team1_score !== "" && game.team2_score !== "" &&
    Number(game.team2_score) > Number(game.team1_score);

  return (
    <div className="flex items-center gap-3 p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all">
      {/* Game # badge */}
      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400 shrink-0">
        G{game.game_number}
      </div>

      {/* Team 1 score */}
      <div className="flex-1">
        <label className="block text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-widest">
          {team1 || "Team 1"}
        </label>
        <input
          type="number"
          min={0}
          value={game.team1_score}
          onChange={(e) =>
            onUpdate(index, {
              ...game,
              team1_score: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
          className={`w-full rounded-xl p-2.5 text-center text-lg font-black outline-none border transition-all
            ${t1Wins ? "bg-blue-600/20 border-blue-500/50 text-blue-300" : "bg-zinc-800 border-zinc-700 text-zinc-200 focus:border-blue-500"}
          `}
          placeholder="0"
        />
      </div>

      <div className="text-zinc-600 font-black text-sm shrink-0">vs</div>

      {/* Team 2 score */}
      <div className="flex-1">
        <label className="block text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-widest">
          {team2 || "Team 2"}
        </label>
        <input
          type="number"
          min={0}
          value={game.team2_score}
          onChange={(e) =>
            onUpdate(index, {
              ...game,
              team2_score: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
          className={`w-full rounded-xl p-2.5 text-center text-lg font-black outline-none border transition-all
            ${t2Wins ? "bg-blue-600/20 border-blue-500/50 text-blue-300" : "bg-zinc-800 border-zinc-700 text-zinc-200 focus:border-blue-500"}
          `}
          placeholder="0"
        />
      </div>

      {/* Winner indicator */}
      <div className="w-20 text-center shrink-0">
        {t1Wins && <span className="text-[10px] font-black text-blue-400 uppercase">🏆 {team1}</span>}
        {t2Wins && <span className="text-[10px] font-black text-blue-400 uppercase">🏆 {team2}</span>}
        {!t1Wins && !t2Wins && game.team1_score !== "" && (
          <span className="text-[10px] text-zinc-600">Draw</span>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition-all shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
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
      team1_score: "",
      team2_score: "",
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

  // Auto-compute overall scores from games (games won by each team)
  const autoComputeScores = () => {
    if (!form) return;
    let t1 = 0, t2 = 0;
    form.games.forEach((g) => {
      const s1 = Number(g.team1_score);
      const s2 = Number(g.team2_score);
      if (g.team1_score !== "" && g.team2_score !== "") {
        if (s1 > s2) t1++;
        else if (s2 > s1) t2++;
      }
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
          team1_score: Number(g.team1_score || 0),
          team2_score: Number(g.team2_score || 0),
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
    ongoing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
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
              <option value="ongoing">Ongoing</option>
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
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: white; outline: none; }
        .input-field:focus { border-color: #3b82f6; }
        .label-sm { display: block; font-size: 9px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.12em; }
        select.input-field option { background: #111; color: white; }
      `}</style>
    </div>
  );
}
