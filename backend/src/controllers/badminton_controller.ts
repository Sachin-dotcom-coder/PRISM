import { Request, Response } from "express";
import BadmintonMatch from "../models/badminton_model";

export const createBadmintonMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id,
      match_stage,
      team1_department,
      team2_department,
      match_date,
      gender
    } = req.body;

    if (
      match_id === undefined ||
      !match_stage ||
      !team1_department ||
      !team2_department ||
      !match_date ||
      !gender
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields including gender.",
      });
      return;
    }

    if (!["group", "semifinal", "final"].includes(match_stage)) {
      res.status(400).json({ success: false, message: "Invalid match_stage." });
      return;
    }

    const newMatch = new BadmintonMatch(req.body);
    const savedMatch = await newMatch.save();

    res.status(201).json({
      success: true,
      message: "Badminton match created successfully.",
      data: savedMatch,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: error.message,
    });
  }
};

export const getAllBadmintonMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender: String(gender) } : {};
    const matches = await BadmintonMatch.find(filter);
    res.status(200).json({
      success: true,
      message: "Matches fetched successfully.",
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: error.message,
    });
  }
};

export const getBadmintonMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;

    const match = await BadmintonMatch.findOne({ match_id: Number(match_id) });

    if (!match) {
      res.status(404).json({
        success: false,
        message: "Match not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Match fetched successfully.",
      data: match,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: error.message,
    });
  }
};

export const updateBadmintonMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const { 
      games, 
      match_status, 
      team1_score, 
      team2_score, 
      match_stage,
      venue, 
      match_date, 
      team1_department, 
      team2_department, 
      winner,
      gender
    } = req.body;

    const updateData: any = {};

    // Standard fields
    if (match_stage !== undefined) updateData.match_stage = match_stage;
    if (venue !== undefined) updateData.venue = venue;
    if (match_date !== undefined) updateData.match_date = match_date;
    if (team1_department !== undefined) updateData.team1_department = team1_department;
    if (team2_department !== undefined) updateData.team2_department = team2_department;
    if (winner !== undefined) updateData.winner = winner;
    if (match_status !== undefined) updateData.match_status = match_status;
    if (team1_score !== undefined) updateData.team1_score = team1_score;
    if (team2_score !== undefined) updateData.team2_score = team2_score;
    if (gender !== undefined) updateData.gender = gender;

    // ✅ Handle games array if provided
    if (games !== undefined && Array.isArray(games)) {
      updateData.games = games;
      updateData.total_games = games.length;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
      return;
    }

    const updatedMatch = await BadmintonMatch.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMatch) {
      res.status(404).json({
        success: false,
        message: "Match not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Match updated successfully.",
      data: updatedMatch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: error.message,
    });
  }
};

export const deleteBadmintonMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;

    const deletedMatch = await BadmintonMatch.findOneAndDelete({
      match_id: Number(match_id),
    });

    if (!deletedMatch) {
      res.status(404).json({
        success: false,
        message: "Match not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Match deleted successfully.",
      data: deletedMatch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: error.message,
    });
  }
};
