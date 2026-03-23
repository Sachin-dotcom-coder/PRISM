import { Request, Response } from "express";
import mongoose from "mongoose";
import { getKabaddiMatchModel } from "../models/kabaddi_model";

export const createKabaddiMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const KabaddiMatch = getKabaddiMatchModel(gender as "m" | "f");
    const match = await KabaddiMatch.create(req.body);
    res.status(201).json(match);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create kabaddi match", error: error.message });
  }
};

export const getAllKabaddiMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const KabaddiMatch = getKabaddiMatchModel(gender as "m" | "f");
    const matches = await KabaddiMatch.find().sort({ createdAt: -1 });
    res.status(200).json(matches);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch kabaddi matches", error: error.message });
  }
};

export const getKabaddiMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const matchId = req.params.id;
    const KabaddiMatch = getKabaddiMatchModel(gender as "m" | "f");
    const match = await KabaddiMatch.findOne({ match_id: matchId });
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch match", error: error.message });
  }
};

export const updateKabaddiMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const matchId = req.params.id;
    const KabaddiMatch = getKabaddiMatchModel(gender as "m" | "f");
    const match = await KabaddiMatch.findOneAndUpdate(
      { match_id: matchId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json(match);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update match", error: error.message });
  }
};

export const deleteKabaddiMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m", id } = req.query; // If pass by query as frontend/cricket does
    // sometimes passed by params: req.params.id
    const matchId = req.params.id || id;
    const KabaddiMatch = getKabaddiMatchModel(gender as "m" | "f");
    const match = await KabaddiMatch.findOneAndDelete({ match_id: matchId });
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json({ message: "Match deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete match", error: error.message });
  }
};
