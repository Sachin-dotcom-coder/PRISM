import { Request, Response } from "express";
import BadmintonMatch from "../models/badminton_model";
import BadmintonLeaderboard from "../models/badminton_lead_model";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category: queryCategory } = req.query;

    let categoryFilter: any = queryCategory;
    if (queryCategory) {
      const q = String(queryCategory).toLowerCase();
      if (q === "men" || q === "boys") categoryFilter = { $in: ["men", "boys", "Men", "Boys", "MEN", "BOYS"] };
      else if (q === "women" || q === "girls") categoryFilter = { $in: ["women", "girls", "Women", "Girls", "WOMEN", "GIRLS"] };
    }

    const filter: any = {};
    if (queryCategory) filter.category = categoryFilter;

    // Get group info for each team from leaderboard
    const leaderboardEntries = await BadmintonLeaderboard.find(filter);
    
    // Key by category_deptName to avoid mixing boys and girls from same dept
    const deptCategoryMap: Record<string, { group: string }> = {};
    leaderboardEntries.forEach(entry => {
      deptCategoryMap[`${entry.category}_${entry.dept_name}`] = { group: entry.group || "A" };
    });

    const normalizeCat = (c: string) => {
      const s = c.toLowerCase();
      if (s === "men" || s === "boys") return "boys";
      if (s === "women" || s === "girls") return "girls";
      return s;
    };

    const standings: Record<string, { dept_name: string; group: string; category: string; wins: number; losses: number; matches: number }> = {};

    // Initialize standings with all teams from leaderboard entries
    leaderboardEntries.forEach(entry => {
      const cat = normalizeCat(entry.category);
      const key = `${cat}_${entry.dept_name}`;
      standings[key] = { 
        dept_name: entry.dept_name, 
        category: cat,
        group: entry.group || "A", 
        wins: 0, 
        losses: 0, 
        matches: 0 
      };
    });

    // Match gender from category
    let genderFilter: string | undefined = undefined;
    if (queryCategory) {
      const q = normalizeCat(String(queryCategory));
      genderFilter = (q === "girls") ? "women" : "men";
    }

    const matches = await BadmintonMatch.find({ 
      // Only completed matches (or default to completed if match_status not set)
      $or: [{ match_status: "completed" }, { match_status: { $exists: false } }, { match_status: "" }],
      ...(genderFilter ? { gender: genderFilter } : {})
    });

    for (const match of matches) {
      const cat = normalizeCat(match.gender || "");
      const t1 = match.team1_department;
      const t2 = match.team2_department;
      const winner = match.winner;
      
      const key1 = `${cat}_${t1}`;
      const key2 = `${cat}_${t2}`;

      if (standings[key1]) {
        standings[key1].matches++;
        if (winner === t1) {
          standings[key1].wins++;
        } else if (winner === t2) {
          standings[key1].losses++;
        }
      }

      if (standings[key2]) {
        standings[key2].matches++;
        if (winner === t2) {
          standings[key2].wins++;
        } else if (winner === t1) {
          standings[key2].losses++;
        }
      }
    }
    // Group standings by group
    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });
    
    // Sort each group
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.wins - a.wins || Math.abs(a.losses) - Math.abs(b.losses) || b.matches - a.matches);
    });
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute standings", error: (error as Error).message || error });
  }
};

export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { leaderboard_id, dept_name, category } = req.body;

    if (
      leaderboard_id === undefined ||
      !dept_name ||
      !category
    ) {
      res.status(400).json({ message: "leaderboard_id, dept_name, and category are required." });
      return;
    }

    const entry = await BadmintonLeaderboard.create(req.body);
    res.status(201).json(entry);
  } catch (error) {
    const err = error as any;
    if (err.code === 11000) {
      res.status(400).json({ message: "leaderboard_id must be unique, or this dept+category combination already exists." });
      return;
    }
    res.status(500).json({
      message: "Failed to create leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};

export const getAllLeaderboardEntries = async (req: Request, res: Response) => {
  try {
    const entries = await BadmintonLeaderboard.find();
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leaderboard entries",
      error: (error as Error).message || error,
    });
  }
};

export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const entry = await BadmintonLeaderboard.findOne({ leaderboard_id: Number(req.params.id) });
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found" });
      return;
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};

export const updateLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entry = await BadmintonLeaderboard.findOneAndUpdate(
      { leaderboard_id: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found" });
      return;
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};

export const deleteLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entry = await BadmintonLeaderboard.findOneAndDelete({ leaderboard_id: Number(req.params.id) });
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found" });
      return;
    }
    res.status(200).json({ message: "Leaderboard entry deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};
