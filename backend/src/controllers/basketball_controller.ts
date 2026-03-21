import { Request, Response } from "express";
import BasketballMatch, { IGame } from "../models/basketball_model";

const evaluateMatch = (team1_department: string, team2_department: string, games: IGame[]) => {
  if (games.length > 1) {
    return { valid: false, error: "Basketball module only permits one final score entry." };
  }

  let t1Points = 0;
  let t2Points = 0;

  for (const q of games) {
    if (!Number.isInteger(q.team1_score) || q.team1_score < 0) return { valid: false, error: "Scores must be non-negative integers." };
    if (!Number.isInteger(q.team2_score) || q.team2_score < 0) return { valid: false, error: "Scores must be non-negative integers." };
    
    t1Points += q.team1_score;
    t2Points += q.team2_score;
  }

  let winner: string | null = null;
  let status = "ongoing";

  if (t1Points > t2Points) {
    winner = team1_department;
  } else if (t2Points > t1Points) {
    winner = team2_department;
  } else if (games.length === 1) {
    // Both played, still tied
    winner = "draw";
  }

  if (games.length === 0) {
    status = "scheduled";
  } else if (games.length === 1) {
    status = "completed";
  }

  return { valid: true, winner, status, team1Total: t1Points, team2Total: t2Points };
};

export const createBasketballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_stage, team1_department, team2_department, match_date, venue, games, gender, match_status
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_department || !team2_department || !gender) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    if (!["men", "women"].includes(gender)) {
       res.status(400).json({ success: false, message: "Invalid gender selection." });
       return;
    }

    const gamesArr = games || [];
    const evaluation = evaluateMatch(team1_department, team2_department, gamesArr);
    
    if (!evaluation.valid) {
      res.status(400).json({ success: false, message: evaluation.error });
      return;
    }

    const newMatch = new BasketballMatch({
      match_id,
      match_stage,
      team1_department,
      team2_department,
      match_date,
      venue,
      gender,
      games: gamesArr,
      total_games: 1,
      winner: evaluation.winner,
      match_status: match_status || (evaluation.status !== "scheduled" ? evaluation.status : "scheduled")
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ success: true, message: "Basketball match created.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllBasketballMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender: gender as string } : {};
    
    // Default to 'men' if no gender specified in admin interface request, or just return all?
    // Let's filter correctly as requested.
    const matches = await BasketballMatch.find(filter).sort({ match_id: 1 });
    res.status(200).json({ success: true, message: "Matches fetched.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getBasketballMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const match = await BasketballMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Match fetched.", data: match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateBasketballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const { games, match_status, team1_department, team2_department, match_stage, match_date, venue, gender } = req.body;

    const match = await BasketballMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    const updateData: any = {};
    
    const t1Dept = team1_department || match.team1_department;
    const t2Dept = team2_department || match.team2_department;

    if (match_stage !== undefined) updateData.match_stage = match_stage;
    if (team1_department !== undefined) updateData.team1_department = team1_department;
    if (team2_department !== undefined) updateData.team2_department = team2_department;
    if (match_date !== undefined) updateData.match_date = match_date;
    if (venue !== undefined) updateData.venue = venue;
    if (gender !== undefined) updateData.gender = gender;
    
    if (games !== undefined) {
      if (!Array.isArray(games)) {
         res.status(400).json({ success: false, message: "games must be an array." });
         return;
      }

      const evaluation = evaluateMatch(t1Dept, t2Dept, games);

      if (!evaluation.valid) {
         res.status(400).json({ success: false, message: evaluation.error });
         return;
      }

      updateData.games = games;
      updateData.winner = evaluation.winner;

      if (evaluation.status === "completed") {
         updateData.match_status = "completed";
      } else if (match_status) {
         updateData.match_status = match_status;
      } else if (games.length > 0) {
         updateData.match_status = "ongoing";
      }
    } else if (match_status) {
       if (!["scheduled", "ongoing", "completed"].includes(match_status)) {
        res.status(400).json({ success: false, message: "Invalid match_status." });
        return;
      }
      updateData.match_status = match_status;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "Provide fields to update." });
      return;
    }

    const updatedMatch = await BasketballMatch.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Match updated.", data: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteBasketballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const deletedMatch = await BasketballMatch.findOneAndDelete({ match_id: Number(match_id) });

    if (!deletedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Match deleted.", data: deletedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
