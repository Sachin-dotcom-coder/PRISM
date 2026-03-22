import { Request, Response } from "express";
import VolleyballMatch from "../models/volleyball_model";

export const createVolleyballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_stage, team1_department, team2_department, match_date, venue, gender,
      team1_score, team2_score, winner, match_status, games, total_games
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_department || !team2_department || !gender) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    if (!["men", "women"].includes(gender)) {
       res.status(400).json({ success: false, message: "Invalid gender selection." });
       return;
    }

    const newMatch = new VolleyballMatch({
      match_id,
      match_stage,
      team1_department,
      team2_department,
      match_date,
      venue,
      gender,
      team1_score,
      team2_score,
      winner: winner || null,
      match_status: match_status || "scheduled",
      games: games || [],
      total_games: total_games || 0,
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ success: true, message: "Volleyball match created.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllVolleyballMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender: gender as string } : {};
    
    const matches = await VolleyballMatch.find(filter).sort({ match_id: 1 });
    res.status(200).json({ success: true, message: "Matches fetched.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getVolleyballMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { gender } = req.query;
    
    const match = await VolleyballMatch.findOne({ match_id: Number(id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    
    if (gender && match.gender !== gender) {
      res.status(400).json({ success: false, message: "Match exists but gender filter applies." });
      return;
    }

    res.status(200).json({ success: true, message: "Match fetched.", data: match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateVolleyballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { team1_department, team2_department, match_stage, match_date, venue, gender, winner, team1_score, team2_score, match_status, games, total_games } = req.body;

    const match = await VolleyballMatch.findOne({ match_id: Number(id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    const updateData: any = {};
    
    if (match_stage !== undefined) updateData.match_stage = match_stage;
    if (team1_department !== undefined) updateData.team1_department = team1_department;
    if (team2_department !== undefined) updateData.team2_department = team2_department;
    if (match_date !== undefined) updateData.match_date = match_date;
    if (venue !== undefined) updateData.venue = venue;
    if (gender !== undefined) updateData.gender = gender;
    if (team1_score !== undefined) updateData.team1_score = team1_score;
    if (team2_score !== undefined) updateData.team2_score = team2_score;
    if (winner !== undefined) updateData.winner = winner;
    if (match_status !== undefined) updateData.match_status = match_status;
    if (games !== undefined) updateData.games = games;
    if (total_games !== undefined) updateData.total_games = total_games;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "Provide fields to update." });
      return;
    }

    const updatedMatch = await VolleyballMatch.findOneAndUpdate(
      { match_id: Number(id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Match updated.", data: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteVolleyballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedMatch = await VolleyballMatch.findOneAndDelete({ match_id: Number(id) });

    if (!deletedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Match deleted.", data: deletedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};