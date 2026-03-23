/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ── Cricket overs helper ───────────────────────────────── */
function incrementOvers(current: number): number {
  const int = Math.floor(current);
  const balls = Math.round((current - int) * 10);
  return balls >= 5 ? int + 1 : parseFloat((current + 0.1).toFixed(1));
}
function calcSR(runs: number, balls: number) {
  return balls === 0 ? "0.0" : ((runs / balls) * 100).toFixed(1);
}
function calcEco(runs: number, overs: number, ballsOverride?: number) {
  // ballsOverride: explicit ball count (avoids floating-point issues with overs)
  const totalBalls = ballsOverride !== undefined && ballsOverride > 0
    ? ballsOverride
    : (() => {
        const intO = Math.floor(overs);
        const partBalls = Math.round((overs - intO) * 10);
        return intO * 6 + partBalls;
      })();
  return totalBalls === 0 ? "0.0" : ((runs * 6) / totalBalls).toFixed(1);
}

/* ── Types ─────────────────────────────────────────────── */
type Batter = { batter: string; runs: number; balls: number; fours: number; sixes: number; strikeRate: number; status: string; isOnStrike: boolean };
type Bowler = { bowler: string; overs: number; balls: number; maidens: number; runs: number; wickets: number; economyRates: string; isCurrentBowler?: boolean };

const emptyBatter = (): Batter => ({ batter: "", runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, status: "not out", isOnStrike: false });
const emptyBowler = (): Bowler => ({ bowler: "", overs: 0, balls: 0, maidens: 0, runs: 0, wickets: 0, economyRates: "0.0", isCurrentBowler: false });

/* ── Inline editable batter row ────────────────────────── */
function BatterRow({ batter, onUpdate, onDelete }: { batter: Batter; onUpdate: (b: Batter) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Batter>({ ...batter });

  // Re-sync draft when batter prop changes from parent (e.g. after save+mutate)
  useEffect(() => {
    if (!editing) setDraft({ ...batter });
  }, [batter, editing]);

  const { gender } = useGender();
  const save = () => { onUpdate({ ...draft, strikeRate: parseFloat(calcSR(draft.runs, draft.balls)) }); setEditing(false); };
  const cancel = () => { setDraft({ ...batter }); setEditing(false); };
  const f = (field: keyof Batter, val: string | number) => setDraft(p => ({ ...p, [field]: val }));

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
      <td className="p-3 font-semibold text-zinc-200">
        <div className="flex items-center gap-2">
          {batter.isOnStrike && <span className="text-accent animate-pulse">★</span>}
          {batter.batter}
        </div>
      </td>
      <td className="p-3 text-center">
        <button 
          onClick={() => {
            // Deselect all others first
            onUpdate({ ...batter, isOnStrike: !batter.isOnStrike }); 
            // Wait, I need access to the whole list to deselect others. 
            // But I can handle this in the parent where setBatters/setBowlers is called.
          }}
          className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-all ${
            batter.isOnStrike ? "bg-accent text-white shadow-neon" : 
            batter.status === "not out" ? "bg-green-900/50 text-green-400 hover:bg-accent/20" : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {batter.isOnStrike ? "Striking" : batter.status}
        </button>
      </td>
      <td className="p-3 text-center font-bold text-accent">{batter.runs}</td>
      <td className="p-3 text-center text-zinc-400">{batter.balls}</td>
      <td className="p-3 text-center text-zinc-400">{batter.fours}</td>
      <td className="p-3 text-center text-zinc-400">{batter.sixes}</td>
      <td className="p-3 text-center text-zinc-500 text-sm">{calcSR(batter.runs, batter.balls)}</td>
      <td className="p-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-accent hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-accent/30 bg-accent/5">
      <td className="p-2"><input className={`w-full rounded px-2 py-1 text-sm ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.batter} onChange={e => f("batter", e.target.value)} /></td>
      <td className="p-2">
        <select className={`rounded px-2 py-1 text-xs w-full ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.status} onChange={e => f("status", e.target.value)}>
          <option value="not out">Not Out</option><option value="out">Out</option><option value="dnb">DNB</option>
        </select>
      </td>
      <td className="p-2"><input type="number" className={`w-16 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.runs} onChange={e => f("runs", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className={`w-16 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.balls} onChange={e => f("balls", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className={`w-14 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.fours} onChange={e => f("fours", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className={`w-14 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.sixes} onChange={e => f("sixes", +e.target.value)} /></td>
      <td className="p-2 text-center text-xs text-zinc-400">{calcSR(draft.runs, draft.balls)}</td>
      <td className="p-2">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white transition-all"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-all"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

/* ── Inline editable bowler row ────────────────────────── */
function BowlerRow({ bowler, onUpdate, onDelete }: { bowler: Bowler; onUpdate: (b: Bowler) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Bowler>({ ...bowler });

  // Re-sync draft when bowler prop changes from parent
  useEffect(() => {
    if (!editing) setDraft({ ...bowler });
  }, [bowler, editing]);

  const { gender } = useGender();
  const save = () => { onUpdate({ ...draft, economyRates: calcEco(draft.runs, draft.overs, draft.balls) }); setEditing(false); };
  const cancel = () => { setDraft({ ...bowler }); setEditing(false); };
  const f = (field: keyof Bowler, val: string | number) => setDraft(p => ({ ...p, [field]: val }));

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
      <td className="p-3 font-semibold text-zinc-200">
        <div className="flex items-center gap-2">
          {bowler.isCurrentBowler && <span className="text-red-400 animate-pulse">●</span>}
          {bowler.bowler}
        </div>
      </td>
      <td className="p-3 text-center">
        <button 
          onClick={() => {
            // Handle single selection in parent
            onUpdate({ ...bowler, isCurrentBowler: !bowler.isCurrentBowler });
          }}
          className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-all ${
            bowler.isCurrentBowler ? "bg-red-500 text-white shadow-neon" : "bg-zinc-800 text-zinc-400 hover:bg-red-500/20"
          }`}
        >
          {bowler.isCurrentBowler ? "Bowling" : "Select"}
        </button>
      </td>
      <td className="p-3 text-center text-zinc-400">{bowler.overs}</td>
      <td className="p-3 text-center text-zinc-400">{bowler.balls}</td>
      <td className="p-3 text-center text-zinc-400">{bowler.maidens}</td>
      <td className="p-3 text-center text-zinc-400">{bowler.runs}</td>
      <td className="p-3 text-center font-bold text-red-400">{bowler.wickets}</td>
      <td className="p-3 text-center text-zinc-500 text-sm">{calcEco(bowler.runs, bowler.overs)}</td>
      <td className="p-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-accent hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-accent/30 bg-accent/5">
      <td className="p-2"><input className={`w-full rounded px-2 py-1 text-sm ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.bowler} onChange={e => f("bowler", e.target.value)} /></td>
      <td className="p-2">
        <div className="flex gap-1">
          <input type="number" step="0.1" className={`w-16 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.overs} onChange={e => f("overs", parseFloat(e.target.value) || 0)} />
          <button onClick={() => f("overs", incrementOvers(draft.overs))} className={`px-1.5 rounded text-xs font-bold ${gender === 'f' ? 'bg-zinc-300 text-zinc-800 hover:bg-accent' : 'bg-zinc-700 hover:bg-accent'}`}>+</button>
        </div>
      </td>
      <td className="p-2"><input type="number" className={`w-14 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.maidens} onChange={e => f("maidens", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className={`w-16 rounded px-2 py-1 text-sm text-center ${gender === 'f' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.runs} onChange={e => f("runs", +e.target.value)} /></td>
      <td className="p-2"><input type="number" className={`w-14 rounded px-2 py-1 text-sm text-center text-red-500 ${gender === 'f' ? 'bg-zinc-100 border border-zinc-300' : 'bg-zinc-800'}`} value={draft.wickets} onChange={e => f("wickets", +e.target.value)} /></td>
      <td className="p-2 text-center text-xs text-zinc-400">{calcEco(draft.runs, draft.overs)}</td>
      <td className="p-2">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

/* ── Main Admin Match Page ──────────────────────────────── */
export default function AdminMatchUpdater() {
  const { match_id } = useParams();
  const { gender } = useGender();
  const { data: match, error, mutate } = useSWR(`/api/matches?id=${match_id}&gender=${gender}`, fetcher);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);
  const [status, setStatus] = useState("UPCOMING");
  const [winners, setWinners] = useState("");
  const isAddingBallRef = useRef(false); // Synchronous lock to prevent double additions
  const lastBallTimeRef = useRef(0); // Track last ball addition time
  const [isProcessingBall, setIsProcessingBall] = useState(false); // For UI feedback only
  const [batters, setBatters] = useState<Batter[]>([]);
  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [newBatter, setNewBatter] = useState<Batter>(emptyBatter());
  const [newBowler, setNewBowler] = useState<Bowler>(emptyBowler());
  // ── Auto-update logic driven by ball events ──
  const MAX_OVERS = 8;

  // Base values loaded from the DB (what was already saved)
  const [baseRuns, setBaseRuns]           = useState(0);
  const [baseWickets, setBaseWickets]     = useState(0);
  const [baseLegalBalls, setBaseLegalBalls] = useState(0); // total legal balls already bowled

  // New balls entered this session (on top of base)
  const [balls, setBalls] = useState<{ event: string; runs: number; isWicket: boolean; countsAsBall: boolean }[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  // Derive incremental stats from new balls only
  const newRuns     = balls.reduce((s, b) => s + b.runs, 0);
  const newWickets  = balls.filter(b => b.isWicket).length;
  const newLegal    = balls.filter(b => b.countsAsBall).length;

  // Total = base + new
  const totalRuns     = baseRuns + newRuns;
  const totalWickets  = baseWickets + newWickets;
  const totalLegal    = baseLegalBalls + newLegal;
  const totalOvers    = parseFloat(`${Math.floor(totalLegal / 6)}.${totalLegal % 6}`);
  const inningsOver   = totalOvers >= MAX_OVERS || totalWickets >= 10;

  const BALL_LOGIC: Record<string, { runs: number; isWicket: boolean; countsAsBall: boolean }> = {
    "0":  { runs: 0, isWicket: false, countsAsBall: true  },
    "1":  { runs: 1, isWicket: false, countsAsBall: true  },
    "2":  { runs: 2, isWicket: false, countsAsBall: true  },
    "3":  { runs: 3, isWicket: false, countsAsBall: true  },
    "4":  { runs: 4, isWicket: false, countsAsBall: true  },
    "6":  { runs: 6, isWicket: false, countsAsBall: true  },
    "W":  { runs: 0, isWicket: true,  countsAsBall: true  },
    "WD": { runs: 1, isWicket: false, countsAsBall: false },
    "NB": { runs: 1, isWicket: false, countsAsBall: false },
  };

  const addBallEvent = () => {
    // Multiple layers of protection against duplicate ball additions
    const now = Date.now();
    if (!selectedEvent || inningsOver || isAddingBallRef.current || (now - lastBallTimeRef.current < 500)) return;
    
    isAddingBallRef.current = true;
    lastBallTimeRef.current = now;
    
    const logic = BALL_LOGIC[selectedEvent];
    if (!logic) {
      isAddingBallRef.current = false;
      return;
    }
    
    // 1. Calculate new ball
    const newBall = { event: selectedEvent, ...logic };
    const newBalls = [...balls, newBall];

    // Calculate next stats locally to avoid stale state in rotation logic
    const nextTotalLegal = totalLegal + (logic.countsAsBall ? 1 : 0);

    // 2. Calculate new bowlers
    let newBowlers = [...bowlers];
    const bowlerIdx = newBowlers.findIndex(b => b.isCurrentBowler);
    if (bowlerIdx !== -1) {
      const b = { ...newBowlers[bowlerIdx] };
      
      if (logic.countsAsBall) {
          b.overs = incrementOvers(b.overs);
          b.balls = (b.balls || 0) + 1;
      }
      b.runs += logic.runs;
      if (logic.isWicket) b.wickets += 1;
      b.economyRates = calcEco(b.runs, b.overs, b.balls);
      newBowlers[bowlerIdx] = b;
    }

    // 3. Calculate new batters
    let newBatters = [...batters];
    const strikerIdx = newBatters.findIndex(b => b.isOnStrike);
    if (strikerIdx !== -1) {
      const s = { ...newBatters[strikerIdx] };
      
      if (logic.countsAsBall) s.balls += 1;
      s.runs += logic.runs;
      if (selectedEvent === "4") s.fours += 1;
      if (selectedEvent === "6") s.sixes += 1;
      if (logic.isWicket) {
        s.status = "out";
        s.isOnStrike = false;
      }
      s.strikeRate = parseFloat(calcSR(s.runs, s.balls));
      newBatters[strikerIdx] = s;

      // Determine if strike should rotate
      let shouldRotate = false;
      
      // Run-based rotation (1, 3 runs) - only if it's a legal ball
      if (!logic.isWicket && logic.countsAsBall && (logic.runs === 1 || logic.runs === 3)) {
        shouldRotate = !shouldRotate;
      }
      
      // Over-complete rotation
      if (logic.countsAsBall && nextTotalLegal > 0 && nextTotalLegal % 6 === 0) {
        shouldRotate = !shouldRotate;
      }

      if (shouldRotate) {
        const currentStrikerIdx = newBatters.findIndex(b => b.isOnStrike); 
        const nextBatterIdx = newBatters.findIndex((b, idx) => idx !== currentStrikerIdx && b.status === "not out");
        if (nextBatterIdx !== -1) {
          newBatters[currentStrikerIdx] = { ...newBatters[currentStrikerIdx], isOnStrike: false };
          newBatters[nextBatterIdx] = { ...newBatters[nextBatterIdx], isOnStrike: true };
        }
      }
    }

    // Update local state
    setBalls(newBalls);
    setBowlers(newBowlers);
    setBatters(newBatters);
    setSelectedEvent("");
    setIsProcessingBall(true);

    // Auto-save to database
    performAutoSave(newBalls, newBatters, newBowlers, newBalls.length).finally(() => {
      isAddingBallRef.current = false; // Unlock after save completes
      setIsProcessingBall(false);
    });
  };

  const undoLastBall = () => setBalls(prev => prev.slice(0, -1));

  // Load existing innings from DB
  const loadInnings = useCallback((matchData: any, teamIdx: number) => {
    if (!matchData) return;
    setStatus(matchData.status || "UPCOMING");
    setWinners(matchData.winners || "");

    const inn = matchData.innings?.[teamIdx];
    if (inn) {
      const dbRuns = inn.runs || 0;
      const dbWickets = inn.wickets || 0;
      const dbOvers = inn.overs || 0;
      const intOvers = Math.floor(dbOvers);
      const ballsInOver = Math.round((dbOvers - intOvers) * 10);
      const dbLegal = intOvers * 6 + ballsInOver;

      // Map strings back to ball objects using BALL_LOGIC and calculate their contribution
      let loadedRuns = 0;
      let loadedWickets = 0;
      let loadedLegal = 0;

      const loadedBalls = (matchData.recent_balls || []).map((ev: string) => {
        const logic = BALL_LOGIC[ev] || { runs: 0, isWicket: false, countsAsBall: true };
        loadedRuns += logic.runs;
        if (logic.isWicket) loadedWickets += 1;
        if (logic.countsAsBall) loadedLegal += 1;
        return { event: ev, ...logic };
      });

      // Synchronize state
      setBaseRuns(dbRuns - loadedRuns);
      setBaseWickets(dbWickets - loadedWickets);
      setBaseLegalBalls(dbLegal - loadedLegal);
      setBalls(loadedBalls);
      setBatters(inn.batters || []);
      setBowlers(inn.bowlers || []);
    } else {
      setBaseRuns(0); setBaseWickets(0); setBaseLegalBalls(0);
      setBatters([]); setBowlers([]);
      setBalls([]);
    }
    setSelectedEvent("");
  }, []);

  useEffect(() => { loadInnings(match, activeTeam); }, [match, activeTeam, loadInnings]);

  if (error) return <div className="text-red-400 p-8">Error: {error.message}</div>;
  if (!match) return <div className="p-8 text-zinc-500 animate-pulse">Loading updater...</div>;

  const team1Short = match.teams?.team1?.shortName || "T1";
  const team2Short = match.teams?.team2?.shortName || "T2";
  const team1Name = match.teams?.team1?.name || "Team 1";
  const team2Name = match.teams?.team2?.name || "Team 2";

  // Derive batting order from toss if available
  let firstBattingTeamName = team1Name;
  let secondBattingTeamName = team2Name;

  if (match.toss && match.toss.winner) {
    const isTeam1Winner = match.toss.winner === team1Name || match.toss.winner === team1Short;
    if (match.toss.decision.toLowerCase() === "bat") {
      firstBattingTeamName = isTeam1Winner ? team1Name : team2Name;
      secondBattingTeamName = isTeam1Winner ? team2Name : team1Name;
    } else {
      // decided to bowl -> the other team bats first
      firstBattingTeamName = isTeam1Winner ? team2Name : team1Name;
      secondBattingTeamName = isTeam1Winner ? team1Name : team2Name;
    }
  }

  const teamNames = [firstBattingTeamName, secondBattingTeamName];

  const handleSave = async () => {
    setIsSaving(true); setSaveMsg("");
    const recentEvents = balls.slice(-6).map(b => b.event);

    const updatedInnings = [...(match.innings || [])];
    while (updatedInnings.length <= activeTeam) {
      updatedInnings.push({ team: teamNames[updatedInnings.length], runs: 0, wickets: 0, overs: 0, batters: [], bowlers: [], fow: [] });
    }
    updatedInnings[activeTeam] = {
      ...updatedInnings[activeTeam],
      team: teamNames[activeTeam],
      runs: totalRuns,
      wickets: totalWickets,
      overs: totalOvers,
      batters, bowlers,
    };

    const isOverComplete = totalLegal > 0 && totalLegal % 6 === 0;

    const currentStriker = batters.find(b => b.isOnStrike)?.batter || "";
    const currentNonStriker = batters.find(b => b.status === "not out" && !b.isOnStrike)?.batter || "";
    const activeBowler = bowlers.find(b => b.isCurrentBowler)?.bowler || "";

    try {
      const res = await fetch(`/api/matches?gender=${gender}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: match.match_id, status, winners,
          innings: updatedInnings,
          recent_balls: isOverComplete ? [] : balls.map(b => b.event),
          striker: currentStriker,
          nonStriker: currentNonStriker,
          currentBowler: activeBowler,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveMsg(`❌ ${data.error}`); }
      else {
        setSaveMsg("✅ Saved to database!");
        // If the over was complete, we've cleared it in DB, so clear it locally too
        if (isOverComplete) setBalls([]);
        mutate();
      }
    } catch (e: any) { setSaveMsg(`❌ ${e.message}`); }
    finally { setIsSaving(false); }
  };

  // Auto-save function for ball events (called immediately after ball is added)
  const performAutoSave =async (ballsData: typeof balls, battersData: typeof batters, bowlersData: typeof bowlers, ballsCount: number) => {
    const recentEvents = ballsData.slice(-6).map(b => b.event);

    const updatedInnings = [...(match.innings || [])];
    while (updatedInnings.length <= activeTeam) {
      updatedInnings.push({ team: teamNames[updatedInnings.length], runs: 0, wickets: 0, overs: 0, batters: [], bowlers: [], fow: [] });
    }
    
    const newTotalRunsForSave = baseRuns + ballsData.reduce((s, b) => s + b.runs, 0);
    const newTotalWicketsForSave = baseWickets + ballsData.filter(b => b.isWicket).length;
    const newTotalLegalForSave = baseLegalBalls + ballsData.filter(b => b.countsAsBall).length;
    const newTotalOversForSave = parseFloat(`${Math.floor(newTotalLegalForSave / 6)}.${newTotalLegalForSave % 6}`);
    const isOverCompleteForSave = newTotalLegalForSave > 0 && newTotalLegalForSave % 6 === 0;

    updatedInnings[activeTeam] = {
      ...updatedInnings[activeTeam],
      team: teamNames[activeTeam],
      runs: newTotalRunsForSave,
      wickets: newTotalWicketsForSave,
      overs: newTotalOversForSave,
      batters: battersData,
      bowlers: bowlersData,
    };

    const currentStriker = battersData.find(b => b.isOnStrike)?.batter || "";
    const currentNonStriker = battersData.find(b => b.status === "not out" && !b.isOnStrike)?.batter || "";
    const activeBowler = bowlersData.find(b => b.isCurrentBowler)?.bowler || "";

    try {
      await fetch(`/api/matches?gender=${gender}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: match.match_id, status, winners,
          innings: updatedInnings,
          recent_balls: isOverCompleteForSave ? [] : ballsData.map(b => b.event),
          striker: currentStriker,
          nonStriker: currentNonStriker,
          currentBowler: activeBowler,
        }),
      });
      mutate();
    } catch (e: any) { 
      console.error("Auto-save error:", e.message);
    }
  };

  const addBatter = () => {
    if (!newBatter.batter.trim()) return;
    // Auto-strike first batter (opener)
    const isFirstBatter = batters.length === 0;
    setBatters(p => [...p, { ...newBatter, strikeRate: parseFloat(calcSR(newBatter.runs, newBatter.balls)), isOnStrike: isFirstBatter }]);
    setNewBatter(emptyBatter());
  };
  const addBowler = () => {
    if (!newBowler.bowler.trim()) return;
    setBowlers(p => [...p, { ...newBowler, economyRates: calcEco(newBowler.runs, newBowler.overs) }] as any);
    setNewBowler(emptyBowler());
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-24 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="text-sm font-bold bg-zinc-800 px-3 py-1 rounded tracking-widest">{match.match_id}</span>
      </div>

      {/* Match header + status */}
      <div className="glass p-5 rounded-3xl border border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-sports tracking-wide">{team1Short} <span className="text-zinc-500 font-sans text-lg mx-2">vs</span> {team2Short}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className={`bg-zinc-900 border rounded-lg px-3 py-1 text-sm font-bold focus:outline-none ${status === "LIVE" ? "border-red-500/50 text-red-400" : "border-zinc-800 text-zinc-300"}`}>
              <option value="UPCOMING">Upcoming</option><option value="LIVE">Live</option><option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Winner selection - shown when match is completed */}
        {status === "COMPLETED" && (
          <div className="mb-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Match Winner</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setWinners(team1Short)}
                className={`py-2 px-3 rounded-lg font-bold transition-all text-sm ${
                  winners === team1Short
                    ? "bg-accent text-white shadow-neon"
                    : "bg-zinc-800 text-zinc-300 hover:border-zinc-600 border border-zinc-700"
                }`}>
                {team1Short} Wins
              </button>
              <button
                onClick={() => setWinners("")}
                className={`py-2 px-3 rounded-lg font-bold transition-all text-sm ${
                  winners === ""
                    ? "bg-yellow-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:border-zinc-600 border border-zinc-700"
                }`}>
                Draw / No Result
              </button>
              <button
                onClick={() => setWinners(team2Short)}
                className={`py-2 px-3 rounded-lg font-bold transition-all text-sm ${
                  winners === team2Short
                    ? "bg-accent text-white shadow-neon"
                    : "bg-zinc-800 text-zinc-300 hover:border-zinc-600 border border-zinc-700"
                }`}>
                {team2Short} Wins
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toss Information */}
      {match.toss && (
        <div className="glass p-5 rounded-3xl border border-zinc-800">
          <h3 className="text-lg font-bold text-accent mb-4 uppercase tracking-wider">Toss Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Toss Winner:</span>
              <span className="font-bold text-white">{match.toss.winner}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Decision:</span>
              <span className="font-bold text-white">{match.toss.decision} first</span>
            </div>
          </div>
        </div>
      )}

      {/* Innings Selection */}
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <button key={i} onClick={() => setActiveTeam(i as 0 | 1)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTeam === i ? "bg-accent text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {teamNames[i]} Innings
          </button>
        ))}
      </div>

      {/* ── LIVE BALL ENTRY ── */}
      <div className="glass p-5 rounded-3xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ball-by-Ball Entry</h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            inningsOver ? "bg-red-900/50 text-red-400" : totalOvers >= MAX_OVERS - 1 ? "bg-yellow-900/50 text-yellow-400" : "bg-zinc-800 text-zinc-400"
          }`}>
            {inningsOver ? "🔒 Innings Complete" : `Over ${Math.floor(totalLegal / 6)}.${totalLegal % 6} / ${MAX_OVERS}`}
          </span>
        </div>

        {/* Live scoreboard */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-2xl p-4 text-center border ${gender === 'f' ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className={`text-3xl font-sports font-bold ${gender === 'f' ? 'text-zinc-900' : 'glow-text'}`}>{totalRuns}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Runs</div>
          </div>
          <div className={`rounded-2xl p-4 text-center border ${gender === 'f' ? 'bg-zinc-100 border-red-500/30' : 'bg-zinc-900 border-red-900/30'}`}>
            <div className="text-3xl font-sports text-red-400 font-bold">{totalWickets}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Wickets</div>
          </div>
          <div className={`rounded-2xl p-4 text-center border ${gender === 'f' ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className={`text-3xl font-sports font-bold ${gender === 'f' ? 'text-zinc-900' : ''}`}>{totalOvers}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Overs</div>
          </div>
        </div>

        {/* Recent balls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">This Over:</span>
          {balls.slice(-6).map((b, i) => (
            <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
              b.event === "W" ? "bg-red-500 text-white border-red-400" :
              b.event === "4" || b.event === "6" ? "bg-accent/20 text-accent border-accent/40" :
              b.event === "WD" || b.event === "NB" ? "bg-yellow-900/40 text-yellow-400 border-yellow-700/40" :
              "bg-zinc-800 text-zinc-300 border-zinc-700"
            }`}>{b.event}</div>
          ))}
          {balls.length === 0 && <span className="text-zinc-600 text-xs">No balls bowled yet</span>}
        </div>

        {/* Ball event selector */}
        {!inningsOver ? (
          <div className="flex gap-2">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 flex-1">
              {["0","1","2","3","4","6","W","WD","NB"].map(ev => (
                <button key={ev}
                  onClick={() => setSelectedEvent(ev === selectedEvent ? "" : ev)}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                    selectedEvent === ev
                      ? ev === "W" ? "bg-red-500 text-white border-red-400"
                        : ev === "4" || ev === "6" ? "bg-accent text-white border-accent"
                        : ev === "WD" || ev === "NB" ? "bg-yellow-600 text-white border-yellow-500"
                        : "bg-zinc-600 text-white border-zinc-500"
                      : (gender === 'f' ? "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:text-zinc-900" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white")
                  }`}>
                  {ev === "WD" ? "Wide" : ev === "NB" ? "NB" : ev === "W" ? "W🔴" : ev === "4" ? "4🔵" : ev === "6" ? "6✨" : ev}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-zinc-500 text-sm font-medium">Innings is complete ({MAX_OVERS} overs)</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={addBallEvent}
            disabled={!selectedEvent || inningsOver || isProcessingBall}
            className="flex-1 py-3 bg-accent hover:bg-accent/80 text-white font-bold uppercase tracking-wider rounded-xl disabled:opacity-40 transition-all">
            {isProcessingBall ? "⏳ Adding..." : "✚ Add Ball (Auto-saves)"}
          </button>
          <button
            onClick={undoLastBall}
            disabled={balls.length === 0 || isProcessingBall}
            className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl disabled:opacity-40 transition-all text-sm">
            ↩ Undo
          </button>
        </div>

        {/* Over summary */}
        {Math.floor(totalLegal / 6) > 0 && (
          <div className="text-xs text-zinc-600 text-center">Completed {Math.floor(totalLegal / 6)} over{Math.floor(totalLegal / 6) > 1 ? "s" : ""} | {MAX_OVERS - Math.floor(totalLegal / 6)} remaining</div>
        )}
      </div>

      {/* ── BATTING TABLE ── */}
      <div className="glass p-5 rounded-3xl border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Batting Scorecard — {teamNames[activeTeam]}
          <span className="ml-2 text-zinc-600 font-normal normal-case">({batters.length} batters)</span>
        </h3>

        {/* Strike Selector (if batters exist) */}
        {batters.length > 0 && (
          <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
            <div className="text-xs text-zinc-400 font-semibold uppercase mb-2">Striker (Click to Change)</div>
            <div className="flex flex-wrap gap-2">
              {batters.filter(b => b.status === "not out").map((batter, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBatters(b => b.map(bat => ({
                      ...bat,
                      isOnStrike: bat.batter === batter.batter
                    })));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    batter.isOnStrike
                      ? "bg-accent text-white shadow-neon"
                      : "bg-zinc-800 text-zinc-300 hover:border-zinc-600 border border-zinc-700"
                  }`}>
                  {batter.batter} {batter.isOnStrike && "⭐"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Batter</th><th className="p-3">Status/Strike</th>
                <th className="p-3">R</th><th className="p-3">B</th>
                <th className="p-3">4s</th><th className="p-3">6s</th>
                <th className="p-3">SR</th><th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {batters.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-zinc-600 text-sm">No batters yet. Add one below.</td></tr>
              )}
              {batters.map((b, idx) => (
                <BatterRow key={idx} batter={b as any}
                  onUpdate={(updated) => setBatters(p => p.map((x, i) => {
                    if (i === idx) return updated as any;
                    if ((updated as any).isOnStrike) return { ...x, isOnStrike: false };
                    return x;
                  }))}
                  onDelete={() => setBatters(p => p.filter((_, i) => i !== idx))} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new batter row */}
        <details className="group" open>
          <summary className="cursor-pointer text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
            <Plus className="w-3.5 h-3.5" /> Add New Batter
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1 font-semibold uppercase">Name</label>
              <input placeholder="e.g. Rahul Sharma" value={newBatter.batter} onChange={e => setNewBatter(p => ({ ...p, batter: e.target.value }))} className={`w-full rounded-lg p-2.5 text-sm focus:border-accent bg-zinc-800 border border-zinc-700`} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1 font-semibold uppercase">Status</label>
              <select value={newBatter.status} onChange={e => setNewBatter(p => ({ ...p, status: e.target.value }))} className={`w-full rounded-lg p-2.5 text-sm bg-zinc-800 border border-zinc-700`}>
                <option value="not out">Not Out</option><option value="out">Out</option><option value="dnb">DNB</option>
              </select>
            </div>
            {[["Runs","runs"],["Balls","balls"],["4s","fours"],["6s","sixes"]].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-zinc-500 mb-1 font-semibold uppercase">{label}</label>
                <input type="number" min={0} value={(newBatter as any)[key]} onChange={e => setNewBatter(p => ({ ...p, [key]: +e.target.value }))} className={`w-full rounded-lg p-2.5 text-sm focus:border-accent bg-zinc-800 border border-zinc-700`} />
              </div>
            ))}
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-zinc-800 rounded-lg p-2.5 text-center text-xs text-zinc-500">SR: <span className="text-accent font-bold">{calcSR(newBatter.runs, newBatter.balls)}</span></div>
              <button onClick={addBatter} className="flex items-center gap-1 px-4 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-bold transition-all"><Plus className="w-4 h-4" /> Add</button>
            </div>
          </div>
        </details>
      </div>

      {/* ── BOWLING TABLE ── */}
      <div className="glass p-5 rounded-3xl border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Bowling Scorecard
          <span className="ml-2 text-zinc-600 font-normal normal-case">({bowlers.length} bowlers)</span>
        </h3>

        {/* Current Bowler Selector */}
        {bowlers.length > 0 && (
          <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
            <div className="text-xs text-zinc-400 font-semibold uppercase mb-2">Current Bowler (Click to Change)</div>
            <div className="flex flex-wrap gap-2">
              {bowlers.map((bowler, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBowlers(b => b.map(bowl => ({
                      ...bowl,
                      isCurrentBowler: bowl.bowler === bowler.bowler
                    })));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    bowler.isCurrentBowler
                      ? "bg-accent text-white shadow-neon"
                      : "bg-zinc-800 text-zinc-300 hover:border-zinc-600 border border-zinc-700"
                  }`}>
                  {bowler.bowler} {bowler.isCurrentBowler && "🎯"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left p-3">Bowler</th><th className="p-3">Current</th>
                <th className="p-3">O</th><th className="p-3">Balls</th><th className="p-3">M</th>
                <th className="p-3">R</th><th className="p-3">W</th><th className="p-3">Eco</th><th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {bowlers.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-zinc-600 text-sm">No bowlers yet. Add one below.</td></tr>
              )}
              {bowlers.map((b, idx) => (
                <BowlerRow key={idx} bowler={b as any}
                  onUpdate={(updated) => setBowlers(p => p.map((x, i) => {
                    if (i === idx) return updated as any;
                    if ((updated as any).isCurrentBowler) return { ...x, isCurrentBowler: false };
                    return x;
                  }))}
                  onDelete={() => setBowlers(p => p.filter((_, i) => i !== idx))} />
              ))}
            </tbody>
          </table>
        </div>

        <details className="group" open>
          <summary className="cursor-pointer text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
            <Plus className="w-3.5 h-3.5" /> Add New Bowler
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1 font-semibold uppercase">Name</label>
              <input placeholder="e.g. Arjun Singh" value={newBowler.bowler} onChange={e => setNewBowler(p => ({ ...p, bowler: e.target.value }))} className={`w-full rounded-lg p-2.5 text-sm focus:border-accent bg-zinc-800 border border-zinc-700`} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1 font-semibold uppercase">Overs</label>
              <div className="flex gap-1">
                <input type="number" step="0.1" value={newBowler.overs} onChange={e => setNewBowler(p => ({ ...p, overs: parseFloat(e.target.value) || 0 }))} className={`w-full rounded-lg p-2.5 text-sm bg-zinc-800 border border-zinc-700`} />
                <button onClick={() => setNewBowler(p => ({ ...p, overs: incrementOvers(p.overs) }))} className={`px-2 rounded-lg text-xs font-bold transition-all bg-zinc-700 hover:bg-accent`}>+</button>
              </div>
            </div>
            {[["Maidens","maidens"],["Runs","runs"],["Wickets","wickets"],["Balls","balls"]].map(([label, key]) => (
              <div key={key}>
                <label className={`block text-xs mb-1 font-semibold uppercase ${key === "wickets" ? 'text-red-400' : "text-zinc-500"}`}>{label}</label>
                <input type="number" min={0} value={(newBowler as any)[key]} onChange={e => setNewBowler(p => ({ ...p, [key]: +e.target.value }))} className={`w-full rounded-lg p-2.5 text-sm focus:border-accent bg-zinc-800 border ${key === 'wickets' ? 'border-red-500/30 text-red-400' : 'border-zinc-700'}`} />
              </div>
            ))}
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-zinc-800 rounded-lg p-2.5 text-center text-xs text-zinc-500">Eco: <span className="text-accent font-bold">{calcEco(newBowler.runs, newBowler.overs)}</span></div>
              <button onClick={addBowler} className="flex items-center gap-1 px-4 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-bold transition-all"><Plus className="w-4 h-4" /> Add Bowler</button>
            </div>
          </div>
        </details>
      </div>

      {/* Save button */}
      {saveMsg && (
        <div className={`text-center text-sm font-semibold py-2 px-4 rounded-xl ${saveMsg.startsWith("✅") ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
          {saveMsg}
        </div>
      )}
      <button onClick={handleSave} disabled={isSaving}
        className="w-full py-4 bg-accent hover:bg-accent/80 text-white font-bold tracking-widest uppercase rounded-xl flex justify-center items-center gap-2 transition-all hover:shadow-neon disabled:opacity-50">
        {isSaving ? "Saving..." : <><Save className="w-5 h-5" /> Save Final Match Data to Database</>}
      </button>
      <div className="text-xs text-zinc-600 text-center italic">
        💡 Balls are auto-saved to database immediately. Use this button to save final match status and winners.
      </div>
    </div>
  );
}