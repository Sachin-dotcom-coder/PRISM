import TugOfWarEvent from "../models/tugofwar_model";
import TugOfWarLeaderboard from "../models/tugofwar_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category: queryCategory } = req.query; // "men" or "women" (or legacy "boys"/"girls")

    // Robust category filter supporting multiple naming conventions
    let categoryFilter: any = queryCategory;
    if (queryCategory) {
      const q = String(queryCategory).toLowerCase();
      if (q === "men" || q === "boys") categoryFilter = { $in: ["men", "boys"] };
      else if (q === "women" || q === "girls") categoryFilter = { $in: ["women", "girls"] };
    }

    const leadQuery = queryCategory ? { category: categoryFilter } : {};
    const matchGender = (queryCategory === "boys" || queryCategory === "men") ? "men" : "women";

    // Only completed league/group events count for leaderboard
    const matches = await TugOfWarEvent.find({ 
      event_status: "completed",
      gender: matchGender 
    });
    const leaderboardEntries = await TugOfWarLeaderboard.find(leadQuery);
    
    // Key by dept_name for the specified category
    const standings: Record<string, { 
      dept_name: string; 
      group: string; 
      category: string; 
      wins: number; 
      losses: number; 
      matches: number;
      points: number;
    }> = {};

    // 1. Initialize standings for all registered departments in this category
    leaderboardEntries.forEach(entry => {
      standings[entry.dept_name] = { 
        dept_name: entry.dept_name, 
        group: entry.group || "A", 
        category: entry.category,
        wins: 0, 
        losses: 0, 
        matches: 0,
        points: 0
      };
    });

    // 2. Process match results
    for (const match of matches) {
      const t1 = match.department_1;
      const t2 = match.department_2;
      const winner = match.winner;
      
      if (standings[t1]) {
        standings[t1].matches++;
        if (winner === t1) {
          standings[t1].wins++;
          standings[t1].points += 3;
        } else if (winner === t2) {
          standings[t1].losses++;
        }
      }

      if (standings[t2]) {
        standings[t2].matches++;
        if (winner === t2) {
          standings[t2].wins++;
          standings[t2].points += 3;
        } else if (winner === t1) {
          standings[t2].losses++;
        }
      }
    }

    // Group standings by group
    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });
    
    // Sort each group by points desc, then wins desc
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (b.matches - a.matches));
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
    const entry = new TugOfWarLeaderboard({ leaderboard_id, dept_name, category, group });
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
    const entries = await TugOfWarLeaderboard.find();
    res.status(200).json({ data: entries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entries", error: (error as Error).message || error });
  }
};

export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await TugOfWarLeaderboard.findOne({ leaderboard_id: Number(id) });
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
    const updated = await TugOfWarLeaderboard.findOneAndUpdate(
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
    const deleted = await TugOfWarLeaderboard.findOneAndDelete({ leaderboard_id: Number(id) });
    if (!deleted) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ message: "Entry deleted.", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete entry", error: (error as Error).message || error });
  }
};
