import BasketballMatch from "../models/basketball_model";
export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category } = req.query; // "boys" or "girls"
    
    // Map leaderboard category to match gender
    const matchGender = category === "boys" ? "men" : "women";

    // 1. Only fetch matches for the SPECIFIC gender/category
    const matches = await BasketballMatch.find({ 
      match_status: "completed",
      gender: matchGender 
    });

    // 2. Only fetch leaderboard entries for that category
    const leaderboardEntries = await BasketballLeaderboard.find(category ? { category } : {});
    
    const deptToGroup: Record<string, string> = {};
    leaderboardEntries.forEach(entry => {
      deptToGroup[entry.dept_name] = entry.group;
    });

    const standings: Record<string, any> = {};

    // Initialize standings for all departments in this category (even if they haven't played)
    leaderboardEntries.forEach(entry => {
      standings[entry.dept_name] = { 
        dept_name: entry.dept_name, 
        group: entry.group, 
        wins: 0, 
        losses: 0, 
        matches: 0 
      };
    });

    for (const match of matches) {
      const t1 = match.team1_department;
      const t2 = match.team2_department;
      const winner = match.winner;

      // Only process if the departments exist in this category's leaderboard
      if (standings[t1]) {
        standings[t1].matches++;
        if (winner === t1) standings[t1].wins++;
        else if (winner === t2) standings[t1].losses++;
      }
      
      if (standings[t2]) {
        standings[t2].matches++;
        if (winner === t2) standings[t2].wins++;
        else if (winner === t1) standings[t2].losses++;
      }
    }

    // Group and Sort logic remains the same...
    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });

    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    });

    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute standings", error: (error as Error).message });
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
