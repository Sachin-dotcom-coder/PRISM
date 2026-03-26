import { ITableTennisMatch } from "../types";

// Prefer NEXT_PUBLIC_BACKEND_URL if set, else fallback to standard Express URL
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const getMatches = async (gender: "men" | "women"): Promise<ITableTennisMatch[]> => {
  const res = await fetch(`${BASE_URL}/tabletennis?gender=${gender}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  const json = await res.json();
  return Array.isArray(json) ? json : json?.data || [];
};

export const getMatch = async (match_id: number, gender: "men" | "women"): Promise<ITableTennisMatch> => {
  const res = await fetch(`${BASE_URL}/tabletennis/${match_id}?gender=${gender}`);
  if (!res.ok) throw new Error(`Failed to fetch match ${match_id}`);
  const json = await res.json();
  return json?.data || json;
};

export const createMatch = async (data: Omit<ITableTennisMatch, "_id">): Promise<ITableTennisMatch> => {
  const res = await fetch(`${BASE_URL}/tabletennis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create match");
  }
  const json = await res.json();
  return json?.data || json;
};

export const updateMatch = async (match_id: number, data: Partial<ITableTennisMatch>): Promise<ITableTennisMatch> => {
  const res = await fetch(`${BASE_URL}/tabletennis/${match_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to update match ${match_id}`);
  }
  const json = await res.json();
  return json?.data || json;
};

export const deleteMatch = async (match_id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/tabletennis/${match_id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete match ${match_id}`);
};
