"use client";

import React, { useState } from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const genderMap: any = { m: "men", f: "women" };

  if (url.includes("/api/matches")) {
    const gender = genderMap[url.includes("gender=f") ? "f" : "m"];

    const res = await fetch(`http://localhost:5000/api/carrom?gender=${gender}`);
    if (!res.ok) throw new Error("Failed to fetch matches");

    const json = await res.json();

    const data = Array.isArray(json) ? json : (json.data ?? []);

    return data.map((m: any) => ({
      _id: m._id,
      match_id: m.event_id,
      status:
        m.event_status === "scheduled"
          ? "UPCOMING"
          : m.event_status === "ongoing"
          ? "LIVE"
          : "COMPLETED",
      stage: "Match",
      teams: {
        player_a: { name: m.department_1, score: 0 },
        player_b: { name: m.department_2, score: 0 },
      },
      winners: m.winner,
      date: m.event_date,
    }));
  }

  if (url.includes("/api/leaderboard")) {
    const gender = url.includes("gender=f") ? "girls" : "boys";

    const res = await fetch(
      `http://localhost:5000/api/carrom-leaderboard/standings?category=${gender}`
    );
    if (!res.ok) throw new Error("Failed to fetch standings");

    const json = await res.json();

    const data = json.data || json || {};

    return Object.values(data).flat().map((t: any) => ({
      name: t.dept_name,
      shortName: t.dept_name,
      matches: t.matches,
      wins: t.wins,
      losses: t.losses,
      points: t.wins * 3,
      group: t.group,
      scoreDiff: 0,
    }));
  }

  return [];
};

export default function CarromDashboard() {
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard" | "fixtures">("results");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black pt-20">
      <div className="relative z-10 w-full max-w-7xl p-4 sm:p-8">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Carrom</h1>
          <div className="text-left md:text-right text-sm md:text-base text-gray-400 space-y-1 font-medium tracking-wide">
            <p><span className="text-gray-200">Event:</span> PRISM 2026 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Venue:</span> SVNIT Indoor Sports Complex</p>
          </div>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-full w-fit mx-auto sm:mx-0 shadow-sm">
            <button
              onClick={() => setGender("m")}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${
                gender === "m" ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setGender("f")}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${
                gender === "f" ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"
              }`}
            >
              Women
            </button>
          </div>

          <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-[#1A1A1A]">
            {(["results", "leaderboard", "fixtures"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-base tracking-widest font-bold text-center rounded-md transition-all duration-300 hover:scale-[1.02] uppercase ${
                  activeTab === tab
                    ? "bg-[#111] text-[#FFBF00] shadow-[inset_0_-2px_0_0_#FFBF00]"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === "results" && <Results gender={gender} />}
          {activeTab === "leaderboard" && <Leaderboard gender={gender} />}
          {activeTab === "fixtures" && <Fixtures gender={gender} />}
        </div>

      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function Results({ gender }: { gender: "m" | "f" }) {
  const { data: matches, error, isLoading } = useSWR(
    `/api/matches?sport=carrom&gender=${gender}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (error) return <div className="text-red-400 p-8 text-center font-mono">Failed to load results.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center uppercase tracking-widest">Loading Results...</div>;

  const completed = Array.isArray(matches) ? matches.filter((m: any) => m.status === "COMPLETED") : [];

  if (completed.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[#1A1A1A] rounded-xl text-gray-600 font-bold uppercase tracking-widest text-sm">
        No completed matches yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white font-black text-2xl tracking-widest uppercase pl-1 mb-6">Match Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completed.map((match: any, index: number) => {
          const teamA = match.teams?.player_a?.name || "Player A";
          const teamB = match.teams?.player_b?.name || "Player B";
          const date = match.date ? new Date(match.date).toLocaleDateString() : "TBD";

          return (
            <div
              key={match.match_id || match._id || index}
              className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-xl group hover:border-[#FFBF00]/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-4 border-b border-[#1A1A1A] pb-3">
                <span className="text-xs font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">
                  {match.stage || "Match"}
                </span>
                <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Completed</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className={`font-black text-lg tracking-widest uppercase ${match.winners === teamA ? "text-[#FFBF00]" : "text-white"}`}>
                    {teamA}
                  </span>
                  {match.winners === teamA && <span className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest">WINNER</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-black text-lg tracking-widest uppercase ${match.winners === teamB ? "text-[#FFBF00]" : "text-white"}`}>
                    {teamB}
                  </span>
                  {match.winners === teamB && <span className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest">WINNER</span>}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A1A1A]">
                <p className="text-xs text-gray-500 font-mono tracking-widest">{date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Leaderboard({ gender }: { gender: "m" | "f" }) {
  const { data: teams, error, isLoading } = useSWR(
    `/api/leaderboard?sport=carrom&gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load standings.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center uppercase tracking-widest">Loading Standings...</div>;

  const validTeams = Array.isArray(teams) ? teams : [];

  if (validTeams.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[#1A1A1A] rounded-xl text-gray-600 font-bold uppercase tracking-widest text-sm">
        No standings available yet.
      </div>
    );
  }

  const groups = validTeams.reduce((acc: any, team: any) => {
    const group = team.group || "A";
    if (!acc[group]) acc[group] = [];
    acc[group].push(team);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-12">
      {groupKeys.map((groupName) => (
        <div key={groupName} className="bg-[#000000] p-6 rounded-xl border border-[#1A1A1A]">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">
            Group {groupName}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base whitespace-nowrap bg-transparent rounded-lg overflow-hidden">
              <thead>
                <tr className="text-gray-400 border-b border-[#333] uppercase text-sm md:text-base font-bold tracking-widest">
                  <th className="py-4 px-4">#</th>
                  <th className="py-4 px-4">Team</th>
                  <th className="py-4 px-3 text-center">P</th>
                  <th className="py-4 px-3 text-center">W</th>
                  <th className="py-4 px-3 text-center">L</th>
                  <th className="py-4 px-3 text-center text-[#FFBF00] font-black text-base md:text-lg">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {groups[groupName]
                  .sort((a: any, b: any) => b.points - a.points)
                  .map((team: any, index: number) => (
                    <tr key={team._id || index} className="hover:bg-[#0A0A0A] transition-colors">
                      <td className="py-5 px-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                      <td className={`py-5 px-4 font-black tracking-widest uppercase ${index === 0 ? "text-[#FFBF00]" : "text-white"}`}>
                        {team.shortName || team.name}
                      </td>
                      <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.matches || 0}</td>
                      <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.wins || 0}</td>
                      <td className="py-5 px-3 text-center text-gray-500">{team.losses || 0}</td>
                      <td className="py-5 px-3 text-center font-black text-xl text-white">{team.points || 0}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Fixtures({ gender }: { gender: "m" | "f" }) {
  const { data: matches, error, isLoading } = useSWR(
    `/api/matches?sport=carrom&gender=${gender}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load fixtures.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center uppercase tracking-widest">Loading Fixtures...</div>;

  const upcoming = Array.isArray(matches)
    ? matches.filter((m: any) => m.status === "UPCOMING" || m.status === "LIVE")
    : [];

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[#1A1A1A] rounded-xl text-gray-600 font-bold uppercase tracking-widest text-sm">
        No upcoming fixtures.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white font-black text-2xl tracking-widest uppercase pl-1 mb-6">Upcoming Fixtures</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcoming.map((match: any, index: number) => {
          const teamA = match.teams?.player_a?.name || "Player A";
          const teamB = match.teams?.player_b?.name || "Player B";
          const date = match.date ? new Date(match.date).toLocaleDateString() : "TBD";

          return (
            <div
              key={match.match_id || match._id || index}
              className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-r-xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">
                  {match.stage || "Match"}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{match.match_id || `#${index + 1}`}</span>
                  {match.status === "LIVE" && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400 animate-pulse">● Live</span>
                  )}
                </div>
              </div>
              <h4 className="text-2xl font-black text-white mb-2 group-hover:text-[#FFBF00] transition-colors">
                {teamA} <span className="text-gray-600 font-bold text-sm mx-2">VS</span> {teamB}
              </h4>
              <p className="text-sm text-gray-400 font-medium tracking-wide">{date}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}