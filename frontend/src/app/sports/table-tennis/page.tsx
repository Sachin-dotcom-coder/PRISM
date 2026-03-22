"use client";

import React, { useState } from "react";

export default function TableTennisDashboard() {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard" | "fixtures">("results");
  const [matchType, setMatchType] = useState<"singles" | "doubles">("singles");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      <div className="w-full max-w-7xl p-4 sm:p-8">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-5xl md:text-7xl tracking-tighter uppercase">Table Tennis</h1>
          <div className="text-left md:text-right text-sm md:text-base text-gray-400 space-y-1 font-medium tracking-wide">
            <p><span className="text-gray-200">Event:</span> PRISM 2026 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Venue:</span> SVNIT Indoor Hall</p>
          </div>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-full w-fit shadow-sm">
              <button onClick={() => setGender("men")} className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${gender === "men" ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"}`}>Men</button>
              <button onClick={() => setGender("women")} className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${gender === "women" ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"}`}>Women</button>
            </div>
            <div className="flex border border-[#1A1A1A] rounded-md overflow-hidden">
              {(["singles", "doubles"] as const).map((type) => (
                <button key={type} onClick={() => setMatchType(type)} className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${matchType === type ? "bg-[#1A1A1A] text-[#FFBF00]" : "bg-transparent text-gray-600 hover:text-white"}`}>{type}</button>
              ))}
            </div>
          </div>

          <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-[#1A1A1A]">
            {["results", "leaderboard", "fixtures"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 text-base tracking-widest font-bold text-center rounded-md transition-all duration-300 hover:scale-[1.02] uppercase ${activeTab === tab ? "bg-[#111] text-[#FFBF00] shadow-[inset_0_-2px_0_0_#FFBF00]" : "text-gray-500 hover:text-white"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === "results" && <Results matchType={matchType} />}
          {activeTab === "leaderboard" && <Leaderboard />}
          {activeTab === "fixtures" && <Fixtures />}
        </div>
      </div>
    </div>
  );
}

function Results({ matchType }: { matchType: "singles" | "doubles" }) {
  const matches = [
    {
      id: 1, stage: "Quarter Final", matchType: "singles",
      team1: "ECE", team2: "CSE", score1: 3, score2: 1, winner: "ECE",
      games: [{ g: 1, s1: 11, s2: 8 }, { g: 2, s1: 9, s2: 11 }, { g: 3, s1: 11, s2: 7 }, { g: 4, s1: 11, s2: 9 }],
    },
    {
      id: 2, stage: "Quarter Final", matchType: "doubles",
      team1: "MECH", team2: "AI+MBA", score1: 3, score2: 0, winner: "MECH",
      games: [{ g: 1, s1: 11, s2: 6 }, { g: 2, s1: 11, s2: 8 }, { g: 3, s1: 11, s2: 7 }],
    },
    {
      id: 3, stage: "Semifinal", matchType: "singles",
      team1: "ECE", team2: "CHEM", score1: 2, score2: 3, winner: "CHEM",
      games: [{ g: 1, s1: 11, s2: 9 }, { g: 2, s1: 8, s2: 11 }, { g: 3, s1: 11, s2: 8 }, { g: 4, s1: 8, s2: 11 }, { g: 5, s1: 7, s2: 11 }],
    },
    {
      id: 4, stage: "Final", matchType: "doubles",
      team1: "CHEM", team2: "EE", score1: 3, score2: 2, winner: "CHEM",
      games: [{ g: 1, s1: 11, s2: 9 }, { g: 2, s1: 8, s2: 11 }, { g: 3, s1: 11, s2: 7 }, { g: 4, s1: 9, s2: 11 }, { g: 5, s1: 11, s2: 8 }],
    },
  ];

  const filtered = matches.filter((m) => m.matchType === matchType);

  return (
    <div className="space-y-6">
      <h2 className="text-white font-black text-2xl tracking-widest uppercase pl-1 mb-6">Match Results</h2>
      {filtered.map((match) => (
        <div key={match.id} className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 hover:border-[#FFBF00]/20 transition-colors">
          <div className="flex justify-between items-center mb-4 border-b border-[#1A1A1A] pb-3">
            <div className="flex items-center gap-3">
              <span className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest">{match.stage}</span>
              <span className="text-gray-600 text-xs font-bold uppercase tracking-widest border border-[#333] px-2 py-0.5 rounded">{match.matchType}</span>
            </div>
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Best of {match.games.length % 2 === 0 ? match.games.length : match.games.length}</span>
          </div>

          <div className="flex items-center justify-between gap-4 mb-5">
            <div className={`flex flex-col items-start flex-1 ${match.winner === match.team1 ? "text-[#FFBF00]" : "text-white"}`}>
              <span className="font-black text-2xl md:text-3xl tracking-widest uppercase">{match.team1}</span>
              {match.winner === match.team1 && <span className="text-xs font-bold tracking-widest mt-1 text-[#FFBF00]">WINNER</span>}
            </div>
            <div className="flex items-center gap-3 md:gap-5">
              <span className={`text-4xl md:text-5xl font-black tracking-tighter ${match.winner === match.team1 ? "text-[#FFBF00]" : "text-white"}`}>{match.score1}</span>
              <span className="text-2xl font-black text-[#333]">—</span>
              <span className={`text-4xl md:text-5xl font-black tracking-tighter ${match.winner === match.team2 ? "text-[#FFBF00]" : "text-white"}`}>{match.score2}</span>
            </div>
            <div className={`flex flex-col items-end flex-1 ${match.winner === match.team2 ? "text-[#FFBF00]" : "text-white"}`}>
              <span className="font-black text-2xl md:text-3xl tracking-widest uppercase">{match.team2}</span>
              {match.winner === match.team2 && <span className="text-xs font-bold tracking-widest mt-1 text-[#FFBF00]">WINNER</span>}
            </div>
          </div>

          {/* Game-by-game */}
          <div className="pt-4 border-t border-[#1A1A1A]">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Game Scores</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-gray-600 border-b border-[#1A1A1A] uppercase text-xs font-bold tracking-widest">
                    <th className="py-2 px-3 text-left">Game</th>
                    <th className="py-2 px-3 text-center">{match.team1}</th>
                    <th className="py-2 px-3 text-center">{match.team2}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                  {match.games.map((g) => (
                    <tr key={g.g} className="hover:bg-[#0A0A0A] transition-colors">
                      <td className="py-2 px-3 text-gray-500 font-bold">Game {g.g}</td>
                      <td className={`py-2 px-3 text-center font-black ${g.s1 > g.s2 ? "text-[#FFBF00]" : "text-white"}`}>{g.s1}</td>
                      <td className={`py-2 px-3 text-center font-black ${g.s2 > g.s1 ? "text-[#FFBF00]" : "text-white"}`}>{g.s2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600 font-bold uppercase tracking-widest">No {matchType} results yet.</div>
      )}
    </div>
  );
}

function Leaderboard() {
  const groups = [
    {
      name: "Group A",
      teams: [
        { name: "ECE", p: 4, w: 4, l: 0, pts: 8 },
        { name: "CSE", p: 4, w: 3, l: 1, pts: 6 },
        { name: "MECH", p: 4, w: 1, l: 3, pts: 2 },
        { name: "AI+MBA", p: 4, w: 0, l: 4, pts: 0 },
      ],
    },
    {
      name: "Group B",
      teams: [
        { name: "CHEM", p: 4, w: 4, l: 0, pts: 8 },
        { name: "EE", p: 4, w: 2, l: 2, pts: 4 },
        { name: "CIVIL", p: 4, w: 2, l: 2, pts: 4 },
        { name: "SCI", p: 4, w: 0, l: 4, pts: 0 },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {groups.map((group, idx) => (
        <div key={idx} className="bg-[#000000] p-6 rounded-xl border border-[#1A1A1A]">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">{group.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base whitespace-nowrap">
              <thead>
                <tr className="text-gray-400 border-b border-[#333] uppercase text-sm font-bold tracking-widest">
                  <th className="py-4 px-4">#</th>
                  <th className="py-4 px-4">Team</th>
                  <th className="py-4 px-3 text-center">P</th>
                  <th className="py-4 px-3 text-center">W</th>
                  <th className="py-4 px-3 text-center">L</th>
                  <th className="py-4 px-3 text-center text-[#FFBF00] font-black text-base md:text-lg">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {group.teams.map((team, index) => (
                  <tr key={index} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-5 px-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                    <td className={`py-5 px-4 font-black tracking-widest uppercase ${index === 0 ? "text-[#FFBF00]" : "text-white"}`}>{team.name}</td>
                    <td className="py-5 px-3 text-center text-gray-400">{team.p}</td>
                    <td className="py-5 px-3 text-center text-gray-400">{team.w}</td>
                    <td className="py-5 px-3 text-center text-gray-500">{team.l}</td>
                    <td className="py-5 px-3 text-center font-black text-xl text-white">{team.pts}</td>
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

function Fixtures() {
  const fixtures = [
    { group: "A", match: "ECE vs CSE", type: "Singles", date: "Oct 12, 10:00 AM", id: 1 },
    { group: "A", match: "MECH vs AI+MBA", type: "Doubles", date: "Oct 12, 11:00 AM", id: 2 },
    { group: "A", match: "ECE vs MECH", type: "Singles", date: "Oct 13, 10:00 AM", id: 3 },
    { group: "A", match: "CSE vs AI+MBA", type: "Doubles", date: "Oct 13, 11:00 AM", id: 4 },
    { group: "A", match: "ECE vs AI+MBA", type: "Singles", date: "Oct 14, 10:00 AM", id: 5 },
    { group: "A", match: "CSE vs MECH", type: "Doubles", date: "Oct 14, 11:00 AM", id: 6 },
    { group: "B", match: "CHEM vs EE", type: "Singles", date: "Oct 12, 02:00 PM", id: 7 },
    { group: "B", match: "CIVIL vs SCI", type: "Doubles", date: "Oct 12, 03:00 PM", id: 8 },
    { group: "B", match: "CHEM vs CIVIL", type: "Singles", date: "Oct 13, 02:00 PM", id: 9 },
    { group: "B", match: "EE vs SCI", type: "Doubles", date: "Oct 13, 03:00 PM", id: 10 },
    { group: "B", match: "CHEM vs SCI", type: "Singles", date: "Oct 14, 02:00 PM", id: 11 },
    { group: "B", match: "EE vs CIVIL", type: "Doubles", date: "Oct 14, 03:00 PM", id: 12 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fixtures.map((fixture) => (
        <div key={fixture.id} className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-r-xl cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">Group {fixture.group}</span>
              <span className="text-xs font-bold text-gray-600 border border-[#222] px-2 py-1 rounded uppercase tracking-widest">{fixture.type}</span>
            </div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Match {fixture.id}</span>
          </div>
          <h4 className="text-2xl font-black text-white mb-2 tracking-wide group-hover:text-[#FFBF00] transition-colors">
            {fixture.match.split(" vs ")[0]} <span className="text-gray-600 font-bold text-sm mx-2">VS</span> {fixture.match.split(" vs ")[1]}
          </h4>
          <p className="text-sm text-gray-400 font-medium tracking-wide">{fixture.date}</p>
        </div>
      ))}
    </div>
  );
}