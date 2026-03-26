import TTMatch from "../models/TT.model";
import TTLeaderboard from "../models/TT_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { category: queryCategory } = req.query;
    
    // Determine the equivalent match gender for the requested category
    const normalizeCat = (c: string) => {
      const s = c.toLowerCase();
      if (s === "men" || s === "boys") return "boys";
      if (s === "women" || s === "girls") return "girls";
      return s;
    };

    // Match gender from category
    let genderFilter: string | undefined = undefined;
    if (queryCategory) {
      const q = normalizeCat(String(queryCategory));
      genderFilter = (q === "girls") ? "women" : "men";
    }

    const matchQuery: any = { 
      $or: [{ match_status: "completed" }, { match_status: { $exists: false } }, { match_status: "" }]
    };
    if (genderFilter) matchQuery.gender = genderFilter;

    const matches = await TTMatch.find(matchQuery);
    
    // Support both "boys"/"girls" and "men"/"women" in the leaderboard database
    let categoryFilter: any = queryCategory;
    if (queryCategory) {
      const q = normalizeCat(String(queryCategory));
      if (q === "boys") categoryFilter = { $in: ["boys", "men", "Boys", "Men", "BOYS", "MEN"] };
      else if (q === "girls") categoryFilter = { $in: ["girls", "women", "Girls", "Women", "GIRLS", "WOMEN"] };
    }

    const leadQuery = queryCategory ? { category: categoryFilter } : {};
    const leaderboardEntries = await TTLeaderboard.find(leadQuery);
    
    const standings: Record<string, { 
      dept_name: string; 
      group: string; 
      wins: number; 
      losses: number; 
      matches: number;
    }> = {};

    // 1. Initialize standings for all registered departments in this category
    leaderboardEntries.forEach(entry => {
      const cat = normalizeCat(entry.category);
      const key = `${cat}_${entry.dept_name}`;
      standings[key] = { 
        dept_name: entry.dept_name, 
        group: entry.group || "A", 
        wins: 0, 
        losses: 0, 
        matches: 0
      };
    });

    // 2. Process match results to update standings
    for (const match of matches) {
      const cat = normalizeCat(match.gender || "");
      const t1 = match.team1_department;
      const t2 = match.team2_department;
      const key1 = `${cat}_${t1}`;
      const key2 = `${cat}_${t2}`;

      // Only update if department is in the registered leaderboard for this category
      if (standings[key1]) {
        standings[key1].matches++;
        if (match.winner === t1) standings[key1].wins++;
        else if (match.winner === t2) standings[key1].losses++;
      }
      
      if (standings[key2]) {
        standings[key2].matches++;
        if (match.winner === t2) standings[key2].wins++;
        else if (match.winner === t1) standings[key2].losses++;
      }
    }

    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });

    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => 
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
