import { Request, Response } from "express";
import VolleyballLeaderboard from "../models/volley_lead_model";
import VolleyballMatch from "../models/volleyball_model";

// ─── HELPER: compute stats for a dept in a category from league matches ───────
const computeStats = async (dept_name: string, category: string) => {
  // Only count completed league matches involving this dept
  const matches = await VolleyballMatch.find({
    category,
    stage: "league",
    status: "completed",
    $or: [{ dept_name1: dept_name }, { dept_name2: dept_name }],
  });

  let played = 0;
  let wins = 0;
  let losses = 0;

  for (const match of matches) {
    played++;
    if (match.winner_dept === dept_name) {
      wins++;
    } else {
      losses++;
    }
  }

  const points = wins * 3; // Win = 3pts, Loss = 0pts

  return { played, wins, losses, points };
};

// ─── CREATE a leaderboard entry ───────────────────────────────────────────────
export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entry = await VolleyballLeaderboard.create(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error("Failed to create leaderboard entry", error);
    res.status(500).json({
      message: "Failed to create leaderboard entry",
      error: (error as Error).message || error,
      details: (error as any).errors || null,
    });
  }
};

// ─── READ ALL leaderboard entries (raw, no stats) ────────────────────────────
export const getAllLeaderboardEntries = async (req: Request, res: Response) => {
  try {
    const entries = await VolleyballLeaderboard.find().sort({ category: 1, group: 1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Failed to fetch leaderboard entries", error);
    res.status(500).json({
      message: "Failed to fetch leaderboard entries",
      error: (error as Error).message || error,
    });
  }
};

// ─── GET COMPUTED LEADERBOARD ─────────────────────────────────────────────────
// Returns standings grouped by category → group, with computed stats
// GET /api/volleyball-leaderboard/standings?category=boys
// GET /api/volleyball-leaderboard/standings          (returns both boys & girls)
export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;

    const entries = await VolleyballLeaderboard.find(filter).sort({ group: 1 });

    // Enrich each entry with computed stats
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const stats = await computeStats(entry.dept_name, entry.category);
        return {
          _id: entry._id,
          dept_name: entry.dept_name,
          category: entry.category,
          group: entry.group,
          ...stats,
        };
      })
    );

    // Group by category → group
    // Result shape: { boys: { A: [...], B: [...] }, girls: { A: [...], B: [...] } }
    const result: Record<string, Record<string, typeof enriched>> = {};

    for (const row of enriched) {
      if (!result[row.category]) result[row.category] = {};
      if (!result[row.category][row.group]) result[row.category][row.group] = [];

      // Sort by points desc within each group
      result[row.category][row.group].push(row);
    }

    // Sort teams within each group by points descending
    for (const cat of Object.keys(result)) {
      for (const grp of Object.keys(result[cat])) {
        result[cat][grp].sort((a, b) => b.points - a.points);
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch leaderboard standings", error);
    res.status(500).json({
      message: "Failed to fetch leaderboard standings",
      error: (error as Error).message || error,
    });
  }
};

// ─── READ ONE leaderboard entry by id ────────────────────────────────────────
export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const entry = await VolleyballLeaderboard.findById(req.params.id);
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found" });
      return;
    }
    res.status(200).json(entry);
  } catch (error) {
    console.error("Failed to fetch leaderboard entry", error);
    res.status(500).json({
      message: "Failed to fetch leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};

// ─── UPDATE a leaderboard entry by id ────────────────────────────────────────
export const updateLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entry = await VolleyballLeaderboard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found" });
      return;
    }
    res.status(200).json(entry);
  } catch (error) {
    console.error("Failed to update leaderboard entry", error);
    res.status(500).json({
      message: "Failed to update leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};

// ─── DELETE a leaderboard entry by id ────────────────────────────────────────
export const deleteLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entry = await VolleyballLeaderboard.findByIdAndDelete(req.params.id);
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found" });
      return;
    }
    res.status(200).json({ message: "Leaderboard entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete leaderboard entry", error);
    res.status(500).json({
      message: "Failed to delete leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};
