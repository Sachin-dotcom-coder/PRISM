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
      venue
    } = req.body;

    if (
      match_id === undefined ||
      !match_stage ||
      !team1_department ||
      !team2_department ||
      !match_date ||
      !venue
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields.",
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
    const matches = await BadmintonMatch.find();
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
    const { games, match_status } = req.body;

    const updateData: any = {};

    // ✅ Handle games (score update)
    if (games !== undefined) {
      if (!Array.isArray(games) || games.length === 0) {
        res.status(400).json({
          success: false,
          message: "Games must be a non-empty array.",
        });
        return;
      }

      let team1Wins = 0;
      let team2Wins = 0;

      games.forEach((game: any) => {
        if (
          typeof game.team1_score !== "number" ||
          typeof game.team2_score !== "number"
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid score format.",
          });
          return;
        }

        if (game.team1_score > game.team2_score) {
          team1Wins++;
        } else if (game.team2_score > game.team1_score) {
          team2Wins++;
        }
      });

      let winner = null;

      if (team1Wins > team2Wins) {
        winner = "team1";
      } else if (team2Wins > team1Wins) {
        winner = "team2";
      }

      updateData.games = games;
      updateData.total_games = games.length;
      updateData.winner = winner;
      updateData.match_status = "completed";
    }

    // ✅ Optional manual match_status update
    if (match_status !== undefined) {
      if (!["scheduled", "ongoing", "completed"].includes(match_status)) {
        res.status(400).json({
          success: false,
          message: "Invalid match_status.",
        });
        return;
      }
      updateData.match_status = match_status;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "Provide 'games' or 'match_status' to update.",
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