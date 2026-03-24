import PowersportsEvent from "../models/powersports_model";
import PowersportsLeaderboard from "../models/powersports_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const gender = req.query.gender ? String(req.query.gender) : undefined;
    const genderQuery = gender === "men" ? "M" : (gender === "women" ? "F" : undefined);
    
    // Only completed events
    const events = await PowersportsEvent.find({
      event_status: "completed",
      ...(gender ? { gender } : {})
    });
    
    const query = genderQuery ? { gender: genderQuery } : {};
    const leaderboardEntries = await PowersportsLeaderboard.find(query);

    const standings = leaderboardEntries.map(entry => ({
      _id: entry._id.toString(),
      dept_name: entry.dept_name,
      category: entry.category,
      group: entry.group,
      gender: entry.gender,
      points: 0,
      participations: 0
    }));

    for (const event of events) {
      const matchDept1 = standings.find(s => s.dept_name === event.department_1 && s.category === event.category);
      if (matchDept1) matchDept1.participations++;

      const matchDept2 = standings.find(s => s.dept_name === event.department_2 && s.category === event.category);
      if (matchDept2) matchDept2.participations++;

      if (event.winner) {
        const matchWinner = standings.find(s => s.dept_name === event.winner && s.category === event.category);
        if (matchWinner) matchWinner.points += 5;
      }
    }

    // Group standings by group
    const grouped: Record<string, any[]> = {};
    standings.forEach(entry => {
      if (!grouped[entry.group]) grouped[entry.group] = [];
      grouped[entry.group].push(entry);
    });
    // Sort each group by points desc, then participations desc
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => b.points - a.points || b.participations - a.participations);
    });
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute standings", error: (error as Error).message || error });
  }
};

export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { dept_name, category, group, gender } = req.body;
    if (!dept_name || !category || !group || !gender) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }
    const entry = new PowersportsLeaderboard({ dept_name, category, group, gender });
    await entry.save();
    res.status(201).json({ message: "Leaderboard entry created.", data: entry });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Duplicate department/category/gender combination." });
      return;
    }
    res.status(500).json({ message: "Failed to create entry", error: error.message });
  }
};

export const getAllLeaderboardEntries = async (req: Request, res: Response) => {
  try {
    const entries = await PowersportsLeaderboard.find();
    res.status(200).json({ data: entries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entries", error: (error as Error).message || error });
  }
};

export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await PowersportsLeaderboard.findById(id);
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
    const updated = await PowersportsLeaderboard.findByIdAndUpdate(
      id,
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
    const deleted = await PowersportsLeaderboard.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ message: "Entry deleted.", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete entry", error: (error as Error).message || error });
  }
};
