

// ─── GET COMPUTED LEADERBOARD ─────────────────────────────────────────────────
// Returns standings grouped by category → group, with computed stats
// GET /api/volleyball-leaderboard/standings?category=boys
// GET /api/volleyball-leaderboard/standings          (returns both boys & girls)
// volley_lead_controller.ts (Corrected)
import { Request, Response } from "express";
import VolleyballLeaderboard from "../models/volley_lead_model";
import VolleyballMatch from "../models/volleyball_model";

const computeStats = async (dept_name: string, category: string) => {
  // Map leaderboard "boys/girls" or "men/women" to match "men/women"
  const matchGender = (category === "boys" || category === "men") ? "men" : "women";

  // Filter matches using the correct field names from volleyball_model.ts
  const matches = await VolleyballMatch.find({
    gender: matchGender,
    match_stage: "league", // Only league matches count for leaderboard
    match_status: "completed",
    $or: [{ team1_department: dept_name }, { team2_department: dept_name }],
  });

  let played = 0;
  let wins = 0;
  let losses = 0;

  for (const match of matches) {
    played++;
    if (match.winner === dept_name) {
      wins++;
    } else {
      losses++;
    }
  }

  const points = wins * 3; // Win = 3pts, Loss = 0pts (Volleyball standard)
  return { 
    played, 
    wins, 
    losses, 
    points,
    Won: String(wins),
    Lost: String(losses),
    Matches: String(played),
    pointsStr: String(points)
  };
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


export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category: queryCategory } = req.query; // "men" or "women" (or legacy "boys"/"girls")
    
    // Robust category filter supporting multiple naming conventions (case-insensitive)
    let categoryFilter: any = queryCategory;
    if (queryCategory) {
      const q = String(queryCategory).toLowerCase();
      if (q === "men" || q === "boys") {
        categoryFilter = { $in: ["men", "boys", "Men", "Boys", "BOYS", "MEN"] };
      } else if (q === "women" || q === "girls") {
        categoryFilter = { $in: ["women", "girls", "Women", "Girls", "GIRLS", "WOMEN"] };
      }
    }

    const filter: any = {};
    if (queryCategory) filter.category = categoryFilter;

    const entries = await VolleyballLeaderboard.find(filter).sort({ group: 1 });

    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const stats = await computeStats(entry.dept_name, entry.category);
        
        // Prioritize calculated stats if they move past zero, but allow manual overrides
        const wonVal = (entry.Won && entry.Won !== "0") ? entry.Won : stats.Won;
        const lostVal = (entry.Lost && entry.Lost !== "0") ? entry.Lost : stats.Lost;
        const matchesVal = (entry.Matches && entry.Matches !== "0") ? entry.Matches : stats.Matches;
        const pointsVal = (entry.points && entry.points !== "0") ? entry.points : String(stats.points);

        return {
          _id: entry._id,
          dept_name: entry.dept_name,
          category: entry.category,
          group: entry.group,
          ...stats,
          points: Number(pointsVal),
          Won: wonVal,
          Lost: lostVal,
          Matches: matchesVal,
        };
      })
    );

    const result: Record<string, any> = {};
    for (const row of enriched) {
      if (!result[row.group]) result[row.group] = [];
      result[row.group].push(row);
    }

    // Sort teams within each group by points desc
    Object.keys(result).forEach(grp => {
      result[grp].sort((a: any, b: any) => (b.points - a.points) || (b.wins - a.wins));
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed", error: (error as Error).message });
  }
};
// ... (rest of the controller functions remain as they were)
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
