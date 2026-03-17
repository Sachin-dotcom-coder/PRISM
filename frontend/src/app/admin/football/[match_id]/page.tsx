/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUSES = ["UPCOMING", "FIRST_HALF", "HALF_TIME", "SECOND_HALF", "COMPLETED"];

export default function FootballAdminMatch() {
  const { match_id } = useParams();
  const { gender } = useGender();
  const { data: match, error, mutate } = useSWR(
    `/api/football/matches?id=${match_id}&gender=${gender}`,
    fetcher
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Editable state
  const [status, setStatus]   = useState("UPCOMING");
  const [score1, setScore1]   = useState(0);
  const [score2, setScore2]   = useState(0);
  const [goals, setGoals]     = useState<{ team: string; player: string; minute?: number }[]>([]);
  const [winner, setWinner]   = useState("");
  const [finalScore, setFinalScore] = useState("");

  // New goal form
  const [newGoalPlayer, setNewGoalPlayer] = useState("");
  const [newGoalTeam, setNewGoalTeam] = useState("");
  const [newGoalMinute, setNewGoalMinute] = useState<number | "">("");

  // Load from DB
  useEffect(() => {
    if (!match) return;
    setStatus(match.status || "UPCOMING");
    setScore1(match.score?.team1 ?? 0);
    setScore2(match.score?.team2 ?? 0);
    setGoals(match.goals || []);
    setWinner(match.result?.winner || "");
    setFinalScore(match.result?.final_score || "");
  }, [match]);

  if (error) return <div className="text-red-400 p-8">Error loading match.</div>;
  if (!match) return <div className="p-8 text-zinc-500 animate-pulse">Loading...</div>;

  const team1 = match.teams?.team1 || "Team 1";
  const team2 = match.teams?.team2 || "Team 2";

  const addGoal = () => {
    if (!newGoalPlayer.trim() || !newGoalTeam) return;
    const goal: any = { team: newGoalTeam, player: newGoalPlayer.trim() };
    if (newGoalMinute !== "") goal.minute = Number(newGoalMinute);
    setGoals(p => [...p, goal]);
    // Auto-increment score
    if (newGoalTeam === team1) setScore1(p => p + 1);
    else if (newGoalTeam === team2) setScore2(p => p + 1);
    setNewGoalPlayer(""); setNewGoalTeam(""); setNewGoalMinute("");
  };

  const removeGoal = (idx: number) => {
    const g = goals[idx];
    if (g.team === team1) setScore1(p => Math.max(0, p - 1));
    else if (g.team === team2) setScore2(p => Math.max(0, p - 1));
    setGoals(p => p.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`/api/football/matches?gender=${gender}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: match.match_id,
          status,
          score: { team1: score1, team2: score2 },
          goals,
          result: {
            winner: winner || null,
            final_score: finalScore || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveMsg(`❌ ${data.error}`); }
      else { setSaveMsg("✅ Saved to database!"); mutate(); }
    } catch (e: any) { setSaveMsg(`❌ ${e.message}`); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/football" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="text-sm font-bold bg-zinc-800 theme-women:bg-zinc-500/20 theme-women:text-zinc-700 px-3 py-1 rounded tracking-widest">{match.match_id}</span>
      </div>

      {/* Match Title */}
      <div className="glass p-5 rounded-3xl border border-zinc-800">
        <h2 className="text-2xl font-sports tracking-wide mb-4">
          {team1} <span className="text-zinc-500 text-lg mx-2">vs</span> {team2}
        </h2>

        {/* Status */}
        <div>
          <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Match Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border transition-all ${
                  status === s
                    ? s === "FIRST_HALF" || s === "SECOND_HALF"
                      ? "bg-green-600 text-white border-green-500"
                      : s === "HALF_TIME"
                      ? "bg-yellow-600 text-white border-yellow-500"
                      : "bg-accent text-white border-accent"
                    : (gender === 'f' ? "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:text-zinc-900" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white")
                }`}>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="glass p-5 rounded-3xl border border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Score</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">{team1}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setScore1(p => Math.max(0, p - 1))}
                className={`w-10 h-10 rounded-xl font-bold text-lg transition-all ${gender === 'f' ? 'bg-zinc-200 text-zinc-900 hover:bg-red-500 hover:text-white' : 'bg-zinc-800 hover:bg-red-900 text-white'}`}>−</button>
              <div className={`flex-1 text-center text-4xl font-sports py-2 rounded-xl border ${gender === 'f' ? 'bg-zinc-100 border-zinc-300 text-zinc-900' : 'bg-zinc-900 border-transparent text-white'}`}>{score1}</div>
              <button onClick={() => setScore1(p => p + 1)}
                className={`w-10 h-10 rounded-xl font-bold text-lg transition-all ${gender === 'f' ? 'bg-zinc-200 text-zinc-900 hover:bg-accent hover:text-white' : 'bg-zinc-800 hover:bg-accent text-white'}`}>+</button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">{team2}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setScore2(p => Math.max(0, p - 1))}
                className={`w-10 h-10 rounded-xl font-bold text-lg transition-all ${gender === 'f' ? 'bg-zinc-200 text-zinc-900 hover:bg-red-500 hover:text-white' : 'bg-zinc-800 hover:bg-red-900 text-white'}`}>−</button>
              <div className={`flex-1 text-center text-4xl font-sports py-2 rounded-xl border ${gender === 'f' ? 'bg-zinc-100 border-zinc-300 text-zinc-900' : 'bg-zinc-900 border-transparent text-white'}`}>{score2}</div>
              <button onClick={() => setScore2(p => p + 1)}
                className={`w-10 h-10 rounded-xl font-bold text-lg transition-all ${gender === 'f' ? 'bg-zinc-200 text-zinc-900 hover:bg-accent hover:text-white' : 'bg-zinc-800 hover:bg-accent text-white'}`}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="glass p-5 rounded-3xl border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Goals <span className="text-zinc-600 font-normal normal-case ml-1">({goals.length} total)</span>
        </h3>

        {/* Goals list */}
        <div className="space-y-2">
          {goals.length === 0 && <p className="text-zinc-600 text-sm text-center py-3">No goals yet.</p>}
          {goals.map((g, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
              g.team === team1 ? "bg-accent/10 border border-accent/20" : (gender === 'f' ? "bg-zinc-100 border border-zinc-300" : "bg-zinc-800/80 border border-zinc-700/50")
            }`}>
              <span className="text-lg">⚽</span>
              <span className={`font-bold ${g.team === team1 ? "text-accent" : (gender === 'f' ? "text-zinc-900" : "text-zinc-200")}`}>{g.player}</span>
              <span className="text-xs text-zinc-500 flex-1">for {g.team}</span>
              {g.minute && <span className="text-xs text-zinc-500 font-mono">{g.minute}&apos;</span>}
              <button onClick={() => removeGoal(idx)}
                className="p-1 rounded-lg hover:bg-red-900/50 text-zinc-500 hover:text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add goal form */}
        <div className={`p-4 rounded-2xl border space-y-3 ${gender === 'f' ? 'bg-zinc-100/50 border-zinc-300' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
          <p className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1"><Plus className="w-3 h-3" /> Add Goal</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Team</label>
              <select value={newGoalTeam} onChange={e => setNewGoalTeam(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:border-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border border-zinc-700'}`}>
                <option value="">— Select Team —</option>
                <option value={team1}>{team1}</option>
                <option value={team2}>{team2}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Minute</label>
              <input type="number" min={1} max={90} placeholder="Optional"
                value={newGoalMinute}
                onChange={e => setNewGoalMinute(e.target.value ? Number(e.target.value) : "")}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:border-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border border-zinc-700'}`} />
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Player</label>
              <input placeholder="e.g. Lionel Messi" value={newGoalPlayer} onChange={e => setNewGoalPlayer(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:border-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border border-zinc-700'}`} />
            </div>
            <button onClick={addGoal} disabled={!newGoalPlayer.trim() || !newGoalTeam}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors disabled:opacity-40 flex items-center gap-1 ${gender === 'f' ? 'bg-zinc-800 text-white hover:bg-zinc-900' : 'bg-accent hover:bg-accent/80 text-white'}`}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Result (for when completed) */}
      {status === "COMPLETED" && (
        <div className={`p-5 rounded-3xl border space-y-3 ${gender === 'f' ? 'bg-zinc-100/50 border-zinc-300' : 'glass border-zinc-800'}`}>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Result</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Winner</label>
              <select value={winner} onChange={e => setWinner(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:border-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border border-zinc-700'}`}>
                <option value="">— Draw / No Result —</option>
                <option value={team1}>{team1}</option>
                <option value={team2}>{team2}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Final Score</label>
              <input placeholder={`e.g. ${score1}-${score2}`} value={finalScore}
                onChange={e => setFinalScore(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:border-accent ${gender === 'f' ? 'bg-white text-zinc-900 border border-zinc-300 outline-none' : 'bg-zinc-800 border border-zinc-700'}`} />
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      {saveMsg && (
        <div className={`text-center text-sm font-semibold py-2 px-4 rounded-xl ${saveMsg.startsWith("✅") ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
          {saveMsg}
        </div>
      )}
      <button onClick={handleSave} disabled={isSaving}
        className="w-full py-4 bg-accent hover:bg-accent/80 text-white font-bold tracking-widest uppercase rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50">
        {isSaving ? "Saving..." : <><Save className="w-5 h-5" /> Save to Database</>}
      </button>
    </div>
  );
}
