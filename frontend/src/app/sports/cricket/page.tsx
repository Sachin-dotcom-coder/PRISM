"use client";

import React, { useState } from "react";

export default function CricketDashboard() {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [activeTab, setActiveTab] = useState<"live" | "leaderboard" | "fixtures">("live");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      {/* Main Container */}
      <div className="w-full max-w-7xl p-4 sm:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Cricket</h1>
          <div className="text-left md:text-right text-sm md:text-base text-gray-400 space-y-1 font-medium tracking-wide">
            <p><span className="text-gray-200">Match ID:</span> PRISM-042 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Date:</span> Oct 12, 2026 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Time:</span> 10:00 AM</p>
            <p><span className="text-gray-200">Venue:</span> SVNIT Main Ground</p>
          </div>
        </header>

        {/* Toggles (Navigation) */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-full w-fit mx-auto sm:mx-0 shadow-sm">
            <button
              onClick={() => setGender("men")}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${
                gender === "men" ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setGender("women")}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] ${
                gender === "women" ? "bg-[#FFBF00] text-[#000000]" : "text-[#FFFFFF]"
              }`}
            >
              Women
            </button>
          </div>

          <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-[#1A1A1A]">
            {["live", "leaderboard", "fixtures"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 text-base tracking-widest font-bold text-center rounded-md transition-all duration-300 hover:scale-[1.02] uppercase ${
                  activeTab === tab
                    ? "bg-[#111] text-[#FFBF00] shadow-[inset_0_-2px_0_0_#FFBF00]"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab === "live" ? "Live Score" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Rendering */}
        <div className="animate-in fade-in duration-500">
          {activeTab === "live" && <LiveScore />}
          {activeTab === "leaderboard" && <Leaderboard />}
          {activeTab === "fixtures" && <Fixtures />}
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LiveScore() {
  const [matchState, setMatchState] = useState<"1st" | "2nd">("2nd");

  return (
    <div className="space-y-8">
      
      {/* Innings Control Toggle */}
      <div className="flex justify-center mb-2">
        <div className="flex border border-[#1A1A1A] rounded-md overflow-hidden">
          {(["1st", "2nd"] as const).map((state) => (
            <button
              key={state}
              onClick={() => setMatchState(state)}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                matchState === state ? "bg-[#1A1A1A] text-[#FFBF00]" : "bg-transparent text-gray-600 hover:text-white"
              }`}
            >
              {state === "1st" ? "1st Innings" : "2nd Innings"}
            </button>
          ))}
        </div>
      </div>

      {/* Target Box (2nd Innings) */}
      {matchState === "2nd" && (
        <div className="bg-[#000000] border border-[#FFBF00]/30 rounded-xl p-4 sm:p-5 flex justify-center items-center gap-6 sm:gap-10 shadow-[0_0_15px_rgba(255,191,0,0.05)] mx-auto w-fit">
          <div className="flex flex-col justify-center items-end leading-none text-gray-400 font-bold text-xs tracking-widest uppercase">
            <span>Runs</span>
            <span className="mt-1 text-[#FFBF00]">Needed</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">
            4
          </div>
          <div className="w-px h-10 sm:h-12 bg-[#1A1A1A] mx-2"></div>
          <div className="flex flex-col justify-center items-end leading-none text-gray-400 font-bold text-xs tracking-widest uppercase">
            <span>Balls</span>
            <span className="mt-1 text-[#FFBF00]">Left</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">
            8
          </div>
        </div>
      )}

      {/* Main Scorecard Status Box */}
      <div className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFBF00] opacity-[0.02] blur-[100px] pointer-events-none rounded-full"></div>

        <div className="flex justify-between items-center mb-5 border-b border-[#1A1A1A] pb-3">
          <span className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest">
            {matchState === "1st" ? "1st Innings" : "2nd Innings"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Live</span>
            <div className="w-2.5 h-2.5 bg-[#FFBF00] rounded-full animate-pulse shadow-[0_0_10px_#FFBF00]"></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0">
          <div className="flex flex-col items-center md:items-start w-full md:w-1/2 z-10">
            <h2 className="text-lg md:text-xl font-black text-white tracking-widest uppercase mb-1">
              ECE <span className="text-xs font-bold text-gray-500 tracking-widest ml-2">Batting</span>
            </h2>
            <div className="flex items-baseline gap-1">
              <h3 className="text-6xl md:text-7xl font-black text-[#FFBF00] tracking-tighter leading-none">145</h3>
              <span className="text-3xl md:text-4xl font-black text-white leading-none">/9</span>
            </div>
            <p className="text-sm text-gray-400 mt-3 font-medium tracking-wide">
              Overs: <span className="text-white font-bold">19.3</span> 
              <span className="mx-3 text-[#333]">|</span> 
              CRR: <span className="text-white font-bold">7.43</span> 
              {matchState === "2nd" && (
                <>
                  <span className="mx-3 text-[#333]">|</span> 
                  REQ: <span className="text-[#FFBF00] font-bold">12.00</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end w-full md:w-1/2 md:text-right border-t border-[#1A1A1A] md:border-t-0 pt-6 md:pt-0 z-10">
            <h2 className="text-lg md:text-xl font-black text-white tracking-widest uppercase mb-4">
              CSE <span className="text-xs font-bold text-gray-500 tracking-widest ml-2">Bowling</span>
            </h2>
            <div className="flex flex-col items-center md:items-end w-full">
              <p className="text-3xl font-black text-white mb-2 tracking-wide">Bowler Y</p>
              <div className="flex gap-3 text-[#FFBF00] font-mono text-xl font-bold mb-5">
                <span title="Overs">3.3</span>
                <span className="text-[#333]">-</span>
                <span title="Runs">28</span>
                <span className="text-[#333]">-</span>
                <span title="Wickets" className="text-white">2</span>
              </div>

              {/* Small Over Tracker */}
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center border border-[#FFBF00]/50 bg-transparent text-white font-bold text-xs">1</div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center border border-red-500 bg-transparent text-red-500 font-bold text-xs">W</div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center border border-[#FFBF00]/50 bg-transparent text-white font-bold text-xs">4</div>
                <div className="w-7 h-7 rounded-full border border-[#1A1A1A] bg-transparent"></div>
                <div className="w-7 h-7 rounded-full border border-[#1A1A1A] bg-transparent"></div>
                <div className="w-7 h-7 rounded-full border border-[#1A1A1A] bg-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center border-t border-[#1A1A1A] pt-4 mt-5 z-10 relative">
          <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Toss <span className="mx-2 text-[#333]">|</span> <span className="text-gray-300">CSE elected to field first</span></p>
        </div>
      </div>

      {/* Batters Table with Larger Fonts */}
      <div className="mt-8">
        <h3 className="text-[#FFBF00] font-black text-2xl mb-4 tracking-widest uppercase pl-1">ECE Batting</h3>
        <div className="overflow-x-auto rounded-xl border border-[#1A1A1A] p-3">
          <table className="w-full text-left text-base md:text-lg whitespace-nowrap">
            <thead>
              <tr className="text-gray-500 border-b border-[#1A1A1A] uppercase tracking-wider text-sm font-bold">
                <th className="py-4 px-4">Batter</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-3 text-right">R</th>
                <th className="py-4 px-3 text-right">B</th>
                <th className="py-4 px-3 text-right">4s</th>
                <th className="py-4 px-3 text-right">6s</th>
                <th className="py-4 px-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              <tr className="hover:bg-[#0A0A0A] transition-colors">
                <td className="py-4 px-4 font-medium text-white">Batter A</td>
                <td className="py-4 px-4 text-gray-500 text-sm md:text-base">b. Bowler A</td>
                <td className="py-4 px-3 text-right font-black">14</td>
                <td className="py-4 px-3 text-right text-gray-500">10</td>
                <td className="py-4 px-3 text-right text-gray-500">2</td>
                <td className="py-4 px-3 text-right text-gray-500">0</td>
                <td className="py-4 px-4 text-right text-gray-500">140.00</td>
              </tr>
              <tr className="bg-[#050505]">
                <td className="py-4 px-4 font-bold text-[#FFBF00]">Batter K <span className="ml-2 text-xl drop-shadow-[0_0_8px_#FFBF00]" title="Striker">🏏</span></td>
                <td className="py-4 px-4 text-[#FFBF00] text-sm md:text-base font-bold uppercase tracking-widest">Not Out</td>
                <td className="py-4 px-3 text-right font-black text-white text-xl md:text-2xl">12</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">6</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">2</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">0</td>
                <td className="py-4 px-4 text-right text-gray-400 font-medium">200.00</td>
              </tr>
              <tr className="bg-[#050505]">
                <td className="py-4 px-4 font-bold text-white">Batter L</td>
                <td className="py-4 px-4 text-white text-sm md:text-base font-bold uppercase tracking-widest">Not Out</td>
                <td className="py-4 px-3 text-right font-black text-white text-xl md:text-2xl">0</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">0</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">0</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">0</td>
                <td className="py-4 px-4 text-right text-gray-400 font-medium">0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowlers Table with Larger Fonts */}
      <div className="mt-10">
        <h3 className="text-gray-300 font-black text-2xl mb-4 tracking-widest uppercase pl-1">CSE Bowling</h3>
        <div className="overflow-x-auto rounded-xl border border-[#1A1A1A] p-3">
          <table className="w-full text-left text-base md:text-lg whitespace-nowrap">
            <thead>
              <tr className="text-gray-500 border-b border-[#1A1A1A] uppercase tracking-wider text-sm font-bold">
                <th className="py-4 px-4">Bowler</th>
                <th className="py-4 px-3 text-right">O</th>
                <th className="py-4 px-3 text-right">R</th>
                <th className="py-4 px-3 text-right text-[#FFBF00]">W</th>
                <th className="py-4 px-4 text-right">ECON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              <tr className="hover:bg-[#0A0A0A] transition-colors">
                <td className="py-4 px-4 font-medium text-white">Bowler A</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">4.0</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">32</td>
                <td className="py-4 px-3 text-right font-black text-[#FFBF00] text-xl md:text-2xl">3</td>
                <td className="py-4 px-4 text-right text-gray-500">8.00</td>
              </tr>
              <tr className="bg-[#050505]">
                <td className="py-4 px-4 font-bold text-[#FFBF00]">Bowler Y <span className="ml-2 text-xl drop-shadow-[0_0_8px_#FFBF00]" title="Bowling">🥎</span></td>
                <td className="py-4 px-3 text-right font-black text-white">3.3</td>
                <td className="py-4 px-3 text-right font-black text-white">28</td>
                <td className="py-4 px-3 text-right font-black text-[#FFBF00] text-xl md:text-2xl">2</td>
                <td className="py-4 px-4 text-right text-gray-400">8.00</td>
              </tr>
              <tr className="hover:bg-[#0A0A0A] transition-colors">
                <td className="py-4 px-4 font-medium text-white">Bowler B</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">4.0</td>
                <td className="py-4 px-3 text-right text-gray-400 font-medium">45</td>
                <td className="py-4 px-3 text-right font-black text-[#FFBF00] text-xl md:text-2xl">1</td>
                <td className="py-4 px-4 text-right text-gray-500">11.25</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function Leaderboard() {
  const groups = [
    {
      name: "Group A",
      teams: [
        { name: "ECE", p: 3, w: 3, l: 0, pts: 6, nrr: "+1.45" },
        { name: "CSE", p: 3, w: 2, l: 1, pts: 4, nrr: "+0.89" },
        { name: "MECH", p: 3, w: 1, l: 2, pts: 2, nrr: "-0.45" },
        { name: "AI+MBA", p: 3, w: 0, l: 3, pts: 0, nrr: "-1.89" },
      ],
    },
    {
      name: "Group B",
      teams: [
        { name: "CHEM", p: 3, w: 2, l: 1, pts: 4, nrr: "+1.10" },
        { name: "EE", p: 3, w: 2, l: 1, pts: 4, nrr: "+0.50" },
        { name: "CIVIL", p: 3, w: 1, l: 2, pts: 2, nrr: "-0.20" },
        { name: "SCI", p: 3, w: 1, l: 2, pts: 2, nrr: "-1.40" },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {groups.map((group, idx) => (
        <div key={idx} className="bg-[#000000] p-6 rounded-xl border border-[#1A1A1A]">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">{group.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base whitespace-nowrap bg-transparent rounded-lg overflow-hidden">
              <thead>
                <tr className="text-gray-400 border-b border-[#333] uppercase text-sm md:text-base font-bold tracking-widest">
                  <th className="py-4 px-4">Sr. No</th>
                  <th className="py-4 px-4">Team</th>
                  <th className="py-4 px-3 text-center">P</th>
                  <th className="py-4 px-3 text-center">W</th>
                  <th className="py-4 px-3 text-center">L</th>
                  <th className="py-4 px-3 text-center text-[#FFBF00] font-black text-base md:text-lg">Pts</th>
                  <th className="py-4 px-4 text-right">NRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {group.teams.map((team, index) => (
                  <tr key={index} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-5 px-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                    <td className={`py-5 px-4 font-black tracking-widest uppercase ${index === 0 ? "text-[#FFBF00]" : "text-white"}`}>{team.name}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.p}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.w}</td>
                    <td className="py-5 px-3 text-center text-gray-500">{team.l}</td>
                    <td className="py-5 px-3 text-center font-black text-xl text-white">{team.pts}</td>
                    <td className="py-5 px-4 text-right text-gray-400 font-mono">{team.nrr}</td>
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
    { group: "A", match: "ECE vs CSE", date: "Oct 12, 10:00 AM", id: 1 },
    { group: "A", match: "ECE vs MECH", date: "Oct 13, 10:00 AM", id: 2 },
    { group: "A", match: "ECE vs AI+MBA", date: "Oct 14, 02:00 PM", id: 3 },
    { group: "A", match: "CSE vs MECH", date: "Oct 15, 10:00 AM", id: 4 },
    { group: "A", match: "CSE vs AI+MBA", date: "Oct 16, 09:00 AM", id: 5 },
    { group: "A", match: "MECH vs AI+MBA", date: "Oct 17, 02:00 PM", id: 6 },
    { group: "B", match: "CHEM vs EE", date: "Oct 12, 02:00 PM", id: 7 },
    { group: "B", match: "CHEM vs CIVIL", date: "Oct 13, 02:00 PM", id: 8 },
    { group: "B", match: "CHEM vs SCI", date: "Oct 14, 10:00 AM", id: 9 },
    { group: "B", match: "EE vs CIVIL", date: "Oct 15, 02:00 PM", id: 10 },
    { group: "B", match: "EE vs SCI", date: "Oct 16, 02:00 PM", id: 11 },
    { group: "B", match: "CIVIL vs SCI", date: "Oct 17, 10:00 AM", id: 12 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fixtures.map((fixture) => (
        <div 
          key={fixture.id} 
          className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-r-xl cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">Group {fixture.group}</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Match {fixture.id}</span>
          </div>
          <h4 className="text-2xl font-black text-white mb-2 tracking-wide group-hover:text-[#FFBF00] transition-colors">{fixture.match.split(' vs ')[0]} <span className="text-gray-600 font-bold text-sm mx-2">VS</span> {fixture.match.split(' vs ')[1]}</h4>
          <p className="text-sm text-gray-400 font-medium tracking-wide">{fixture.date}</p>
        </div>
      ))}
    </div>
  );
}