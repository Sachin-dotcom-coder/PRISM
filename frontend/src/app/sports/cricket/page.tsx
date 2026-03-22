"use client";

import React, { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CricketDashboard() {
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeTab, setActiveTab] = useState<"live" | "leaderboard" | "fixtures">("live");

  // Fetch matches to get live count for header
  const { data: matches } = useSWR(
    `/api/matches?gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const liveMatchesCount = Array.isArray(matches) ? matches.filter((m: any) => m.status === "LIVE").length : 0;

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex justify-center selection:bg-[#FFBF00] selection:text-black">
      {/* Main Container */}
      <div className="w-full max-w-7xl p-4 sm:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#1A1A1A] pb-6 gap-4">
          <h1 className="text-[#FFBF00] font-black text-6xl md:text-7xl tracking-tighter uppercase">Cricket</h1>
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
                {tab === "live" ? "Live Score" : tab}
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
  const [selectedInning, setSelectedInning] = useState<number | null>(null);
  
  if (!match) return null;
  
  const shownInningNum = selectedInning || match.current_innings || 1;
  const currentInning = match.innings?.find((i: any) => i.inning_number === shownInningNum) || match.innings?.[shownInningNum - 1] || match.innings?.[0];

  const team1 = match.teams?.team1;
  const team2 = match.teams?.team2;
  const inningBattingTeamName = currentInning?.batting_team || currentInning?.team || "";
  const isTeam1Batting = inningBattingTeamName === team1?.name || inningBattingTeamName === team1?.shortName;

  const battingTeam = isTeam1Batting ? (team1?.name || inningBattingTeamName || "Team 1") : (team2?.name || inningBattingTeamName || "Team 2");
  const bowlingTeam = isTeam1Batting ? (team2?.shortName || team2?.name || "Team 2") : (team1?.shortName || team1?.name || "Team 1");

  const batters = currentInning?.batters || [];
  const bowlers = currentInning?.bowlers || [];
  const currentBowler = bowlers.find((b: any) => b.isCurrent || b.isCurrentBowler) || bowlers[0];
  const recentBalls = match.recent_balls || [];

  const tossWinner = match.toss?.winner || match.tossWinner || "Toss";
  const tossDecision = match.toss?.decision || match.tossDecision || "bat/field";

  const oversPlayed = currentInning?.overs || 0;
  const totalBalls = Math.floor(oversPlayed) * 6 + (Math.round((oversPlayed % 1) * 10));
  const crr = totalBalls > 0 ? ((currentInning?.runs || 0) / (totalBalls / 6)).toFixed(2) : "0.00";

  // Target calculation for 2nd innings
  const inning1 = match.innings?.find((i: any) => i.inning_number === 1) || match.innings?.[0];
  const runsNeeded = (inning1?.runs || 0) - (currentInning?.runs || 0);
  const ballsLeft = 48 - totalBalls;

  return (
    <div className="space-y-8">
      {/* Target Box (2nd Innings) */}
      {match.current_innings === 2 && shownInningNum === 2 && (
        <div className="bg-[#000000] border border-[#FFBF00]/30 rounded-xl p-4 sm:p-5 flex justify-center items-center gap-6 sm:gap-10 shadow-[0_0_15px_rgba(255,191,0,0.05)] mx-auto w-fit">
          <div className="flex flex-col justify-center items-end leading-none text-gray-400 font-bold text-xs tracking-widest uppercase">
            <span>Runs</span>
            <span className="mt-1 text-[#FFBF00]">Needed</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">
            {runsNeeded}
          </div>
          <div className="w-px h-10 sm:h-12 bg-[#1A1A1A] mx-2"></div>
          <div className="flex flex-col justify-center items-end leading-none text-gray-400 font-bold text-xs tracking-widest uppercase">
            <span>Balls</span>
            <span className="mt-1 text-[#FFBF00]">Left</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">
            {Math.max(0, ballsLeft)}
          </div>
        </div>
      )}

      {/* Main Scorecard Status Box */}
      <div className="border border-[#1A1A1A] bg-[#000000] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFBF00] opacity-[0.02] blur-[100px] pointer-events-none rounded-full"></div>

        <div className="flex justify-between items-center mb-5 border-b border-[#1A1A1A] pb-3">
          <div className="flex gap-4">
            {[1, 2].map((num) => {
              const hasInning = match.innings?.some((i: any) => i.inning_number === num) || !!match.innings?.[num - 1];
              if (!hasInning) return null;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedInning(num)}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${shownInningNum === num ? "text-[#FFBF00]" : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                  {num === 1 ? "1st Innings" : "2nd Innings"}
                </button>
              );
            })}
          </div>
          {isLive && (
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Live</span>
              <div className="w-2.5 h-2.5 bg-[#FFBF00] rounded-full animate-pulse shadow-[0_0_10px_#FFBF00]"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0">
          <div className="flex flex-col items-center md:items-start w-full md:w-1/2 z-10">
            <h2 className="text-lg md:text-xl font-black text-white tracking-widest uppercase mb-1">
              {battingTeam} <span className="text-xs font-bold text-gray-500 tracking-widest ml-2">Batting</span>
            </h2>
            <div className="flex items-baseline gap-1">
              <h3 className="text-6xl md:text-7xl font-black text-[#FFBF00] tracking-tighter leading-none">
                {currentInning?.runs || 0}
              </h3>
              <span className="text-3xl md:text-4xl font-black text-white leading-none">/{currentInning?.wickets || 0}</span>
            </div>
            <p className="text-sm text-gray-400 mt-3 font-medium tracking-wide">
              Overs: <span className="text-white font-bold">{currentInning?.overs || 0}</span>
              <span className="mx-3 text-[#333]">|</span>
              CRR: <span className="text-white font-bold">{crr}</span>
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end w-full md:w-1/2 md:text-right border-t border-[#1A1A1A] md:border-t-0 pt-6 md:pt-0 z-10">
            <h2 className="text-lg md:text-xl font-black text-white tracking-widest uppercase mb-4">
              {bowlingTeam} <span className="text-xs font-bold text-gray-500 tracking-widest ml-2">Bowling</span>
            </h2>
            {currentBowler && (
              <div className="flex flex-col items-center md:items-end w-full">
                <p className="text-3xl font-black text-white mb-2 tracking-wide">{currentBowler.bowler}</p>
                <div className="flex gap-3 text-[#FFBF00] font-mono text-xl font-bold mb-5">
                  <span title="Overs">{currentBowler.overs || 0}</span>
                  <span className="text-[#333]">-</span>
                  <span title="Runs">{currentBowler.runs || 0}</span>
                  <span className="text-[#333]">-</span>
                  <span title="Wickets" className="text-white">{currentBowler.wickets || 0}</span>
                </div>

                {/* Over Tracker */}
                {isLive && recentBalls.length > 0 && shownInningNum === match.current_innings && (
                  <div className="flex gap-2">
                    {recentBalls.map((ball: string, i: number) => (
                      <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs ${ball === 'W' ? 'border-red-500 bg-red-500/10 text-red-500' :
                        ['1', '2', '3', '4', '6'].includes(ball) ? 'border-[#FFBF00] bg-[#FFBF00]/10 text-[#FFBF00]' :
                          'border-[#1A1A1A] bg-transparent text-gray-400'
                        }`}>{ball}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center border-t border-[#1A1A1A] pt-4 mt-5 z-10 relative">
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase flex items-center gap-3">
            <span className="bg-[#FFBF00] text-black px-2 py-0.5 rounded text-[9px] font-black">TOSS</span>
            <span className="text-gray-300">{tossWinner} elected to {tossDecision}</span>
          </p>
        </div>
      </div>

      {/* Batters Table */}
      {batters.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[#FFBF00] font-black text-2xl mb-4 tracking-widest uppercase pl-1">{battingTeam} Batting</h3>
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
                {batters.map((batter: any, i: number) => (
                  <tr key={i} className={isLive && batter.isOnStrike ? "bg-[#050505]" : "hover:bg-[#0A0A0A] transition-colors"}>
                    <td className="py-4 px-4 font-medium text-white">
                      {batter.batter}
                      {isLive && batter.isOnStrike && <span className="ml-2 text-xl drop-shadow-[0_0_8px_#FFBF00]" title="Striker">🏏</span>}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm md:text-base">
                      {batter.status || "not out"}
                    </td>
                    <td className="py-4 px-3 text-right font-black">{batter.runs || 0}</td>
                    <td className="py-4 px-3 text-right text-gray-500">{batter.balls || 0}</td>
                    <td className="py-4 px-3 text-right text-gray-500">{batter.fours || 0}</td>
                    <td className="py-4 px-3 text-right text-gray-500">{batter.sixes || 0}</td>
                    <td className="py-4 px-4 text-right text-gray-500">
                      {batter.balls > 0 ? ((batter.runs / batter.balls) * 100).toFixed(0) : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bowlers Table */}
      {bowlers.length > 0 && (
        <div className="mt-10">
          <h3 className="text-gray-300 font-black text-2xl mb-4 tracking-widest uppercase pl-1">{bowlingTeam} Bowling</h3>
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
                {bowlers.map((bowler: any, i: number) => (
                  <tr key={i} className={isLive && bowler.isCurrent ? "bg-[#050505]" : "hover:bg-[#0A0A0A] transition-colors"}>
                    <td className="py-4 px-4 font-medium text-white">
                      {bowler.bowler}
                      {isLive && bowler.isCurrent && <span className="ml-2 text-xl drop-shadow-[0_0_8px_#FFBF00]" title="Bowling">🥎</span>}
                    </td>
                    <td className="py-4 px-3 text-right text-gray-400 font-medium">{bowler.overs || 0}</td>
                    <td className="py-4 px-3 text-right text-gray-400 font-medium">{bowler.runs || 0}</td>
                    <td className="py-4 px-3 text-right font-black text-[#FFBF00] text-xl md:text-2xl">{bowler.wickets || 0}</td>
                    <td className="py-4 px-4 text-right text-gray-500">
                      {bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))}
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
    `/api/matches?gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const liveMatches = Array.isArray(matches) ? matches.filter((m: any) => m.status === "LIVE") : [];
  const currentMatch = liveMatches[0];

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load live scores.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center">Loading live scores...</div>;

  if (!currentMatch) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-500 text-lg">No live matches currently</div>
        <div className="text-zinc-600 text-sm mt-2">Check back later or view upcoming fixtures</div>
      </div>
    );
  }

  return <ScorecardContent match={currentMatch} isLive={true} />;
}

function Leaderboard({ gender }: { gender: "m" | "f" }) {
  const { data: teams, error, isLoading } = useSWR(
    `/api/leaderboard?gender=${gender}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  if (error) return <div className="text-red-400 p-8 text-center">Failed to load leaderboard.</div>;
  if (isLoading) return <div className="text-zinc-500 animate-pulse p-8 text-center">Loading leaderboard...</div>;

  const validTeams = Array.isArray(teams) ? teams : [];

  // Group teams by their group field
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
                {groups[groupName]
                  .sort((a: any, b: any) => b.points - a.points || b.nrr - a.nrr)
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
                    <td className="py-5 px-4 text-right text-gray-400 font-mono">{team.nrr ? team.nrr.toFixed(2) : "0.00"}</td>
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
    `/api/matches?gender=${gender}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

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
            const team1Obj = match.teams?.team1;
            const team2Obj = match.teams?.team2;
            const team1 = team1Obj?.shortName || team1Obj?.name || "Team 1";
            const team2 = team2Obj?.shortName || team2Obj?.name || "Team 2";
            const date = match.date ? new Date(match.date).toLocaleDateString() : "TBD";
            const time = match.startTime || "TBD";
            const group = match.group || "A";

            // Get scores based on team name/shortName
            const getInning = (t: any) => {
              if (!t) return null;
              return match.innings?.find((i: any) => 
                i.batting_team === t.name || i.batting_team === t.shortName ||
                i.team === t.name || i.team === t.shortName
              );
            };

            const t1Score = getInning(team1Obj);
            const t2Score = getInning(team2Obj);

            return (
              <div
                key={match.match_id || match._id || index}
                onClick={() => setSelectedMatch(match)}
                className="bg-[#000000] border border-[#1A1A1A] border-l-8 border-l-[#FFBF00] p-6 rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,191,0,0.1)] group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold bg-[#111] text-[#FFBF00] px-3 py-1 rounded tracking-widest uppercase border border-[#333]">
                    Group {group}
                  </span>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Match {match.match_id || (index + 1)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-black text-white tracking-wide group-hover:text-[#FFBF00] transition-colors">
                      {team1}
                    </h4>
                    {t1Score && (
                      <span className="text-gray-300 font-black tracking-tighter">
                        {t1Score.runs}/{t1Score.wickets} <span className="text-xs text-gray-500">({t1Score.overs})</span>
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-black text-white tracking-wide group-hover:text-[#FFBF00] transition-colors">
                      {team2}
                    </h4>
                    {t2Score && (
                      <span className="text-gray-300 font-black tracking-tighter">
                        {t2Score.runs}/{t2Score.wickets} <span className="text-xs text-gray-500">({t2Score.overs})</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-400 font-medium tracking-wide">
                  {date} • {time}
                </p>
                {match.venue && (
                  <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
                    {match.venue}
                  </p>
                )}
                {match.status === "COMPLETED" && match.winners && (
                  <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
                    <p className="text-[#FFBF00] font-black uppercase text-sm tracking-widest">
                       {match.winners} won
                    </p>
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
    <div className="relative">
      {/* Modal / Detailed View Overlay */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}></div>
          <div className="relative bg-[#000000] border border-[#1A1A1A] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-[0_0_50px_rgba(255,191,0,0.1)] p-6 sm:p-10 hide-scrollbar">
            <button 
              onClick={() => setSelectedMatch(null)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-8">
              <h2 className="text-[#FFBF00] font-black text-4xl uppercase tracking-tighter mb-2">Match Details</h2>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">{selectedMatch.match_id} • Group {selectedMatch.group}</p>
            </div>
            <ScorecardContent match={selectedMatch} isLive={selectedMatch.status === "LIVE"} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <RenderMatchList list={upcoming} title="Upcoming Matches" />
        <RenderMatchList list={completed} title="Completed Matches" />
        {upcoming.length === 0 && completed.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-lg">No fixtures available</div>
        )}
      </div>
    </div>
  );
}