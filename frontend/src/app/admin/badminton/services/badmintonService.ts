// badmintonService.ts
// Handles API calls for the Badminton Leaderboard admin page

export type BTeam = {
  _id?: string;
  leaderboard_id: number;
  dept_name: string;
  event_name: "singles" | "doubles";
  category: "boys" | "girls";
  group: string;
  wins?: number;
  losses?: number;
  matches?: number;
};

const API_BASE = "/api/badminton-leaderboard";

export const fetchStandings = async () => {
  const res = await fetch(`${API_BASE}/standings`);
  if (!res.ok) throw new Error("Failed to fetch standings");
  return res.json();
};

export const fetchEntries = async () => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch entries");
  return res.json();
};

export const addEntry = async (newEntry: Partial<BTeam>) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newEntry)
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.message || "Failed to add entry");
  }
  return res.json();
};

export const updateEntry = async (t: BTeam) => {
  const res = await fetch(`${API_BASE}/${t.leaderboard_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (!res.ok) throw new Error("Failed to update entry");
  return res.json();
};

export const deleteEntry = async (id: number) => {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete entry");
  return res.json();
};
