import { Request, Response } from "express";
import VolleyballMatch from "../models/volleyball_model";

// CREATE a new volleyball match
export const createVolleyballMatch = async (req: Request, res: Response) => {
  try {
    const match = await VolleyballMatch.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    console.error("Failed to create volleyball match", error);
    res.status(500).json({
      message: "Failed to create volleyball match",
      error: (error as Error).message || error,
      details: (error as any).errors || null,
    });
  }
};

// READ all volleyball matches
export const getAllVolleyballMatches = async (req: Request, res: Response) => {
  try {
    const matches = await VolleyballMatch.find();
    res.status(200).json(matches);
  } catch (error) {
    console.error("Failed to fetch volleyball matches", error);
    res.status(500).json({
      message: "Failed to fetch volleyball matches",
      error: (error as Error).message || error,
    });
  }
};

// SEARCH volleyball matches by filters (category, stage, status, dept_name1, dept_name2)
export const searchVolleyballMatches = async (req: Request, res: Response) => {
  try {
    const { category, stage, status, dept_name1, dept_name2 } = req.query;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
    if (dept_name1) filter.dept_name1 = dept_name1;
    if (dept_name2) filter.dept_name2 = dept_name2;

    const matches = await VolleyballMatch.find(filter).sort({ createdAt: 1 });
    res.status(200).json(matches);
  } catch (error) {
    console.error("Failed to search volleyball matches", error);
    res.status(500).json({
      message: "Failed to search volleyball matches",
      error: (error as Error).message || error,
    });
  }
};

// READ a single volleyball match by match_id
export const getVolleyballMatchById = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id as string;
    const match = await VolleyballMatch.findOne({ match_id: matchId });
    if (!match) {
      res.status(404).json({ message: "Volleyball match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    console.error("Failed to fetch volleyball match", error);
    res.status(500).json({
      message: "Failed to fetch volleyball match",
      error: (error as Error).message || error,
    });
  }
};

// UPDATE a volleyball match by match_id
export const updateVolleyballMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id as string;
    const match = await VolleyballMatch.findOneAndUpdate(
      { match_id: matchId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!match) {
      res.status(404).json({ message: "Volleyball match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    console.error("Failed to update volleyball match", error);
    res.status(500).json({
      message: "Failed to update volleyball match",
      error: (error as Error).message || error,
    });
  }
};

// DELETE a volleyball match by match_id
export const deleteVolleyballMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id as string;
    const match = await VolleyballMatch.findOneAndDelete({ match_id: matchId });
    if (!match) {
      res.status(404).json({ message: "Volleyball match not found" });
      return;
    }
    res.status(200).json({ message: "Volleyball match deleted successfully" });
  } catch (error) {
    console.error("Failed to delete volleyball match", error);
    res.status(500).json({
      message: "Failed to delete volleyball match",
      error: (error as Error).message || error,
    });
  }
};