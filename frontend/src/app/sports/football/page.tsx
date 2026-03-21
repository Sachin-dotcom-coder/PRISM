"use client";

import React, { useState } from "react";

export default function FootballDashboard() {
  const [gender, setGender] = useState<"men" | "women">("men");
  const [activeTab, setActiveTab] = useState<"live" | "leaderboard" | "fixtures">("live");

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      {/* Main Container */}
      <div className="w-full max-w-7xl p-4 sm:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Football</h1>
          <div className="text-left md:text-right text-sm md:text-base text-gray-400 space-y-1 font-medium tracking-wide">
            <p><span className="text-gray-200">Match ID:</span> FBL-012 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Date:</span> Oct 14, 2026 <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Time:</span> 04:30 PM</p>
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
                {tab === "live" ? "Live Match" : tab}
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
  return (
    <div className="space-y-8">
      
      {/* Main Scorecard Status Box (Thinner Padding) */}
      <div className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFBF00] opacity-[0.02] blur-[100px] pointer-events-none rounded-full"></div>

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 border-b border-[#1A1A1A] pb-3">
          <span className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest">
            Match Status
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold tracking-widest uppercase">FT</span>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex flex-row justify-between items-start mb-4 px-0 md:px-12 z-10 relative">
          
          {/* Team 1 (Leading -> Yellow Text) */}
          <div className="flex flex-col items-center w-1/3">
            <h2 className="text-5xl md:text-7xl font-black text-[#FFBF00] tracking-tighter uppercase mb-2 text-center leading-none">
              ECE
            </h2>
            <div className="flex flex-col items-center space-y-1 mt-3">
              <p className="text-xs md:text-sm text-gray-400 font-bold tracking-wider">Player A <span className="ml-1 opacity-90">⚽</span> <span className="text-xs text-gray-500">23'</span></p>
              <p className="text-xs md:text-sm text-gray-400 font-bold tracking-wider">Player C <span className="ml-1 opacity-90">⚽</span> <span className="text-xs text-gray-500">68'</span></p>
            </div>
          </div>

          {/* Score & FT Text */}
          <div className="flex flex-col items-center justify-start w-1/3 pt-1">
            <div className="flex items-center justify-center gap-3 md:gap-6">
              <span className="text-5xl md:text-7xl font-black text-[#FFBF00] tracking-tighter leading-none">2</span>
              <span className="text-3xl md:text-5xl font-black text-[#333] leading-none">-</span>
              <span className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">1</span>
            </div>
            {/* FT Text right below the score */}
            <span className="text-sm md:text-base text-gray-500 font-bold tracking-widest mt-4 uppercase">FT</span>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center w-1/3">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-2 text-center leading-none">
              MECH
            </h2>
            <div className="flex flex-col items-center space-y-1 mt-3">
              <p className="text-xs md:text-sm text-gray-400 font-bold tracking-wider">Player K <span className="ml-1 opacity-90">⚽</span> <span className="text-xs text-gray-500">41'</span></p>
            </div>
          </div>
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
        { name: "ECE", p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, gd: "+3", pts: 7 },
        { name: "MECH", p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, gd: "+1", pts: 6 },
        { name: "CSE", p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, gd: "0", pts: 4 },
        { name: "AI+MBA", p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 5, gd: "-4", pts: 0 },
      ],
    },
    {
      name: "Group B",
      teams: [
        { name: "CHEM", p: 3, w: 3, d: 0, l: 0, gf: 6, ga: 1, gd: "+5", pts: 9 },
        { name: "EE", p: 3, w: 1, d: 1, l: 1, gf: 2, ga: 2, gd: "0", pts: 4 },
        { name: "CIVIL", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: "-2", pts: 3 },
        { name: "SCI", p: 3, w: 0, d: 1, l: 2, gf: 2, ga: 5, gd: "-3", pts: 1 },
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
                  <th className="py-4 px-3 text-center">D</th>
                  <th className="py-4 px-3 text-center">L</th>
                  <th className="py-4 px-3 text-center hidden sm:table-cell">GD</th>
                  <th className="py-4 px-3 text-center text-[#FFBF00] font-black text-base md:text-lg">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {group.teams.map((team, index) => (
                  <tr key={index} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-5 px-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                    <td className={`py-5 px-4 font-black tracking-widest uppercase ${index === 0 ? "text-[#FFBF00]" : "text-white"}`}>{team.name}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.p}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.w}</td>
                    <td className="py-5 px-3 text-center text-gray-500 font-medium">{team.d}</td>
                    <td className="py-5 px-3 text-center text-gray-500 font-medium">{team.l}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-mono hidden sm:table-cell">{team.gd}</td>
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
    { group: "A", match: "ECE vs CSE", date: "Oct 14, 04:30 PM", id: 1 },
    { group: "A", match: "MECH vs AI+MBA", date: "Oct 15, 08:00 AM", id: 2 },
    { group: "A", match: "ECE vs MECH", date: "Oct 16, 04:30 PM", id: 3 },
    { group: "A", match: "CSE vs AI+MBA", date: "Oct 17, 08:00 AM", id: 4 },
    { group: "A", match: "ECE vs AI+MBA", date: "Oct 18, 04:30 PM", id: 5 },
    { group: "A", match: "CSE vs MECH", date: "Oct 19, 08:00 AM", id: 6 },
    { group: "B", match: "CHEM vs EE", date: "Oct 14, 08:00 AM", id: 7 },
    { group: "B", match: "CIVIL vs SCI", date: "Oct 15, 04:30 PM", id: 8 },
    { group: "B", match: "CHEM vs CIVIL", date: "Oct 16, 08:00 AM", id: 9 },
    { group: "B", match: "EE vs SCI", date: "Oct 17, 04:30 PM", id: 10 },
    { group: "B", match: "CHEM vs SCI", date: "Oct 18, 08:00 AM", id: 11 },
    { group: "B", match: "EE vs CIVIL", date: "Oct 19, 04:30 PM", id: 12 },
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