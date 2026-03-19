import BasketballMatch from "../models/basketball_model";
export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    // Only completed matches
    const matches = await BasketballMatch.find({ match_status: "completed" });
    // Get group info for each team from leaderboard
    const leaderboardEntries = await BasketballLeaderboard.find();
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
    // Sort each group by wins desc, then losses asc
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    });
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute standings", error: (error as Error).message || error });
  }
};
import { Request, Response } from "express";
import BasketballLeaderboard from "../models/basketball_lead_model";

export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { leaderboard_id, dept_name, category } = req.body;

    if (
      leaderboard_id === undefined ||
      !dept_name ||
      !category
    ) {
      res.status(400).json({ message: "leaderboard_id, dept_name and category are required." });
      return;
    }

    const entry = await BasketballLeaderboard.create(req.body);
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
    const entries = await BasketballLeaderboard.find();
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
    const entry = await BasketballLeaderboard.findOne({ leaderboard_id: Number(req.params.id) });
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
    const entry = await BasketballLeaderboard.findOneAndUpdate(
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
    const entry = await BasketballLeaderboard.findOneAndDelete({ leaderboard_id: Number(req.params.id) });
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
