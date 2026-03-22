"use client";

import React, { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FootballDashboard() {
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeTab, setActiveTab] = useState<"live" | "leaderboard" | "fixtures">("live");

  // Fetch football matches
  const { data: matches, error: matchesError, isLoading: matchesLoading } = useSWR(
    `/api/football/matches?gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  // Fetch football leaderboard
  const { data: teams, error: teamsError, isLoading: teamsLoading } = useSWR(
    `/api/football/leaderboard?gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const liveMatchesCount = Array.isArray(matches) ? matches.filter((m: any) => 
    ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"].includes(m.status)
  ).length : 0;

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      {/* Main Container */}
      <div className="w-full max-w-7xl p-4 sm:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Football</h1>
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
          {activeTab === "live" && <LiveScore matches={matches} error={matchesError} isLoading={matchesLoading} />}
          {activeTab === "leaderboard" && <Leaderboard teams={teams} error={teamsError} isLoading={teamsLoading} />}
          {activeTab === "fixtures" && <Fixtures matches={matches} error={matchesError} isLoading={matchesLoading} />}
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LiveScore({ matches, error, isLoading }: { matches: any, error: any, isLoading: boolean }) {
  if (error) return <div className="text-red-400 p-8 text-center">Failed to load live scores.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center">Loading live scores...</div>;

  const liveMatches = Array.isArray(matches) ? matches.filter((m: any) => 
    ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"].includes(m.status)
  ) : [];

  const currentMatch = liveMatches[0];

  if (!currentMatch) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-500 text-lg">No live matches currently</div>
        <div className="text-zinc-600 text-sm mt-2">Check back later or view upcoming fixtures</div>
      </div>
    );
  }

  const team1Goals = currentMatch.goals?.filter((g: any) => g.team === currentMatch.teams?.team1) || [];
  const team2Goals = currentMatch.goals?.filter((g: any) => g.team === currentMatch.teams?.team2) || [];

  return (
    <div className="space-y-8">
      {/* Main Scorecard Status Box (Thinner Padding) */}
      <div className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFBF00] opacity-[0.02] blur-[100px] pointer-events-none rounded-full"></div>

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 border-b border-[#1A1A1A] pb-3">
          <span className="text-[#FFBF00] text-xs font-bold uppercase tracking-widest">
            {currentMatch.status.replace("_", " ")}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Live</span>
            <div className="w-2 h-2 bg-[#FFBF00] rounded-full animate-pulse shadow-[0_0_10px_#FFBF00]"></div>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex flex-row justify-between items-start mb-4 px-0 md:px-12 z-10 relative">
          
          {/* Team 1  */}
          <div className="flex flex-col items-center w-1/3">
            <h2 className={`text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2 text-center leading-none ${currentMatch.score?.team1 > currentMatch.score?.team2 ? "text-[#FFBF00]" : "text-white"}`}>
              {currentMatch.teams?.team1}
            </h2>
            <div className="flex flex-col items-center space-y-1 mt-3">
              {team1Goals.map((goal: any, i: number) => (
                <p key={i} className="text-xs md:text-sm text-gray-400 font-bold tracking-wider">
                  {goal.player} <span className="ml-1 opacity-90">⚽</span> 
                  {(goal.minute !== undefined && goal.minute !== null) && <span className="text-xs text-gray-500">{goal.minute}'</span>}
                </p>
              ))}
            </div>
          </div>

          {/* Score & Status Text */}
          <div className="flex flex-col items-center justify-start w-1/3 pt-1">
            <div className="flex items-center justify-center gap-3 md:gap-6">
              <span className={`text-5xl md:text-7xl font-black tracking-tighter leading-none ${currentMatch.score?.team1 > currentMatch.score?.team2 ? "text-[#FFBF00]" : "text-white"}`}>
                {currentMatch.score?.team1 || 0}
              </span>
              <span className="text-3xl md:text-5xl font-black text-[#333] leading-none">-</span>
              <span className={`text-5xl md:text-7xl font-black tracking-tighter leading-none ${currentMatch.score?.team2 > currentMatch.score?.team1 ? "text-[#FFBF00]" : "text-white"}`}>
                {currentMatch.score?.team2 || 0}
              </span>
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center w-1/3">
            <h2 className={`text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2 text-center leading-none ${currentMatch.score?.team2 > currentMatch.score?.team1 ? "text-[#FFBF00]" : "text-white"}`}>
              {currentMatch.teams?.team2}
            </h2>
            <div className="flex flex-col items-center space-y-1 mt-3">
              {team2Goals.map((goal: any, i: number) => (
                <p key={i} className="text-xs md:text-sm text-gray-400 font-bold tracking-wider">
                  {goal.player} <span className="ml-1 opacity-90">⚽</span> 
                  {(goal.minute !== undefined && goal.minute !== null) && <span className="text-xs text-gray-500">{goal.minute}'</span>}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ teams, error, isLoading }: { teams: any, error: any, isLoading: boolean }) {
  if (error) return <div className="text-red-400 p-8 text-center">Failed to load leaderboard.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center">Loading leaderboard...</div>;

  const validTeams = Array.isArray(teams) ? teams : [];

  // Group teams by their group field
  const groups = validTeams.reduce((acc: any, team: any) => {
    const groupName = team.group || "A";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(team);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort();

  return (
    <div className="space-y-12">
      {groupKeys.map((groupName) => (
        <div key={groupName} className="bg-[#000000] p-6 rounded-xl border border-[#1A1A1A]">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-6 border-l-8 border-[#FFBF00] pl-4 uppercase tracking-wider">Group {groupName}</h3>
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
                {groups[groupName]
                  .sort((a: any, b: any) => b.points - a.points || b.goalDifference - a.goalDifference)
                  .map((team: any, index: number) => (
                  <tr key={index} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-5 px-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                    <td className={`py-5 px-4 font-black tracking-widest uppercase ${index === 0 ? "text-[#FFBF00]" : "text-white"}`}>
                      {team.shortName || team.name}
                    </td>
                    <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.matches || 0}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-medium">{team.wins || 0}</td>
                    <td className="py-5 px-3 text-center text-gray-500 font-medium">{team.draws || 0}</td>
                    <td className="py-5 px-3 text-center text-gray-500 font-medium">{team.losses || 0}</td>
                    <td className="py-5 px-3 text-center text-gray-400 font-mono hidden sm:table-cell">{team.goalDifference || 0}</td>
                    <td className="py-5 px-3 text-center font-black text-xl text-white">{team.points || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {groupKeys.length === 0 && <div className="text-center py-12 text-zinc-500">No teams found.</div>}
    </div>
  );
}

function Fixtures({ matches, error, isLoading }: { matches: any, error: any, isLoading: boolean }) {
  const [expandedMatch, setExpandedMatch] = React.useState<any>(null);

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load fixtures.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center">Loading fixtures...</div>;

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
            const team1 = match.teams?.team1 || "Team 1";
            const team2 = match.teams?.team2 || "Team 2";
            const date = match.date ? new Date(match.date).toLocaleDateString() : (match.match_id ? "TBD" : "N/A");
            const time = match.startTime || "TBD";
            const group = match.group || "A";
            const isCompleted = match.status === "COMPLETED";

            return (
              <div
                key={match.match_id || index}
                onClick={() => isCompleted ? setExpandedMatch(match) : null}
                className={`bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-r-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group ${isCompleted ? "cursor-pointer hover:scale-[1.03]" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">Group {group}</span>
                  <div className="flex items-center gap-2">
                    {isCompleted && <span className="text-[10px] text-[#FFBF00] font-bold uppercase tracking-widest opacity-60">Tap to expand</span>}
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Match {match.match_id || (index+1)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className={`text-xl font-black tracking-wide transition-colors ${match.result?.winner === team1 ? "text-[#FFBF00]" : "text-white group-hover:text-[#FFBF00]"}`}>{team1}</h4>
                    {isCompleted && <span className={`text-xl font-black ${match.result?.winner === team1 ? "text-[#FFBF00]" : "text-white"}`}>{match.score?.team1 || 0}</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className={`text-xl font-black tracking-wide transition-colors ${match.result?.winner === team2 ? "text-[#FFBF00]" : "text-white group-hover:text-[#FFBF00]"}`}>{team2}</h4>
                    {isCompleted && <span className={`text-xl font-black ${match.result?.winner === team2 ? "text-[#FFBF00]" : "text-white"}`}>{match.score?.team2 || 0}</span>}
                  </div>
                </div>

                <p className="text-sm text-gray-400 font-medium tracking-wide">{date} • {time}</p>
                {isCompleted && (
                  <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
                    {match.result?.winner
                      ? <p className="text-[#FFBF00] font-black uppercase text-sm tracking-widest">🏆 {match.result.winner} won</p>
                      : <p className="text-gray-400 font-black uppercase text-sm tracking-widest">🤝 Draw</p>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <RenderMatchList list={upcoming} title="Upcoming Matches" />
      <RenderMatchList list={completed} title="Completed Matches" />
      {upcoming.length === 0 && completed.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-lg">No fixtures available</div>
      )}

      {/* Expanded Scorecard Modal */}
      {expandedMatch && (() => {
        const m = expandedMatch;
        const t1 = m.teams?.team1 || "Team 1";
        const t2 = m.teams?.team2 || "Team 2";
        const t1Goals = (m.goals || []).filter((g: any) => g.team === t1);
        const t2Goals = (m.goals || []).filter((g: any) => g.team === t2);
        const allGoals = [...(m.goals || [])].sort((a: any, b: any) => (a.minute ?? 999) - (b.minute ?? 999));

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setExpandedMatch(null)}
          >
            <div
              className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(255,191,0,0.1)] max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#111] border-b border-[#1A1A1A] p-5 flex justify-between items-center">
                <div>
                  <span className="text-[#FFBF00] text-xs font-black uppercase tracking-widest">Full Time</span>
                  <p className="text-xs text-gray-500 mt-0.5">{m.match_id}</p>
                </div>
                <button onClick={() => setExpandedMatch(null)} className="text-gray-500 hover:text-white text-2xl font-bold leading-none">×</button>
              </div>

              {/* Scoreboard */}
              <div className="p-6 flex items-start justify-between border-b border-[#1A1A1A]">
                <div className="text-center flex-1">
                  <p className={`text-2xl font-black uppercase tracking-tight ${m.result?.winner === t1 ? "text-[#FFBF00]" : "text-white"}`}>{t1}</p>
                  <div className="space-y-0.5 mt-2">
                    {t1Goals.map((g: any, i: number) => (
                      <p key={i} className="text-xs text-gray-500">⚽ {g.player}{(g.minute !== undefined && g.minute !== null) ? ` ${g.minute}’` : ""}</p>
                    ))}
                  </div>
                </div>
                <div className="text-center px-4 pt-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl font-black ${m.result?.winner === t1 ? "text-[#FFBF00]" : "text-white"}`}>{m.score?.team1 || 0}</span>
                    <span className="text-2xl text-[#333] font-black">–</span>
                    <span className={`text-5xl font-black ${m.result?.winner === t2 ? "text-[#FFBF00]" : "text-white"}`}>{m.score?.team2 || 0}</span>
                  </div>
                  {m.result?.winner
                    ? <p className="text-[#FFBF00] text-xs font-black uppercase tracking-widest mt-2">🏆 {m.result.winner} wins</p>
                    : <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-2">🤝 Draw</p>
                  }
                </div>
                <div className="text-center flex-1">
                  <p className={`text-2xl font-black uppercase tracking-tight ${m.result?.winner === t2 ? "text-[#FFBF00]" : "text-white"}`}>{t2}</p>
                  <div className="space-y-0.5 mt-2">
                    {t2Goals.map((g: any, i: number) => (
                      <p key={i} className="text-xs text-gray-500">⚽ {g.player}{(g.minute !== undefined && g.minute !== null) ? ` ${g.minute}’` : ""}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal Timeline */}
              {allGoals.length > 0 && (
                <div className="p-5">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Goal Timeline</h4>
                  <div className="space-y-3">
                    {allGoals.map((g: any, i: number) => {
                      const isTeam1 = g.team === t1;
                      return (
                        <div key={i} className={`flex items-center gap-3 ${isTeam1 ? "flex-row" : "flex-row-reverse"}`}>
                          <div className={`flex-1 flex items-center gap-2 p-2.5 px-4 rounded-xl text-sm font-medium ${isTeam1 ? "bg-[#FFBF00]/10 border border-[#FFBF00]/20" : "bg-[#1A1A1A] border border-[#333]"}`}>
                            <span className="text-base">⚽</span>
                            <div className="flex flex-col">
                              <span className={`font-black text-sm ${isTeam1 ? "text-[#FFBF00]" : "text-white"}`}>{g.player}</span>
                              <span className="text-[10px] text-gray-500">{g.team}</span>
                            </div>
                          </div>
                          {(g.minute !== undefined && g.minute !== null) && (
                            <span className="text-xs text-gray-500 font-mono w-8 text-center shrink-0">{g.minute}&apos;</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-[#1A1A1A]">
                <button onClick={() => setExpandedMatch(null)} className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#222] text-gray-400 font-bold text-sm rounded-xl transition-colors">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
