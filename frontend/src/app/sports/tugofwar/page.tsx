"use client";

import React, { useState } from "react";
import useSWR from "swr";

// Points to your backend port
const fetcher = async (url: string) => {
  const res = await fetch(`http://localhost:5000${url}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function TugOfWarDashboard() {
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeTab, setActiveTab] = useState<"live" | "leaderboard" | "fixtures">("live");

  const { data: matches } = useSWR(
    `/api/matches?sport=tugofwar&gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const liveMatchesCount = Array.isArray(matches) ? matches.filter((m: any) => m.status === "LIVE").length : 0;

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black pt-20">
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl p-4 sm:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-5xl md:text-7xl tracking-tighter uppercase">Tug of War</h1>
          <div className="text-left md:text-right text-sm md:text-base text-gray-400 space-y-1 font-medium tracking-wide">
            <p><span className="text-gray-200">Live Matches:</span> {liveMatchesCount} <span className="mx-2 text-[#333]">|</span> <span className="text-gray-200">Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="text-gray-200">Venue:</span> SVNIT Main Ground</p>
          </div>
        </header>

        {/* Toggles (Navigation) */}
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
          {activeTab === "live" && <LiveScore gender={gender} />}
          {activeTab === "leaderboard" && <Leaderboard gender={gender} />}
          {activeTab === "fixtures" && <Fixtures gender={gender} />}
        </div>

      </div>
    </div>
  );
}

// --- SHARED COMPONENTS ---

function ScorecardContent({ match, isLive = false }: { match: any, isLive?: boolean }) {
  if (!match) return null;

  const teamA = match.teams?.team_a || match.teams?.player_a || { name: "Team A", score: 0 };
  const teamB = match.teams?.team_b || match.teams?.player_b || { name: "Team B", score: 0 };
  const rounds = match.rounds || match.halves || [];
  const currentRound = match.current_round || match.current_half || 1;
  const result = match.result || "Ongoing";

  // Calculate Lead based on rounds won
  const scoreDiff = teamA.score - teamB.score;
  let leadText = "Scores Level";
  if (scoreDiff > 0) leadText = `${teamA.name} leads by ${scoreDiff} Round${scoreDiff > 1 ? 's' : ''}`;
  if (scoreDiff < 0) leadText = `${teamB.name} leads by ${Math.abs(scoreDiff)} Round${Math.abs(scoreDiff) > 1 ? 's' : ''}`;

  return (
    <div className="space-y-8">
      {/* Lead Indicator Box */}
      <div className="bg-[#000000] border border-[#FFBF00]/30 rounded-xl p-4 sm:p-5 flex justify-center items-center gap-6 shadow-[0_0_15px_rgba(255,191,0,0.05)] mx-auto w-fit">
        <div className="flex flex-col justify-center items-center leading-none font-bold text-xs tracking-widest uppercase">
          <span className="text-gray-400 mb-2">Match Status</span>
          <span className={`text-xl sm:text-2xl font-black tracking-tighter ${isLive ? "text-[#FFBF00]" : "text-white"}`}>
            {isLive ? leadText : result}
          </span>
        </div>
      </div>

      {/* Main Scorecard Status Box */}
      <div className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFBF00] opacity-[0.02] blur-[100px] pointer-events-none rounded-full"></div>

        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#FFBF00]/30" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#FFBF00]/30" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FFBF00]/30" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FFBF00]/30" />

        <div className="flex justify-between items-center mb-8 border-b border-[#1A1A1A] pb-4">
          <div className="flex gap-4 items-center">
            <span className="text-[#FFBF00] text-sm font-black uppercase tracking-widest">
              Round {currentRound}
            </span>
            {match.stage && (
              <span className="text-[10px] font-black bg-[#FFBF00]/10 border border-[#FFBF00]/20 text-[#FFBF00] px-2 py-0.5 rounded-full uppercase tracking-widest">
                {match.stage}
              </span>
            )}
          </div>
          {isLive && (
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Live Pull</span>
              <div className="w-2.5 h-2.5 bg-[#FFBF00] rounded-full animate-pulse shadow-[0_0_10px_#FFBF00]"></div>
            </div>
          )}
        </div>

        {/* Massive Scores Layout (Rounds Won) */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8 md:gap-0 z-10 relative">
          
          {/* Team A */}
          <div className="flex flex-col items-center md:items-start w-full md:w-2/5">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase text-center md:text-left drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              {teamA.name}
            </h2>
            <div className="mt-2 text-xs font-mono tracking-widest text-gray-500">
              ROUNDS WON
            </div>
          </div>

          {/* Points Center */}
          <div className="flex items-center justify-center w-full md:w-1/5 gap-6">
            <div className="text-6xl md:text-8xl font-black text-[#FFBF00] tracking-tighter drop-shadow-[0_0_20px_rgba(255,191,0,0.3)]">
              {teamA.score}
            </div>
            <div className="text-3xl md:text-5xl font-light text-white/20">-</div>
            <div className="text-6xl md:text-8xl font-black text-[#FFBF00] tracking-tighter drop-shadow-[0_0_20px_rgba(255,191,0,0.3)]">
              {teamB.score}
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center md:items-end w-full md:w-2/5">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase text-center md:text-right drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              {teamB.name}
            </h2>
            <div className="mt-2 text-xs font-mono tracking-widest text-gray-500">
              ROUNDS WON
            </div>
          </div>
        </div>
      </div>

      {/* Rounds Breakdown Table */}
      {rounds.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[#FFBF00] font-black text-xl mb-4 tracking-widest uppercase pl-1">Round Breakdown</h3>
          <div className="overflow-x-auto rounded-xl border border-[#1A1A1A] p-3">
            <table className="w-full text-left text-base md:text-lg whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 border-b border-[#1A1A1A] uppercase tracking-wider text-sm font-bold">
                  <th className="py-4 px-4 w-1/3">Round</th>
                  <th className="py-4 px-4 text-center w-1/3">{teamA.name}</th>
                  <th className="py-4 px-4 text-center w-1/3">{teamB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {rounds.map((round: any, i: number) => {
                  // Assuming the backend sends team_a_score / team_b_score as 1 for win, 0 for loss per round
                  const aWon = round.team_a_score > round.team_b_score;
                  const bWon = round.team_b_score > round.team_a_score;
                  
                  return (
                    <tr key={i} className="hover:bg-[#0A0A0A] transition-colors">
                      <td className="py-4 px-4 font-medium text-white tracking-widest">
                        ROUND {round.round_number || round.half_number || (i + 1)}
                      </td>
                      <td className={`py-4 px-4 text-center font-black text-xl ${aWon ? "text-[#FFBF00]" : "text-gray-500"}`}>
                        {aWon ? "WIN" : "LOSS"}
                      </td>
                      <td className={`py-4 px-4 text-center font-black text-xl ${bWon ? "text-[#FFBF00]" : "text-gray-500"}`}>
                        {bWon ? "WIN" : "LOSS"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TAB COMPONENTS ---

function LiveScore({ gender }: { gender: "m" | "f" }) {
  const { data: matches, error, isLoading } = useSWR(
    `/api/matches?sport=tugofwar&gender=${gender}`,
    fetcher,
    { refreshInterval: 5000 } 
  );

  const liveMatches = Array.isArray(matches) ? matches.filter((m: any) => m.status === "LIVE") : [];
  const currentMatch = liveMatches[0];

  if (error) return <div className="text-red-400 p-8 text-center font-mono">Failed to load live scores.</div>;
  if (isLoading) return <div className="text-[#FFBF00] animate-pulse p-8 text-center font-mono tracking-widest uppercase">Initializing Live Feed...</div>;

  if (!currentMatch) {
    return (
      <div className="text-center py-20 border border-[#1A1A1A] rounded-2xl bg-[#050505]">
        <div className="text-gray-500 text-xl font-bold tracking-widest uppercase">No Live Matches</div>
        <div className="text-gray-600 text-sm mt-3 font-mono">STAND BY FOR NEXT FIXTURE</div>
      </div>
    );
  }

  return <ScorecardContent match={currentMatch} isLive={true} />;
}

function Leaderboard({ gender }: { gender: "m" | "f" }) {
  const { data: teams, error, isLoading } = useSWR(
    `/api/leaderboard?sport=tugofwar&gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load standings.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center uppercase tracking-widest">Loading Standings...</div>;

  const validTeams = Array.isArray(teams) ? teams : [];

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
                  <th className="py-4 px-4">Rank</th>
                  <th className="py-4 px-4">Team</th>
                  <th className="py-4 px-3 text-center">Played</th>
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
    `/api/matches?sport=tugofwar&gender=${gender}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load fixtures.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center uppercase tracking-widest">Loading Matches...</div>;

  const validMatches = Array.isArray(matches) ? matches : [];
  const upcoming = validMatches.filter((m: any) => m.status === "UPCOMING");
  const completed = validMatches.filter((m: any) => m.status === "COMPLETED");

  const RenderMatchList = ({ list, title }: { list: any[], title: string }) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-12">
        <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((match: any, index: number) => {
            const teamAObj = match.teams?.team_a || match.teams?.player_a;
            const teamBObj = match.teams?.team_b || match.teams?.player_b;
            const teamA = teamAObj?.name || "Team A";
            const teamB = teamBObj?.name || "Team B";
            const date = match.date ? new Date(match.date).toLocaleDateString() : "TBD";
            const time = match.startTime || "TBD";

            return (
              <div
                key={match.match_id || match._id || index}
                onClick={() => setSelectedMatch(match)}
                className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">
                      {match.stage || "Group"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    {match.match_id || `Match ${index + 1}`}
                  </span>
                </div>
                
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-white tracking-wide uppercase truncate max-w-[70%] group-hover:text-[#FFBF00] transition-colors">
                      {teamA}
                    </h4>
                    <span className="text-white font-black text-2xl tracking-tighter">
                      {teamAObj?.score ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-white tracking-wide uppercase truncate max-w-[70%] group-hover:text-[#FFBF00] transition-colors">
                      {teamB}
                    </h4>
                    <span className="text-white font-black text-2xl tracking-tighter">
                      {teamBObj?.score ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1A1A1A] flex justify-between items-end">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-400 font-mono tracking-widest">
                      {date} • {time}
                    </p>
                  </div>
                  {match.status === "COMPLETED" && match.winners && (
                    <p className="text-[#FFBF00] font-black uppercase text-[10px] tracking-widest text-right max-w-[50%]">
                       {match.winners} won
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Modal / Detailed View Overlay */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}></div>
          <div className="relative bg-[#000000] border border-[#1A1A1A] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-[0_0_50px_rgba(255,191,0,0.1)] p-6 sm:p-10 hide-scrollbar">
            <button 
              onClick={() => setSelectedMatch(null)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-8">
              <h2 className="text-[#FFBF00] font-black text-3xl uppercase tracking-widest mb-2">Match Details</h2>
              <div className="flex items-center gap-3">
                <p className="text-gray-500 font-mono tracking-widest uppercase text-sm">{selectedMatch.match_id}</p>
              </div>
            </div>
            <ScorecardContent match={selectedMatch} isLive={selectedMatch.status === "LIVE"} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <RenderMatchList list={upcoming} title="Upcoming Matches" />
        <RenderMatchList list={completed} title="Completed Matches" />
        {upcoming.length === 0 && completed.length === 0 && (
          <div className="text-center py-20 border border-[#1A1A1A] rounded-2xl bg-[#050505]">
            <div className="text-zinc-500 text-lg tracking-widest uppercase font-bold">No fixtures available</div>
          </div>
        )}
      </div>
    </div>
  );
}