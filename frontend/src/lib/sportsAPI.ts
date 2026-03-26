// lib/sportsApi.ts
// Centralised fetch helpers for all PRISM sports APIs.

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// Handles both { success, data: [...] } and raw [...] API responses safely.
function unwrapArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const r = response as { success?: boolean; data?: T[] };
  if (r && Array.isArray(r.data)) return r.data;
  console.warn("Unexpected API response shape:", response);
  return [];
}

// Normalise match_type — backend may send "Singles"/"Doubles" (capitalised)
export function normaliseMatchType(t?: string): string {
  return (t ?? "").toLowerCase();
}

// ─── Shared response shapes ───────────────────────────────────────────────────

export interface StandingRow {
  dept_name: string;
  group: string;
  category?: string;
  wins: number;
  losses: number;
  matches: number;
  points?: number | string;
  played?: number;
}

export type GroupedStandings = Record<string, StandingRow[]>;

// ─── Basketball ───────────────────────────────────────────────────────────────

export interface BasketballGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface BasketballMatch {
  _id: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: string;
  venue?: string;
  games: BasketballGame[];
  total_games: number;
  winner: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchBasketballMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/basketball?gender=${gender}`)
    .then((r) => unwrapArray<BasketballMatch>(r));

export const fetchBasketballStandings = (category: "boys" | "girls") =>
  apiFetch<GroupedStandings>(`/basketball-leaderboard/standings?category=${category}`);

// ─── Badminton ────────────────────────────────────────────────────────────────

export interface BadmintonGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface BadmintonMatch {
  _id: string;
  match_id: number;
  match_stage: string;
  match_type: string;   // use normaliseMatchType() when comparing
  team1_department: string;
  team2_department: string;
  match_date: string;
  venue?: string;
  games: BadmintonGame[];
  team1_score: number;
  team2_score: number;
  total_games: number;
  winner: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchBadmintonMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/badminton?gender=${gender}`)
    .then((r) => unwrapArray<BadmintonMatch>(r));

export const fetchBadmintonStandings = (category: "boys" | "girls") =>
  apiFetch<GroupedStandings>(`/badminton-leaderboard/standings?category=${category}`);

// ─── Handball ─────────────────────────────────────────────────────────────────

export interface HandballMatch {
  _id: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: string;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  winner: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchHandballMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/handball?gender=${gender}`)
    .then((r) => unwrapArray<HandballMatch>(r));

export const fetchHandballStandings = (category: "boys" | "girls") =>
  apiFetch<GroupedStandings>(`/handball-leaderboard/standings?category=${category}`);

// ─── Kho-Kho ──────────────────────────────────────────────────────────────────

export interface KhoKhoMatch {
  _id: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: string;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  winner: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchKhoKhoMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/kho-kho?gender=${gender}`)
    .then((r) => unwrapArray<KhoKhoMatch>(r));

export const fetchKhoKhoStandings = (category: "boys" | "girls") =>
  apiFetch<GroupedStandings>(`/khokho-leaderboard/standings?category=${category}`);

// ─── Lawn Tennis ──────────────────────────────────────────────────────────────

export interface TennisGame {
  tie_id: number;
  score_dept1: number;
  score_dept2: number;
  status: string;
}

export interface TennisMatch {
  _id: string;
  match_id: string;
  match_type: string;   // use normaliseMatchType() when comparing
  category: string;
  stage: string;
  dept_name1: string;
  dept_name2: string;
  games: TennisGame[];
  winner_dept?: string;
  status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchTennisMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/tennis?gender=${gender}`)
    .then((r) => unwrapArray<TennisMatch>(r));

export type TennisLeaderboardResponse = Record<string, Record<string, StandingRow[]>>;

export const fetchTennisStandings = (category: "boys" | "girls") =>
  apiFetch<TennisLeaderboardResponse>(
    `/tennis-lead/standings?category=${category}`
  );
// ─── Table Tennis ─────────────────────────────────────────────────────────────

export interface TTGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface TTMatch {
  _id: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: string;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  games: TTGame[];
  total_games: number;
  winner: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchTTMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/tabletennis?gender=${gender}`)
    .then((r) => unwrapArray<TTMatch>(r));

export const fetchTTStandings = (category: string) =>
  apiFetch<GroupedStandings>(`/tt-lead/standings?category=${category}`);

// ─── Volleyball ───────────────────────────────────────────────────────────────

export interface VolleyballGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface VolleyballMatch {
  _id: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: string;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  games: VolleyballGame[];
  total_games: number;
  winner: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
}

export const fetchVolleyballMatches = (gender: "men" | "women") =>
  apiFetch<unknown>(`/volleyball?gender=${gender}`)
    .then((r) => unwrapArray<VolleyballMatch>(r));

export const fetchVolleyballStandings = (category: "boys" | "girls") =>
  apiFetch<GroupedStandings>(`/volleyball-lead/standings?category=${category}`);