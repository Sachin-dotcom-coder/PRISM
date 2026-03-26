import TTMatch from "../models/TT.model";
import TTLeaderboard from "../models/TT_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category: queryCategory } = req.query;
    
    // Determine the equivalent match gender for the requested category
    let matchGender: string | undefined = undefined;
    if (queryCategory === "boys") matchGender = "men";
    else if (queryCategory === "girls") matchGender = "women";

    const matchQuery = matchGender ? { gender: matchGender, match_status: "completed" } : { match_status: "completed" };
    const matches = await TTMatch.find(matchQuery);
    
    // Support both "boys"/"girls" and "men"/"women" in the leaderboard database
    const categoryFilter = queryCategory === "boys" 
      ? { $in: ["boys", "men"] } 
      : queryCategory === "girls" 
        ? { $in: ["girls", "women"] } 
        : queryCategory;

    const leadQuery = queryCategory ? { category: categoryFilter } : {};
    const leaderboardEntries = await TTLeaderboard.find(leadQuery);
    
    const standings: Record<string, { 
      dept_name: string; 
      group: string; 
      wins: number; 
      losses: number; 
      matches: number;
      points: string;
      played: number;
    }> = {};

    // 1. Initialize standings for all registered departments in this category
    leaderboardEntries.forEach(entry => {
      standings[entry.dept_name] = { 
        dept_name: entry.dept_name, 
        group: entry.group || "A", 
        wins: 0, 
        losses: 0, 
        matches: 0,
        points: entry.points || "0",
        played: entry.played || 0
      };
    });

    // 2. Process match results to update standings
    for (const match of matches) {
      const t1 = match.team1_department;
      const t2 = match.team2_department;

      // Only update if department is in the registered leaderboard for this category
      if (standings[t1]) {
        standings[t1].matches++;
        if (match.winner === t1) standings[t1].wins++;
        else if (match.winner === t2) standings[t1].losses++;
      }
      
      if (standings[t2]) {
        standings[t2].matches++;
        if (match.winner === t2) standings[t2].wins++;
        else if (match.winner === t1) standings[t2].losses++;
      }
    }

    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });

    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => 
        (Number(b.points) - Number(a.points)) || 
        (b.wins - a.wins) || 
        (a.losses - b.losses) || 
        (b.matches - a.matches)
      );
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
    const entry = new TTLeaderboard({ leaderboard_id, dept_name, category, group });
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
    const entries = await TTLeaderboard.find();
    res.status(200).json({ data: entries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entries", error: (error as Error).message || error });
  }
};

export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await TTLeaderboard.findOne({ leaderboard_id: Number(id) });
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
    const updated = await TTLeaderboard.findOneAndUpdate(
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
    const deleted = await TTLeaderboard.findOneAndDelete({ leaderboard_id: Number(id) });
    if (!deleted) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ message: "Entry deleted.", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete entry", error: (error as Error).message || error });
  }
};
