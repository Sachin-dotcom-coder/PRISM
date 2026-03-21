import { Request, Response } from "express";
import TennisMatch from "../models/tennis_model";

// CREATE a new tennis match
export const createTennisMatch = async (req: Request, res: Response) => {
  try {
    const match = await TennisMatch.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    console.error("Failed to create tennis match", error);
    res.status(500).json({
      message: "Failed to create tennis match",
      error: (error as Error).message || error,
      details: (error as any).errors || null,
    });
  }
};

// READ all tennis matches
export const getAllTennisMatches = async (req: Request, res: Response) => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender: gender as string } : {};
    const matches = await TennisMatch.find(filter).sort({ createdAt: 1 });
    res.status(200).json(matches);
  } catch (error) {
    console.error("Failed to fetch tennis matches", error);
    res.status(500).json({
      message: "Failed to fetch tennis matches",
      error: (error as Error).message || error,
    });
  }
};

// SEARCH tennis matches by filters (category, stage, status, dept_name1, dept_name2)
export const searchTennisMatches = async (req: Request, res: Response) => {
  try {
    const { category, stage, status, dept_name1, dept_name2 } = req.query;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
    if (dept_name1) filter.dept_name1 = dept_name1;
    if (dept_name2) filter.dept_name2 = dept_name2;

    const matches = await TennisMatch.find(filter).sort({ createdAt: 1 });
    res.status(200).json(matches);
  } catch (error) {
    console.error("Failed to search tennis matches", error);
    res.status(500).json({
      message: "Failed to search tennis matches",
      error: (error as Error).message || error,
    });
  }
};

// READ a single tennis match by match_id
export const getTennisMatchById = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id as string;
    const match = await TennisMatch.findOne({ match_id: matchId });
    if (!match) {
      res.status(404).json({ message: "Tennis match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    console.error("Failed to fetch tennis match", error);
    res.status(500).json({
      message: "Failed to fetch tennis match",
      error: (error as Error).message || error,
    });
  }
};

// UPDATE a tennis match by match_id
export const updateTennisMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id as string;
    const match = await TennisMatch.findOneAndUpdate(
      { match_id: matchId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!match) {
      res.status(404).json({ message: "Tennis match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    console.error("Failed to update tennis match", error);
    res.status(500).json({
      message: "Failed to update tennis match",
      error: (error as Error).message || error,
      details: (error as any).errors || null,
    });
  }
};

// DELETE a tennis match by match_id
export const deleteTennisMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id as string;
    const match = await TennisMatch.findOneAndDelete({ match_id: matchId });
    if (!match) {
      res.status(404).json({ message: "Tennis match not found" });
      return;
    }
    res.status(200).json({ message: "Tennis match deleted successfully" });
  } catch (error) {
    console.error("Failed to delete tennis match", error);
    res.status(500).json({
      message: "Failed to delete tennis match",
      error: (error as Error).message || error,
    });
  }
};