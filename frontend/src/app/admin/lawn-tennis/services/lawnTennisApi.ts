import { ILawnTennisMatch } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export const getMatches = async (gender: "men" | "women"): Promise<ILawnTennisMatch[]> => {
  const res = await fetch(`${BASE_URL}/tennis?gender=${gender}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
};

export const getMatch = async (match_id: string, gender: "men" | "women"): Promise<ILawnTennisMatch> => {
  const res = await fetch(`${BASE_URL}/tennis/${match_id}?gender=${gender}`);
  if (!res.ok) throw new Error(`Failed to fetch match ${match_id}`);
  return res.json();
};

export const createMatch = async (data: Omit<ILawnTennisMatch, "_id">): Promise<ILawnTennisMatch> => {
  const res = await fetch(`${BASE_URL}/tennis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMessage = errorBody.error || await res.text() || "Failed to create match";
    throw new Error(errorMessage);
  }
  return res.json();
};

export const updateMatch = async (match_id: string, data: Partial<ILawnTennisMatch>): Promise<ILawnTennisMatch> => {
  const res = await fetch(`${BASE_URL}/tennis/${match_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMessage = errorBody.error || await res.text() || "Failed to update match";
    throw new Error(errorMessage);
  }
  return res.json();
};

export const deleteMatch = async (match_id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/tennis/${match_id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete match ${match_id}`);
};
