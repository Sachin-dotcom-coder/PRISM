import { Request, Response } from "express";
import TennisLeaderboard from "../models/tennis_lead_model";
import TennisMatch from "../models/tennis_model";

// ─── CREATE a leaderboard entry ───────────────────────────────────────────────
export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entry = await TennisLeaderboard.create(req.body);
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
    const entries = await TennisLeaderboard.find().sort({ category: 1, group: 1 });
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
export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category: queryCategory } = req.query;

    const normalizeCat = (c: string) => {
      const s = String(c || "").toLowerCase();
      if (s === "men" || s === "boys") return "boys";
      if (s === "women" || s === "girls") return "girls";
      return s;
    };

    let categoryFilter: any = queryCategory;
    if (queryCategory) {
      const q = normalizeCat(String(queryCategory));
      if (q === "boys") categoryFilter = { $in: ["boys", "men", "Boys", "Men", "BOYS", "MEN"] };
      else if (q === "girls") categoryFilter = { $in: ["girls", "women", "Girls", "Women", "GIRLS", "WOMEN"] };
    }

    const filter: any = {};
    if (queryCategory) filter.category = categoryFilter;

    const leaderboardEntries = await TennisLeaderboard.find(filter);
    
    const standings: Record<string, { 
      dept_name: string; 
      group: string; 
      category: string; 
      wins: number; 
      losses: number; 
      matches: number;
    }> = {};

    // Initialize with all teams from leaderboard
    leaderboardEntries.forEach(entry => {
      const cat = normalizeCat(entry.category);
      const key = `${cat}_${entry.dept_name}`;
      standings[key] = { 
        dept_name: entry.dept_name, 
        group: entry.group || "A", 
        category: cat,
        wins: 0, 
        losses: 0, 
        matches: 0 
      };
    });

    // Determine gender filter for matches based on category
    let genderFilter: string | undefined = undefined;
    if (queryCategory) {
      const q = normalizeCat(String(queryCategory));
      genderFilter = (q === "girls") ? "women" : "men";
    }

    const matches = await TennisMatch.find({ 
      status: "completed",
      stage: "league",
      ...(genderFilter ? { gender: genderFilter } : {})
    });

    for (const match of matches) {
      const cat = normalizeCat(match.gender || "");
      const t1 = match.dept_name1;
      const t2 = match.dept_name2;
      const winner = match.winner_dept;
      
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

    // Group by category → group
    const result: Record<string, Record<string, any[]>> = {};

    Object.values(standings).forEach(s => {
      const cat = s.category;
      const grp = s.group;
      const points = s.wins * 3;

      if (!result[cat]) result[cat] = {};
      if (!result[cat][grp]) result[cat][grp] = [];

      result[cat][grp].push({
        ...s,
        points
      });
    });

    // Sort teams within each group by points descending
    for (const cat of Object.keys(result)) {
      for (const grp of Object.keys(result[cat])) {
        result[cat][grp].sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses);
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
    const entry = await TennisLeaderboard.findById(req.params.id);
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
    const entry = await TennisLeaderboard.findByIdAndUpdate(
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
    const entry = await TennisLeaderboard.findByIdAndDelete(req.params.id);
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