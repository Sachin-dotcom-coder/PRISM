import HandballMatch from "../models/handball_model";
import HandballLeaderboard from "../models/handball_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    // Only completed matches
    const matches = await HandballMatch.find({ match_status: "completed" });
    // Get group info for each team from leaderboard
    const leaderboardEntries = await HandballLeaderboard.find();
    
    // Key by category_deptName to avoid mixing boys and girls from same dept
    const deptCategoryMap: Record<string, { group: string }> = {};
    leaderboardEntries.forEach(entry => {
      deptCategoryMap[`${entry.category}_${entry.dept_name}`] = { group: entry.group };
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
    
    // Sort each group by wins desc, then matches desc
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.wins - a.wins || b.matches - a.matches);
    });
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute standings", error: (error as Error).message || error });
  }
};

export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { leaderboard_id, dept_name, category, group } = req.body;
    if (!leaderboard_id || !dept_name || !category || !group) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }
    const entry = new HandballLeaderboard({ leaderboard_id, dept_name, category, group });
    await entry.save();
    res.status(201).json({ message: "Leaderboard entry created.", data: entry });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Duplicate leaderboard_id or department/category." });
      return;
    }
    res.status(500).json({ message: "Failed to create entry", error: error.message });
  }
};

export const getAllLeaderboardEntries = async (req: Request, res: Response) => {
  try {
    const entries = await HandballLeaderboard.find();
    res.status(200).json({ data: entries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entries", error: (error as Error).message || error });
  }
};

export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await HandballLeaderboard.findOne({ leaderboard_id: Number(id) });
    if (!entry) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ data: entry });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entry", error: (error as Error).message || error });
  }
};

export const updateLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await HandballLeaderboard.findOneAndUpdate(
      { leaderboard_id: Number(id) },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ message: "Entry updated.", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update entry", error: (error as Error).message || error });
  }
};

export const deleteLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await HandballLeaderboard.findOneAndDelete({ leaderboard_id: Number(id) });
    if (!deleted) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ message: "Entry deleted.", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete entry", error: (error as Error).message || error });
  }
};
