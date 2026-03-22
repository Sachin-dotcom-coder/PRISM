/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Activity, Trash2, Pencil, Check, X, Trophy } from "lucide-react";

// --- API FETCHERS ---
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- TYPES ---
export type BTeam = {
  _id?: string;
  leaderboard_id: number;
  dept_name: string;
  event_name: "singles" | "doubles";
  category: "boys" | "girls";
  group: string;
  wins?: number;
  losses?: number;
  matches?: number;
};

const RANK_COLORS = ["text-yellow-400 font-black", "text-zinc-300 font-black", "text-amber-600 font-black"];

// --- SUB-COMPONENT: LEADERBOARD ROW ---
function BTeamRow({ team, rank, onUpdate, onDelete }: { team: BTeam; rank: number; onUpdate: (t: BTeam) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...team });

  useEffect(() => { if (!editing) setDraft({ ...team }); }, [team, editing]);

  const f = (k: keyof BTeam, v: string | number) => setDraft(p => ({ ...p, [k]: v }));
  const save = () => { onUpdate(draft); setEditing(false); };

  if (!editing) return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/20">
      <td className={`p-3 text-center w-10 text-sm ${RANK_COLORS[rank] ?? "text-zinc-500"}`}>{rank + 1}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
            ID:{team.leaderboard_id}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-200 text-sm">{team.dept_name}</span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">
              {team.category} • {team.event_name}
            </span>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-zinc-400 text-xs font-mono">{team.group}</td>
      <td className="p-3 text-center text-zinc-100 text-xs font-bold">{team.wins ?? 0}</td>
      <td className="p-3 text-center text-zinc-400 text-xs">{team.losses ?? 0}</td>
      <td className="p-3 text-center text-accent font-mono text-sm">{team.matches ?? 0}</td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 hover:text-white transition-all text-zinc-400"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-700 hover:text-white transition-all text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-blue-500/20 bg-blue-500/5">
      <td className="p-2 text-center text-zinc-500 text-sm">{rank + 1}</td>
      <td className="p-2">
        <input className="input-field py-1 text-xs mb-1" value={draft.dept_name} onChange={e => f("dept_name", e.target.value)} placeholder="Dept Name" />
        <div className="flex gap-1">
          <select className="input-field py-1 text-[10px]" value={draft.event_name} onChange={e => f("event_name", e.target.value as any)}>
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
          </select>
          <select className="input-field py-1 text-[10px]" value={draft.category} onChange={e => f("category", e.target.value as any)}>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
        </div>
      </td>
      <td className="p-2"><input className="w-12 input-field p-1 text-center text-xs" value={draft.group} onChange={e => f("group", e.target.value.toUpperCase())} /></td>
      <td colSpan={3} className="p-2 text-right text-[10px] text-zinc-500 italic">Auto-calculated from matches</td>
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button onClick={save} className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

// --- MAIN PAGE ---
export default function BadmintonAdminPage() {
  // Backend API routes (proxied via next.config.ts rewrites)
  const MATCHES_API = "/api/badminton";           // GET/POST /api/badminton
  const LB_API = "/api/badminton-leaderboard";    // GET/POST /api/badminton-leaderboard

  // Men / Women toggle (maps to gender field on matches, category boys/girls on leaderboard)
  const [genderTab, setGenderTab] = useState<"men" | "women">("men");
  // boys/girls is the leaderboard category that maps to men/women respectively
  const lbCategory: "boys" | "girls" = genderTab === "men" ? "boys" : "girls";

  // SWR: fetch matches filtered by gender
  const { data: matchesResponse, mutate: mutateMatches } = useSWR(
    `${MATCHES_API}?gender=${genderTab}`,
    fetcher
  );

  // SWR: fetch all leaderboard entries (we filter client-side by category)
  const { data: allEntries, mutate: mutateEntries } = useSWR(LB_API, fetcher);

  // SWR: fetch standings (we filter client-side by category)
  const { data: standings, mutate: mutateStandings } = useSWR(`${LB_API}/standings`, fetcher);

  // The backend wraps matches in { success, data: [...] }, handle both cases
  const validMatches: any[] = Array.isArray(matchesResponse)
    ? matchesResponse
    : Array.isArray(matchesResponse?.data)
    ? matchesResponse.data
    : [];

  const validEntries: BTeam[] = Array.isArray(allEntries) ? allEntries : [];

  // Filter leaderboard entries by current category tab
  const filteredEntries = validEntries.filter(e => e.category === lbCategory);

  // Filter standings by category: standings object keyed by group, each group has entries
  const filteredStandings: Record<string, any[]> = {};
  if (standings && typeof standings === "object") {
    Object.entries(standings).forEach(([group, teams]) => {
      const filtered = (teams as any[]).filter((t: any) => {
        // If standings entry has category field use it, otherwise fall back to showing all
        return t.category ? t.category === lbCategory : true;
      });
      if (filtered.length > 0) filteredStandings[group] = filtered;
    });
  }

  const groups = Object.keys(filteredStandings).length > 0
    ? Object.keys(filteredStandings)
    : filteredEntries.length > 0
      ? [...new Set(filteredEntries.map(e => e.group))]
      : ["A", "B"];

  // State
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [newMatch, setNewMatch] = useState({
    match_id: Math.floor(Math.random() * 9000) + 1000,
    team1_department: "",
    team2_department: "",
    match_stage: "group" as "group" | "semifinal" | "final",
    match_type: "singles" as "singles" | "doubles",
    match_date: new Date().toISOString().slice(0, 10),
    venue: "",
    gender: genderTab,
  });

  // Keep gender in match form in sync with tab
  useEffect(() => {
    setNewMatch(prev => ({ ...prev, gender: genderTab }));
  }, [genderTab]);

  const [newEntry, setNewEntry] = useState<Partial<BTeam>>({
    leaderboard_id: Math.floor(Math.random() * 10000),
    dept_name: "",
    event_name: "singles",
    category: lbCategory,
    group: "A"
  });

  // Keep new entry category in sync with tab
  useEffect(() => {
    setNewEntry(prev => ({ ...prev, category: lbCategory }));
  }, [lbCategory]);

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  // --- MATCH HANDLERS ---
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(MATCHES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMatch,
          match_date: new Date(newMatch.match_date).toISOString(),
        })
      });
      if (res.ok) {
        setIsCreatingMatch(false);
        setNewMatch({
          match_id: Math.floor(Math.random() * 9000) + 1000,
          team1_department: "",
          team2_department: "",
          match_stage: "group",
          match_type: "singles",
          match_date: new Date().toISOString().slice(0, 10),
          venue: "",
          gender: genderTab,
        });
        mutateMatches();
        showMsg("✅ Match created!");
      } else {
        const d = await res.json();
        showMsg(`❌ ${d.message || "Match creation failed"}`);
      }
    } catch { showMsg("❌ Match creation failed"); }
  };

  const handleDeleteMatch = async (id: string | number) => {
    if (!confirm("Delete this match?")) return;
    const res = await fetch(`${MATCHES_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      mutateMatches();
      showMsg("🗑 Match deleted");
    }
  };

  // --- LEADERBOARD HANDLERS ---
  const handleAddEntry = async () => {
    if (!newEntry.dept_name) return;
    const res = await fetch(LB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry)
    });
    if (res.ok) {
      showMsg("✅ Entry added!");
      setAddMode(false);
      setNewEntry({
        leaderboard_id: Math.floor(Math.random() * 10000),
        dept_name: "",
        event_name: "singles",
        category: lbCategory,
        group: "A"
      });
      mutateEntries();
      mutateStandings();
    } else {
      const d = await res.json();
      showMsg(`❌ ${d.message || "Failed"}`);
    }
  };

  const handleUpdateEntry = async (t: BTeam) => {
    const res = await fetch(`${LB_API}/${t.leaderboard_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    });
    if (res.ok) {
      showMsg("✅ Updated!");
      mutateEntries();
      mutateStandings();
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`${LB_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("🗑 Entry removed");
      mutateEntries();
      mutateStandings();
    }
  };

  return (
    <div className="space-y-12 pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl border border-blue-500/20 shadow-neon">🏸</div>
        <div>
          <h1 className="text-3xl font-sports tracking-wider glow-text-blue uppercase font-black text-white">Badminton Admin</h1>
          <p className="text-zinc-500 text-sm">Matches and Department Standings</p>
        </div>
      </div>

      {/* MEN / WOMEN TOGGLE */}
      <div className="flex gap-2 mb-2">
        {(["men", "women"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setGenderTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              genderTab === tab
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {tab === "men" ? "👦 Men (Boys)" : "👧 Women (Girls)"}
          </button>
        ))}
      </div>

      {/* MATCHES SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
           <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-sports text-white">Matches — {genderTab === "men" ? "Men" : "Women"}</h2></div>
           <button onClick={() => setIsCreatingMatch(!isCreatingMatch)} className="btn-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
             {isCreatingMatch ? "Cancel" : <><Plus className="w-4 h-4" /> New Match</>}
           </button>
        </div>
        {isCreatingMatch && (
          <form onSubmit={handleCreateMatch} className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div>
                 <label className="label-sm">Match ID</label>
                 <input required type="number" value={newMatch.match_id} onChange={e => setNewMatch({...newMatch, match_id: +e.target.value})} className="input-field" />
               </div>
               <div>
                 <label className="label-sm">Team 1 (Dept)</label>
                 <select required value={newMatch.team1_department} onChange={e => setNewMatch({...newMatch, team1_department: e.target.value})} className="input-field">
                   <option value="">— Select Team 1 —</option>
                   {validEntries.filter(t => t.category === lbCategory).map(t => <option key={t.leaderboard_id} value={t.dept_name}>{t.dept_name}</option>)}
                 </select>
               </div>
               <div>
                 <label className="label-sm">Team 2 (Dept)</label>
                 <select required value={newMatch.team2_department} onChange={e => setNewMatch({...newMatch, team2_department: e.target.value})} className="input-field">
                   <option value="">— Select Team 2 —</option>
                   {validEntries.filter(t => t.category === lbCategory && t.dept_name !== newMatch.team1_department).map(t => <option key={t.leaderboard_id} value={t.dept_name}>{t.dept_name}</option>)}
                 </select>
               </div>
               <div>
                 <label className="label-sm">Stage</label>
                 <select value={newMatch.match_stage} onChange={e => setNewMatch({...newMatch, match_stage: e.target.value as any})} className="input-field">
                   <option value="group">Group</option>
                   <option value="semifinal">Semifinal</option>
                   <option value="final">Final</option>
                 </select>
               </div>
               <div>
                 <label className="label-sm">Type</label>
                 <select value={newMatch.match_type} onChange={e => setNewMatch({...newMatch, match_type: e.target.value as any})} className="input-field">
                   <option value="singles">Singles</option>
                   <option value="doubles">Doubles</option>
                 </select>
               </div>
               <div>
                 <label className="label-sm">Date</label>
                 <input required type="date" value={newMatch.match_date} onChange={e => setNewMatch({...newMatch, match_date: e.target.value})} className="input-field" />
               </div>
               <div className="md:col-span-2 lg:col-span-3">
                 <label className="label-sm">Venue</label>
                 <input required placeholder="e.g. Indoor Badminton Court" value={newMatch.venue} onChange={e => setNewMatch({...newMatch, venue: e.target.value})} className="input-field" />
               </div>
             </div>
             <div className="flex items-center gap-3 text-xs text-zinc-500">
               <span className="px-2 py-1 rounded-lg bg-zinc-800 font-black text-blue-400 uppercase">{genderTab}</span>
               <span>Gender is automatically set to the active tab</span>
             </div>
             <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all">INITIALIZE MATCH</button>
          </form>
        )}
        {saveMsg && <div className={`p-3 text-center text-xs font-bold border-b border-zinc-800 ${saveMsg.includes('✅') ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{saveMsg}</div>}
        <div className="divide-y divide-zinc-800/50">
           {validMatches.length === 0 ? <div className="p-10 text-center text-zinc-500 italic">No {genderTab} matches scheduled.</div> : (
              validMatches.map(m => (
                <div key={m.match_id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/30 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black bg-zinc-800 px-2 py-0.5 rounded text-blue-500 tracking-tighter">#{m.match_id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500 uppercase`}>{m.match_status}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase">{m.match_type} • {m.match_stage}</span>
                    </div>
                    <h3 className="font-sports text-xl uppercase tracking-tighter text-white">{m.team1_department} <span className="text-zinc-600 font-normal lowercase italic px-1">vs</span> {m.team2_department}</h3>
                    {m.venue && <p className="text-[11px] text-zinc-500 mt-1">📍 {m.venue}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteMatch(m.match_id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                    <Link href={`/admin/badminton/${m.match_id}`} className="px-6 py-2 bg-zinc-800 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg">Manage Match</Link>
                  </div>
                </div>
              ))
           )}
        </div>
      </section>

      {/* LEADERBOARD SECTION */}
      <section className="glass rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
           <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-sports text-white">Leaderboard — {genderTab === "men" ? "Boys" : "Girls"}</h2></div>
           <button onClick={() => setAddMode(!addMode)} className="btn-blue px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
             {addMode ? "Cancel" : <><Plus className="w-4 h-4" /> Add Dept</>}
           </button>
        </div>
        {addMode && (
          <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 space-y-4">
             <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
               <div><label className="label-sm">ID</label><input type="number" value={newEntry.leaderboard_id} onChange={e => setNewEntry(p => ({...p, leaderboard_id: +e.target.value}))} className="input-field py-2" /></div>
               <div><label className="label-sm">Dept</label><input placeholder="CS" value={newEntry.dept_name} onChange={e => setNewEntry(p => ({...p, dept_name: e.target.value}))} className="input-field py-2" /></div>
               <div><label className="label-sm">Event</label>
                 <select value={newEntry.event_name} onChange={e => setNewEntry(p => ({...p, event_name: e.target.value as any}))} className="input-field py-2">
                   <option value="singles">Singles</option><option value="doubles">Doubles</option>
                 </select>
               </div>
               <div><label className="label-sm">Category</label>
                 <select value={newEntry.category} onChange={e => setNewEntry(p => ({...p, category: e.target.value as any}))} className="input-field py-2">
                   <option value="boys">Boys (Men)</option><option value="girls">Girls (Women)</option>
                 </select>
               </div>
               <div><label className="label-sm">Group</label><input value={newEntry.group} onChange={e => setNewEntry(p => ({...p, group: e.target.value.toUpperCase()}))} className="input-field py-2" /></div>
             </div>
             <button onClick={handleAddEntry} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg">REGISTER DEPARTMENT</button>
          </div>
        )}
        <div className="divide-y divide-zinc-800">
          {groups.map(gp => {
            // Use filtered standings if available, else fall back to filtered entries grouped manually
            const gpTeams: any[] = filteredStandings[gp]
              ?? filteredEntries.filter(e => e.group === gp);
            return (
              <div key={gp} className="p-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Group {gp} Standings</h3>
                <div className="overflow-x-auto rounded-2xl border border-zinc-800/50 bg-black/30">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase font-black tracking-tighter">
                        <th className="p-3 w-10">POS</th><th className="p-3 text-left">DEPARTMENT</th><th className="p-3">GP</th><th className="p-3">WINS</th><th className="p-3">LOSS</th><th className="p-3 text-accent">MP</th><th className="p-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpTeams.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-zinc-600 italic">No rankings for this group yet.</td></tr> :
                        gpTeams.map((t: any, i: number) => <BTeamRow key={t.dept_name ?? t._id} team={{ ...t, leaderboard_id: t.leaderboard_id || 0 }} rank={i} onUpdate={handleUpdateEntry} onDelete={() => handleDeleteEntry(t.leaderboard_id)} />)
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style jsx global>{`
        .glass { background: rgba(8, 8, 8, 0.8); backdrop-filter: blur(16px); }
        .glow-text-blue { text-shadow: 0 0 25px rgba(59, 130, 246, 0.3); }
        .input-field { width: 100%; background: #121212; border: 1px solid #222; border-radius: 10px; padding: 10px; font-size: 13px; color: white; }
        .input-field:focus { border-color: #3b82f6; outline: none; }
        .label-sm { display: block; font-size: 9px; font-weight: 900; color: #555; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.1em; }
        .btn-blue { background: #1d4ed8; color: white; transition: all 0.2s; }
        .btn-blue:hover { background: #2563eb; box-shadow: 0 0 15px rgba(59,130,246,0.4); }
      `}</style>
    </div>
  );
}