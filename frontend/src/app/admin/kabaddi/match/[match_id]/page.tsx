/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { ArrowLeft, Save, Activity, Trash2, Clock, Swords } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGender } from "@/app/components/Providers";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Raid = {
  raid_id: string;
  raider: string;
  result: "SUCCESSFUL" | "FAILED" | "EMPTY RAID" | "SUPER RAID";
  points_scored: number;
};

type Half = {
  half_number: number;
  team_a_score: number;
  team_b_score: number;
};

type MatchState = {
  match_id: string;
  status: string;
  format: string;
  current_half: number;
  teams: {
    team_a: { name: string; score: number };
    team_b: { name: string; score: number };
  };
  recent_raids: Raid[];
  halves: Half[];
};

export default function KabaddiMatchAdmin() {
  const { gender } = useGender();
  const { match_id } = useParams();
  const router = useRouter();

  const MATCH_API = `http://localhost:5000/api/kabaddi/${match_id}?gender=${gender}`;
  const UPDATE_API = `http://localhost:5000/api/kabaddi/${match_id}?gender=${gender}`;

  const { data: matchData, mutate } = useSWR(MATCH_API, fetcher);

  const [match, setMatch] = useState<MatchState | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  const [raidForm, setRaidForm] = useState({ raider: "", result: "SUCCESSFUL", points_scored: 1 });

  useEffect(() => {
    if (matchData && !matchData.error) {
      setMatch(matchData);
    }
  }, [matchData]);

  const showMsg = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const handleSave = async (updatedState: MatchState = match!) => {
    const res = await fetch(UPDATE_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedState)
    });
    if (res.ok) {
      showMsg("✅ Match Saved");
      mutate();
    } else {
      showMsg("❌ Save Failed");
    }
  };

  const updateScore = (team: "team_a" | "team_b", points: number) => {
    if (!match) return;
    const newMatch = { ...match };
    newMatch.teams[team].score += points;
    setMatch(newMatch);
  };

  const manualScore = (team: "team_a" | "team_b", val: number) => {
    if (!match) return;
    const newMatch = { ...match };
    newMatch.teams[team].score = val;
    setMatch(newMatch);
  };

  const addRaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    const newRaid: Raid = {
      raid_id: `r_${Math.floor(Math.random() * 10000)}`,
      raider: raidForm.raider,
      result: raidForm.result as Raid["result"],
      points_scored: Number(raidForm.points_scored)
    };
    const newMatch = { ...match, recent_raids: [newRaid, ...match.recent_raids] };
    setMatch(newMatch);
    setRaidForm({ raider: "", result: "SUCCESSFUL", points_scored: 1 });
  };

  const changeStatus = (newStatus: string) => {
    if (!match) return;
    setMatch({ ...match, status: newStatus });
  };

  const endHalf = (halfNum: number) => {
    if (!match) return;
    const halfRecord: Half = {
      half_number: halfNum,
      team_a_score: match.teams.team_a.score,
      team_b_score: match.teams.team_b.score
    };
    const newMatch = { ...match, halves: [...match.halves, halfRecord], current_half: halfNum + 1 };
    setMatch(newMatch);
  };

  if (!match) return <div className="p-10 text-center text-zinc-500">Loading Kabaddi match...</div>;

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between glass p-4 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <Link href="/admin/kabaddi" className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-sports glow-text">{match.teams.team_a.name} vs {match.teams.team_b.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${match.status === 'LIVE' ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>{match.status}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">ID: {match.match_id} • Format: {match.format} • Half: {match.current_half}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className={`text-sm font-bold ${saveMsg.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>{saveMsg}</span>}
          <button onClick={() => handleDeleteMatch(match_id as string, router)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
          <button onClick={() => handleSave(match)} className="btn-accent px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-neon"><Save className="w-4 h-4" /> SAVE STATE</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TEAM CONTROL PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
             <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/50">
               <Activity className="text-accent w-5 h-5" />
               <h2 className="text-lg font-sports tracking-wide">Live Scoring</h2>
             </div>

             <div className="grid grid-cols-2 gap-8">
               {/* TEAM A */}
               <div className="space-y-4">
                 <div className="text-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                   <p className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider truncate">{match.teams.team_a.name}</p>
                   <input type="number" className="text-6xl font-sports text-center bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-accent rounded-xl text-white pb-2" value={match.teams.team_a.score} onChange={e => manualScore("team_a", +e.target.value)} />
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   {[1, 2, 3].map(pt => (
                     <button key={pt} onClick={() => updateScore("team_a", pt)} className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-lg font-black transition-colors">+{pt}</button>
                   ))}
                   <button onClick={() => updateScore("team_a", -1)} className="col-span-3 py-2 bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-500 text-zinc-500 rounded-xl text-sm font-bold transition-all border border-zinc-800">-1 Point</button>
                 </div>
               </div>

               {/* TEAM B */}
               <div className="space-y-4">
                 <div className="text-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                   <p className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider truncate">{match.teams.team_b.name}</p>
                   <input type="number" className="text-6xl font-sports text-center bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-accent rounded-xl text-white pb-2" value={match.teams.team_b.score} onChange={e => manualScore("team_b", +e.target.value)} />
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   {[1, 2, 3].map(pt => (
                     <button key={pt} onClick={() => updateScore("team_b", pt)} className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-lg font-black transition-colors">+{pt}</button>
                   ))}
                   <button onClick={() => updateScore("team_b", -1)} className="col-span-3 py-2 bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-500 text-zinc-500 rounded-xl text-sm font-bold transition-all border border-zinc-800">-1 Point</button>
                 </div>
               </div>
             </div>
             
             <div className="flex justify-center pt-4">
                 <button onClick={() => { manualScore("team_a", 0); manualScore("team_b", 0); }} className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800 transition-all">Reset Scores</button>
             </div>
          </section>

          {/* RAID MANAGEMENT */}
          <section className="glass p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
             <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/50">
               <Swords className="text-accent w-5 h-5" />
               <h2 className="text-lg font-sports tracking-wide">Raid Log System</h2>
             </div>
             
             <form onSubmit={addRaid} className="flex flex-col md:flex-row gap-3">
               <input required placeholder="Raider Name" className="input-field flex-1" value={raidForm.raider} onChange={e => setRaidForm({...raidForm, raider: e.target.value})} />
               <select className="input-field md:w-48 font-bold" value={raidForm.result} onChange={e => setRaidForm({...raidForm, result: e.target.value})}>
                 <option value="SUCCESSFUL">SUCCESSFUL</option>
                 <option value="FAILED">FAILED</option>
                 <option value="EMPTY RAID">EMPTY RAID</option>
                 <option value="SUPER RAID">SUPER RAID</option>
               </select>
               <input type="number" min={0} className="input-field md:w-24 text-center" value={raidForm.points_scored} onChange={e => setRaidForm({...raidForm, points_scored: +e.target.value})} />
               <button type="submit" className="btn-accent px-6 py-2 rounded-xl font-bold">LOG RAID</button>
             </form>

             <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {match.recent_raids.map(raid => (
                 <div key={raid.raid_id} className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                   <div>
                     <p className="font-bold text-sm text-zinc-200">{raid.raider}</p>
                     <p className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${raid.result === 'SUCCESSFUL' || raid.result === 'SUPER RAID' ? 'text-green-500' : raid.result === 'FAILED' ? 'text-red-500' : 'text-zinc-500'}`}>{raid.result}</p>
                   </div>
                   <div className="text-right">
                     <span className="text-xl font-black text-accent">+{raid.points_scored}</span>
                     <p className="text-[10px] text-zinc-600">PTS</p>
                   </div>
                 </div>
               ))}
               {match.recent_raids.length === 0 && <p className="text-center text-zinc-600 text-sm py-4 italic">No raids logged yet.</p>}
             </div>
          </section>
        </div>

        {/* SIDEBAR (Half control, Status) */}
        <div className="space-y-6">
          <section className="glass p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/50">
               <Clock className="text-accent w-5 h-5" />
               <h2 className="text-lg font-sports tracking-wide">Match Phase</h2>
             </div>
             <div className="space-y-3">
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => changeStatus("LIVE")} className={`py-3 rounded-xl font-bold text-sm transition-all border ${match.status === 'LIVE' ? 'bg-accent/20 border-accent/50 text-accent glow-text' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>SET LIVE</button>
                 <button onClick={() => changeStatus("COMPLETED")} className={`py-3 rounded-xl font-bold text-sm transition-all border ${match.status === 'COMPLETED' ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>COMPLETED</button>
               </div>
               
               <div className="pt-4 space-y-2">
                 <p className="label-sm mb-2">Half Control</p>
                 <button onClick={() => endHalf(1)} disabled={match.current_half > 1} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-zinc-300 transition-colors">END 1ST HALF</button>
                 <button onClick={() => endHalf(2)} disabled={match.current_half > 2} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-zinc-300 transition-colors">END 2ND HALF</button>
               </div>

               {match.halves.length > 0 && (
                 <div className="pt-4 space-y-2">
                   <p className="label-sm mb-2">Half Logs</p>
                   {match.halves.map(h => (
                     <div key={h.half_number} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-zinc-800/50 text-xs text-zinc-400">
                       <span>Half {h.half_number}</span>
                       <span className="font-bold text-white">{h.team_a_score} - {h.team_b_score}</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .glass { background: rgba(10, 10, 10, 0.7); backdrop-filter: blur(12px); }
        .glow-text { text-shadow: 0 0 20px rgba(var(--accent-rgb), 0.3); }
        .shadow-neon { box-shadow: 0 0 15px rgba(255, 191, 0, 0.3); }
        .input-field { width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 12px; font-size: 14px; color: white; transition: all 0.3s; }
        .input-field:focus { border-color: #FFBF00; outline: none; box-shadow: 0 0 0 1px #FFBF00; }
        .label-sm { display: block; font-size: 10px; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 0.1em; }
        .btn-accent { background: #FFBF00; color: black; transition: all 0.3s; }
        .btn-accent:hover { background: #E6AC00; box-shadow: 0 0 20px rgba(255, 191, 0, 0.4); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}

// Helper to delete match from manage view
async function handleDeleteMatch(matchId: string, router: any) {
  if (!confirm("Are you sure you want to delete this match completely?")) return;
  const gender = new URLSearchParams(window.location.search).get('gender') || 'm';
  const res = await fetch(`http://localhost:5000/api/kabaddi/${matchId}?gender=${gender}`, { method: "DELETE" });
  if (res.ok) router.push("/admin/kabaddi");
  else alert("Delete failed");
}
