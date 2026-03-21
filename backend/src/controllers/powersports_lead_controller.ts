import PowersportsEvent from "../models/powersports_model";
import PowersportsLeaderboard from "../models/powersports_lead_model";
import { Request, Response } from "express";

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    // Only completed events
    const events = await PowersportsEvent.find({ event_status: "completed" });
    const leaderboardEntries = await PowersportsLeaderboard.find();
    const deptToGroup: Record<string, string> = {};
    leaderboardEntries.forEach(entry => {
      deptToGroup[entry.dept_name] = entry.group;
    });

    const standings: Record<string, { dept_name: string; group: string; points: number; participations: number }> = {};

    for (const event of events) {
      for (const participant of event.participants || []) {
        const dept = participant.department;
        const group = deptToGroup[dept] || "Unknown";
        if (!standings[dept]) standings[dept] = { dept_name: dept, group, points: 0, participations: 0 };
        standings[dept].participations++;
        // Award points for rank (e.g., 1st=5, 2nd=3, 3rd=1)
        if (participant.rank === 1) standings[dept].points += 5;
        else if (participant.rank === 2) standings[dept].points += 3;
        else if (participant.rank === 3) standings[dept].points += 1;
      }
    }

    // Group standings by group
    const grouped: Record<string, any[]> = {};
    Object.values(standings).forEach(entry => {
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
    const { leaderboard_id, dept_name, category, group } = req.body;
    if (!leaderboard_id || !dept_name || !category || !group) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }
    const entry = new PowersportsLeaderboard({ leaderboard_id, dept_name, category, group });
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
    const entries = await PowersportsLeaderboard.find();
    res.status(200).json({ data: entries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entries", error: (error as Error).message || error });
  }
};

export const getLeaderboardEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await PowersportsLeaderboard.findOne({ leaderboard_id: Number(id) });
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
    const updated = await PowersportsLeaderboard.findOneAndUpdate(
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
    const deleted = await PowersportsLeaderboard.findOneAndDelete({ leaderboard_id: Number(id) });
    if (!deleted) {
      res.status(404).json({ message: "Entry not found." });
      return;
    }
    res.status(200).json({ message: "Entry deleted.", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete entry", error: (error as Error).message || error });
  }
};
