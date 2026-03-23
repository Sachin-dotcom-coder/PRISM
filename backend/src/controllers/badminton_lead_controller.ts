import BadmintonMatch from "../models/badminton_model";
export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    // Only completed matches
    const matches = await BadmintonMatch.find({ match_status: "completed" });
    // Get group info for each team from leaderboard
    const leaderboardEntries = await BadmintonLeaderboard.find();
    
    // Key by category_deptName to avoid mixing boys and girls from same dept
    const deptCategoryMap: Record<string, { group: string }> = {};
    leaderboardEntries.forEach(entry => {
      deptCategoryMap[`${entry.category}_${entry.dept_name}`] = { group: entry.group || "A" };
    });

    const standings: Record<string, { dept_name: string; group: string; category: string; wins: number; losses: number; matches: number }> = {};

    for (const match of matches) {
      const category = match.gender === "men" ? "boys" : "girls";
      const t1 = match.team1_department;
      const t2 = match.team2_department;
      const winner = match.winner;
      
      const key1 = `${category}_${t1}`;
      const key2 = `${category}_${t2}`;

      const group1 = deptCategoryMap[key1]?.group || "Unknown";
      const group2 = deptCategoryMap[key2]?.group || "Unknown";

      if (!standings[key1]) standings[key1] = { dept_name: t1, category, group: group1, wins: 0, losses: 0, matches: 0 };
      if (!standings[key2]) standings[key2] = { dept_name: t2, category, group: group2, wins: 0, losses: 0, matches: 0 };

      standings[key1].matches++;
      standings[key2].matches++;

      if (winner === t1) {
        standings[key1].wins++;
        standings[key2].losses++;
      } else if (winner === t2) {
        standings[key2].wins++;
        standings[key1].losses++;
      }
    }

    // Group standings by group
    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
      // Frontend expects the group array to contain the standings items
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });
    
    // Sort each group by wins desc, then losses asc
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.wins - a.wins || Math.abs(a.losses) - Math.abs(b.losses) || b.matches - a.matches);
    });
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute standings", error: (error as Error).message || error });
  }
};
import { Request, Response } from "express";
import BadmintonLeaderboard from "../models/badminton_lead_model";

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
