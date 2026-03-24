import { Request, Response } from "express";
import TTMatch from "../models/TT.model";

const buildDerivedMatchFields = (
  games: any[] | undefined,
  team1Department: string,
  team2Department: string
) => {
  if (!Array.isArray(games)) {
    return {};
  }

  let team1Wins = 0;
  let team2Wins = 0;

  const normalizedGames = games.map((game, index) => {
    const team1Score = Number(game.team1_score ?? 0);
    const team2Score = Number(game.team2_score ?? 0);

    let winner: string | null = null;
    if (team1Score > team2Score) {
      winner = team1Department;
      team1Wins++;
    } else if (team2Score > team1Score) {
      winner = team2Department;
      team2Wins++;
    }

    return {
      game_number: Number(game.game_number ?? index + 1),
      match_type: game.match_type === "doubles" ? "doubles" : "singles",
      team1_score: team1Score,
      team2_score: team2Score,
      winner
    };
  });

  let winner: string | null = null;
  if (team1Wins > team2Wins) {
    winner = team1Department;
  } else if (team2Wins > team1Wins) {
    winner = team2Department;
  }

  return {
    games: normalizedGames,
    total_games: normalizedGames.length,
    team1_score: team1Wins,
    team2_score: team2Wins,
    winner
  };
};

export const createTTMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_stage, team1_department, team2_department, match_date, gender, games
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_department || !team2_department || !match_date || !gender) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    const derivedFields = buildDerivedMatchFields(games, team1_department, team2_department);

    const newMatch = new TTMatch({
      ...req.body,
      ...derivedFields
    });
    const savedMatch = await newMatch.save();

    res.status(201).json({ success: true, message: "Match created successfully.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllTTMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender: String(gender) } : {};
    const matches = await TTMatch.find(filter);
    res.status(200).json({ success: true, message: "Matches fetched successfully.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getTTMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const match = await TTMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Match fetched successfully.", data: match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateTTMatchScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const existingMatch = await TTMatch.findOne({ match_id: Number(match_id) });

    if (!existingMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    const { 
      games, match_status, team1_score, team2_score, match_stage, match_type, venue, match_date, team1_department, team2_department, winner, gender 
    } = req.body;

    const updateData: any = {};

    if (match_stage !== undefined) updateData.match_stage = match_stage;
    if (match_type !== undefined) updateData.match_type = match_type;
    if (venue !== undefined) updateData.venue = venue;
    if (match_date !== undefined) updateData.match_date = match_date;
    if (team1_department !== undefined) updateData.team1_department = team1_department;
    if (team2_department !== undefined) updateData.team2_department = team2_department;
    if (winner !== undefined) updateData.winner = winner;
    if (match_status !== undefined) updateData.match_status = match_status;
    if (team1_score !== undefined) updateData.team1_score = team1_score;
    if (team2_score !== undefined) updateData.team2_score = team2_score;
    if (gender !== undefined) updateData.gender = gender;

    const nextTeam1Department = team1_department ?? existingMatch.team1_department;
    const nextTeam2Department = team2_department ?? existingMatch.team2_department;

    if (games !== undefined && Array.isArray(games)) {
      Object.assign(
        updateData,
        buildDerivedMatchFields(
          games,
          nextTeam1Department,
          nextTeam2Department
        )
      );
    } else if (team1_department !== undefined || team2_department !== undefined) {
      Object.assign(
        updateData,
        buildDerivedMatchFields(
          existingMatch.games as any[],
          nextTeam1Department,
          nextTeam2Department
        )
      );
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "No valid fields provided to update." });
      return;
    }

    const updatedMatch = await TTMatch.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Match updated successfully.", data: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteTTMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const deletedMatch = await TTMatch.findOneAndDelete({ match_id: Number(match_id) });
    if (!deletedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Match deleted successfully.", data: deletedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
