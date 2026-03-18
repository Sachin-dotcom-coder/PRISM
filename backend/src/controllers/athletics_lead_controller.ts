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

export const getLeaderboardStandings = async (req: Request, res: Response) => {
  try {
    const { event_name, category } = req.query;

    const filter: Record<string, unknown> = {};
    if (event_name) filter.event_name = event_name;
    if (category) filter.category = category;

    const entries = await AthleticsLeaderboard.find(filter).sort({
      event_name: 1,
      category: 1,
    });

    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const stats = await computeStats(entry.dept_name, entry.event_name, entry.category);
        return {
          leaderboard_id: entry.leaderboard_id,
          dept_name: entry.dept_name,
          event_name: entry.event_name,
          category: entry.category,
          ...stats,
        };
      })
    );

    const result: Record<string, Record<string, typeof enriched>> = {};

    for (const row of enriched) {
      if (!result[row.event_name]) result[row.event_name] = {};
      if (!result[row.event_name][row.category]) result[row.event_name][row.category] = [];
      result[row.event_name][row.category].push(row);
    }

    for (const evt of Object.keys(result)) {
      for (const cat of Object.keys(result[evt])) {
        result[evt][cat].sort((a, b) => b.best_performance - a.best_performance);
        let currentRank = 1;
        for (let i = 0; i < result[evt][cat].length; i++) {
          if (i > 0 && result[evt][cat][i].best_performance === result[evt][cat][i - 1].best_performance) {
            result[evt][cat][i].rank = result[evt][cat][i - 1].rank;
          } else {
            result[evt][cat][i].rank = currentRank;
          }
          currentRank++;
        }
      }
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leaderboard standings",
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