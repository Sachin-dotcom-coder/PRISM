export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    // Only completed events
    const events = await AthleticsEvent.find({ event_status: "completed" });
    // Get group info for each team from leaderboard
    const leaderboardEntries = await AthleticsLeaderboard.find();
    const deptToGroup: Record<string, string> = {};
    leaderboardEntries.forEach(entry => {
      deptToGroup[entry.dept_name] = entry.group;
    });

    // Standings: dept_name -> { dept_name, group, points, participations }
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
import { Request, Response } from "express";
import AthleticsLeaderboard from "../models/athletics_lead_model";
import AthleticsEvent from "../models/athletics_model";

const computeStats = async (
  dept_name: string,
  event_name: string,
  category: string
) => {
  const events = await AthleticsEvent.find({
    event_name,
    event_status: "completed",
  });

  let best_performance = 0;
  let rank: number | null = null;
  let participations = 0;

  for (const event of events) {
    const participant = event.participants.find(
      (p) => p.department.toLowerCase() === dept_name.toLowerCase()
    );
    if (participant) {
      participations++;
      if (participant.best_performance > best_performance) {
        best_performance = participant.best_performance;
        rank = participant.rank ?? null;
      }
    }
  }

  return { participations, best_performance, rank };
};

export const createLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const { leaderboard_id, dept_name, event_name, category } = req.body;

    if (leaderboard_id === undefined || !dept_name || !event_name || !category) {
      res.status(400).json({ message: "leaderboard_id, dept_name, event_name and category are required." });
      return;
    }

    const entry = await AthleticsLeaderboard.create(req.body);
    res.status(201).json(entry);
  } catch (error) {
    const err = error as any;
    if (err.code === 11000) {
      res.status(400).json({ message: "leaderboard_id must be unique, or this dept+event+category combination already exists." });
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
    const entries = await AthleticsLeaderboard.find().sort({ leaderboard_id: 1 });
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
    const entry = await AthleticsLeaderboard.findOne({
      leaderboard_id: Number(req.params.id),
    });
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found." });
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
    const entry = await AthleticsLeaderboard.findOneAndUpdate(
      { leaderboard_id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found." });
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
    const entry = await AthleticsLeaderboard.findOneAndDelete({
      leaderboard_id: Number(req.params.id),
    });
    if (!entry) {
      res.status(404).json({ message: "Leaderboard entry not found." });
      return;
    }
    res.status(200).json({ message: "Leaderboard entry deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete leaderboard entry",
      error: (error as Error).message || error,
    });
  }
};