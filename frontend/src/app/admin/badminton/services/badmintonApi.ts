import { IBadmintonMatch } from "../types";

// Prefer NEXT_PUBLIC_BACKEND_URL if set, else fallback to standard Express URL
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const getMatches = async (): Promise<IBadmintonMatch[]> => {
  const res = await fetch(`${BASE_URL}/badminton`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
};

export const getMatch = async (match_id: number): Promise<IBadmintonMatch> => {
  const res = await fetch(`${BASE_URL}/badminton/${match_id}`);
  if (!res.ok) throw new Error(`Failed to fetch match ${match_id}`);
  return res.json();
};

export const createMatch = async (data: Omit<IBadmintonMatch, "_id">): Promise<IBadmintonMatch> => {
  const res = await fetch(`${BASE_URL}/badminton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create match");
  }
  return res.json();
};

export const updateMatch = async (match_id: number, data: Partial<IBadmintonMatch>): Promise<IBadmintonMatch> => {
  const res = await fetch(`${BASE_URL}/badminton/${match_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to update match ${match_id}`);
  }
  return res.json();
};

export const deleteMatch = async (match_id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/badminton/${match_id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete match ${match_id}`);
};
