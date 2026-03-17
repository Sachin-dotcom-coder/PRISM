import { Request, Response } from "express";
import Match from "../models/match_model";

// CREATE a new match
export const createMatch = async (req: Request, res: Response) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to create match", error });
  }
};

// READ all matches
export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch matches", error });
  }
};

// SEARCH matches by filters (sport_type, match_stage, teams, status, venue)
export const searchMatches = async (req: Request, res: Response) => {
  try {
    const { sport_type, match_stage, team1_department, team2_department, match_status, venue } = req.query;

    const filter: Record<string, unknown> = {};
    if (sport_type)        filter.sport_type        = new RegExp(sport_type as string, "i");
    if (match_stage)       filter.match_stage       = match_stage;
    if (team1_department)  filter.team1_department  = new RegExp(team1_department as string, "i");
    if (team2_department)  filter.team2_department  = new RegExp(team2_department as string, "i");
    if (match_status)      filter.match_status      = match_status;
    if (venue)             filter.venue             = new RegExp(venue as string, "i");

    const matches = await Match.find(filter).sort({ match_date: 1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Failed to search matches", error });
  }
};

// READ a single match by match_id
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const match = await Match.findOne({ match_id: id });
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch match", error });
  }
};

// UPDATE a match by match_id
export const updateMatch = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const match = await Match.findOneAndUpdate(
      { match_id: id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to update match", error });
  }
};

// DELETE a match by match_id
export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const match = await Match.findOneAndDelete({ match_id: id });
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete match", error });
  }
};
