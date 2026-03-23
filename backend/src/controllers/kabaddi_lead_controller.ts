import { Request, Response } from "express";
import mongoose from "mongoose";
import { getKabaddiLeaderboardModel } from "../models/kabaddi_lead_model";

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const Leaderboard = getKabaddiLeaderboardModel(gender as "m" | "f");
    const teams = await Leaderboard.find().sort({ points: -1, scoreDiff: -1 });
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const Leaderboard = getKabaddiLeaderboardModel(gender as "m" | "f");
    const newTeam = await Leaderboard.create(req.body);
    res.status(201).json(newTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m" } = req.query;
    const { _id } = req.body;
    const Leaderboard = getKabaddiLeaderboardModel(gender as "m" | "f");
    const updatedTeam = await Leaderboard.findByIdAndUpdate(_id, req.body, { new: true });
    res.status(200).json(updatedTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender = "m", id } = req.query;
    const Leaderboard = getKabaddiLeaderboardModel(gender as "m" | "f");
    await Leaderboard.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
