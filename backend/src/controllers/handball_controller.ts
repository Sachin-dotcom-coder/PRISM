import { Request, Response } from "express";
import HandballMatch from "../models/handball_model";

export const createHandballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id, match_stage, team1_department, team2_department, match_date, venue, gender, team1_score, team2_score, winner, match_status } = req.body;

    if (match_id === undefined || !match_stage || !team1_department || !team2_department || !gender) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    if (!["men", "women"].includes(gender)) {
      res.status(400).json({ success: false, message: "Invalid gender selection." });
      return;
    }

    // Auto-calculate winner if not explicitly provided
    let calculatedWinner = winner;
    let fallbackStatus = match_status || "scheduled";
    if (typeof team1_score === 'number' && typeof team2_score === 'number') {
       if (team1_score > team2_score) calculatedWinner = team1_department;
       else if (team2_score > team1_score) calculatedWinner = team2_department;
       else calculatedWinner = "tie";
       fallbackStatus = match_status || "completed";
    }

    const newMatch = new HandballMatch({
      match_id, match_stage, team1_department, team2_department, match_date, venue, gender, team1_score, team2_score, winner: calculatedWinner, match_status: fallbackStatus
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ success: true, message: "Handball match created.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) return { res: res.status(400).json({ success: false, message: "match_id must be unique." }) } as any;
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllHandballMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender: gender as string } : {};
    const matches = await HandballMatch.find(filter).sort({ match_id: 1 });
    res.status(200).json({ success: true, message: "Matches fetched.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getHandballMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await HandballMatch.findOne({ match_id: Number(req.params.match_id) });
    if (!match) { res.status(404).json({ success: false, message: "Match not found." }); return; }
    res.status(200).json({ success: true, data: match });
  } catch (error: any) { res.status(500).json({ success: false, data: error.message }); }
};

export const updateHandballScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const match = await HandballMatch.findOne({ match_id: Number(match_id) });
    if (!match) { res.status(404).json({ success: false, message: "Match not found." }); return; }

    const updateData: any = { ...req.body };

    // Auto calculate
    if (typeof updateData.team1_score === 'number' && typeof updateData.team2_score === 'number') {
       const t1 = updateData.team1_score;
       const t2 = updateData.team2_score;
       const d1 = updateData.team1_department || match.team1_department;
       const d2 = updateData.team2_department || match.team2_department;
       
       if (!updateData.winner) {
          if (t1 > t2) updateData.winner = d1;
          else if (t2 > t1) updateData.winner = d2;
          else updateData.winner = "tie";
       }
       
       if (!updateData.match_status) {
          updateData.match_status = "completed";
       }
    }

    const updatedMatch = await HandballMatch.findOneAndUpdate(
      { match_id: Number(match_id) }, updateData, { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: updatedMatch });
  } catch (error: any) { res.status(500).json({ success: false, data: error.message }); }
};

export const deleteHandballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedMatch = await HandballMatch.findOneAndDelete({ match_id: Number(req.params.match_id) });
    if (!deletedMatch) { res.status(404).json({ success: false, message: "Match not found." }); return; }
    res.status(200).json({ success: true, data: deletedMatch });
  } catch (error: any) { res.status(500).json({ success: false, data: error.message }); }
};
