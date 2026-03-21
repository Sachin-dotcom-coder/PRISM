"use client";

import useSWR from "swr";
import { useGender } from "@/app/components/Providers";
import SportScoreBar from "./SportScoreBar";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
});

function normalizeMatch(match: any, sportSource: string) {
  const sport = (match.sport || sportSource || "Unknown").toLowerCase();
  const status: string = (match.status || "").toUpperCase();

  let team1 = "Team 1";
  let team2 = "Team 2";
  let score1: number | string = match.score?.team1 ?? 0;
  let score2: number | string = match.score?.team2 ?? 0;
  let time = match.startTime || match.time || "";
  let battingTeam: string | undefined;
  let specialScore: string | undefined;

  if (sport === "football") {
    team1 = match.teams?.team1 || match.team1 || match.team1_department || "Team 1";
    team2 = match.teams?.team2 || match.team2 || match.team2_department || "Team 2";
  } else {
    // cricket/kabaddi generic model
    team1 = match.teams?.team1?.shortName || match.teams?.team1?.name || match.teams?.team1 || match.team1 || "Team 1";
    team2 = match.teams?.team2?.shortName || match.teams?.team2?.name || match.teams?.team2 || match.team2 || "Team 2";

    if (match.scores) {
      score1 = match.scores?.team1 ?? score1;
      score2 = match.scores?.team2 ?? score2;
    }

    if (match.innings && match.innings.length > 0) {
      const inn = match.innings[match.current_innings - 1] || match.innings[0];
      if (inn) {
        battingTeam = inn.team || inn.batting_team || "";
        const runs = inn.runs ?? 0;
        const wickets = inn.wickets ?? 0;
        const overs = inn.overs ?? "";
        specialScore = `${runs}/${wickets}`;
        time = typeof overs === "number" ? `${overs} ov` : `${overs}`;
        if (sport === "cricket") {
          score1 = specialScore;
          score2 = "";
        }
      }
    }
  }

  // If status has defined current state words
  if (status === "FIRST_HALF" || status === "SECOND_HALF" || status === "HALF_TIME" || status === "ONGOING") {
    time = status;
  }

  if (!time && status !== "UPCOMING") {
    time = status;
  }

  return {
    id: match.match_id || match._id || `${sport}-${team1}-${team2}`,
    sport: sport.toUpperCase(),
    title: `${team1} vs ${team2}`,
    status,
    team1,
    team2,
    score1,
    score2,
    time,
    battingTeam,
    specialScore,
  };
}

const getSortedMatches = (matches: any[]) => {
  const livePred = (m: any) => ["LIVE", "FIRST_HALF", "SECOND_HALF", "HALF_TIME", "ONGOING"].includes((m.status || "").toUpperCase());
  const completedPred = (m: any) => (m.status || "").toUpperCase() === "COMPLETED";

  const live = matches.filter(livePred);
  const completed = matches.filter(completedPred);

  if (live.length > 0) {
    return [...live.slice(0, 5), ...completed.slice(0, Math.max(0, 5 - live.length))].slice(0, 5);
  }

  return completed.slice(0, 5);
};

export default function LiveScoreSection() {
  const { gender } = useGender();

  const { data: cricketMatches, error: cricketError } = useSWR(`/api/matches?gender=${gender}`, fetcher, { refreshInterval: 10000 });
  const { data: footballMatches, error: footballError } = useSWR(`/api/football/matches?gender=${gender}`, fetcher, { refreshInterval: 10000 });

  const cricketList = Array.isArray(cricketMatches) ? cricketMatches : [];
  const footballList = Array.isArray(footballMatches) ? footballMatches : [];

  const normalized = [
    ...cricketList.map((m: any) => normalizeMatch(m, "cricket")),
    ...footballList.map((m: any) => normalizeMatch(m, "football")),
  ];

  const displayMatches = getSortedMatches(normalized);

  const isLoading = !cricketMatches && !footballMatches;
  const hasError = cricketError || footballError;

  if (hasError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 text-center text-red-400 bg-black/40 rounded-xl">
        Failed to load live scores.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 text-center text-zinc-400 bg-black/40 rounded-xl animate-pulse">
        Loading live scores...
      </div>
    );
  }

  if (displayMatches.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 text-center text-zinc-400 bg-black/40 rounded-xl">
        No live or completed games available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayMatches.map((game) => (
        <SportScoreBar
          key={game.id}
          sport={game.sport}
          match={game.title}
          time={game.time || ""}
          score1={game.score1 ?? "0"}
          score2={game.score2 ?? "0"}
          battingTeam={game.battingTeam}
          specialScore={game.specialScore}
        />
      ))}
    </div>
  );
}
