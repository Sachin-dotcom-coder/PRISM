import HandballMatch from "../models/handball_model";
import HandballLeaderboard from "../models/handball_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    // Only completed matches
    const matches = await HandballMatch.find({ match_status: "completed" });
    // Get group info for each team from leaderboard
    const leaderboardEntries = await HandballLeaderboard.find();
    const deptToGroup: Record<string, string> = {};
    leaderboardEntries.forEach(entry => {
      deptToGroup[entry.dept_name] = entry.group;
    });

    const standings: Record<string, { dept_name: string; group: string; wins: number; losses: number; matches: number }> = {};

    for (const match of matches) {
      const t1 = match.team1_name;
      const t2 = match.team2_name;
      const winner = match.winner;
      const group1 = deptToGroup[t1] || "Unknown";
      const group2 = deptToGroup[t2] || "Unknown";

      if (!standings[t1]) standings[t1] = { dept_name: t1, group: group1, wins: 0, losses: 0, matches: 0 };
      if (!standings[t2]) standings[t2] = { dept_name: t2, group: group2, wins: 0, losses: 0, matches: 0 };

      standings[t1].matches++;
      standings[t2].matches++;

      if (winner === t1) {
        standings[t1].wins++;
        standings[t2].losses++;
      } else if (winner === t2) {
        standings[t2].wins++;
        standings[t1].losses++;
      }
    }

    // Group standings by group
    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
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
