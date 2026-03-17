import { Request, Response } from "express";
import BasketballMatch, { IQuarter } from "../models/basketball_model";

const evaluateMatch = (team1_name: string, team2_name: string, quarters: IQuarter[]) => {
  if (quarters.length > 4) {
    return { valid: false, error: "Maximum 4 quarters allowed." };
  }

  // Ensure unique quarter_numbers 1 to 4
  const quarterNumbers = quarters.map(q => q.quarter_number);
  const uniqueQuarters = new Set(quarterNumbers);
  if (uniqueQuarters.size !== quarters.length) {
     return { valid: false, error: "Duplicate quarters provided." };
  }

  let t1Points = 0;
  let t2Points = 0;

  for (const q of quarters) {
    if (!Number.isInteger(q.team1_points) || q.team1_points < 0) return { valid: false, error: "Points must be a non-negative integer." };
    if (!Number.isInteger(q.team2_points) || q.team2_points < 0) return { valid: false, error: "Points must be a non-negative integer." };
    
    t1Points += q.team1_points;
    t2Points += q.team2_points;
  }

  let winner: string | null = null;
  let status = "ongoing";

  if (t1Points > t2Points) {
    winner = team1_name;
  } else if (t2Points > t1Points) {
    winner = team2_name;
  } else if (quarters.length === 4) {
    // Both 4 quarters played, still tied
    winner = "draw";
  }

  if (quarters.length === 0) {
    status = "scheduled";
  } else if (quarters.length === 4) {
    status = "completed";
  }

  return { valid: true, winner, status, team1Total: t1Points, team2Total: t2Points };
};

export const createBasketballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_stage, team1_name, team2_name, match_date, venue, quarters, scoring_breakdown
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_name || !team2_name) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    if (!["league", "quarterfinal", "semifinal", "final"].includes(match_stage)) {
       res.status(400).json({ success: false, message: "Invalid match_stage." });
       return;
    }

    const quartersArr = quarters || [];
    const evaluation = evaluateMatch(team1_name, team2_name, quartersArr);
    
    if (!evaluation.valid) {
      res.status(400).json({ success: false, message: evaluation.error });
      return;
    }

    const newMatch = new BasketballMatch({
      match_id,
      match_stage,
      team1_name,
      team2_name,
      match_date,
      venue,
      quarters: quartersArr,
      scoring_breakdown,
      team1_total_points: evaluation.team1Total,
      team2_total_points: evaluation.team2Total,
      winner: evaluation.winner,
      match_status: req.body.match_status || (evaluation.status !== "scheduled" ? evaluation.status : "scheduled")
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ success: true, message: "Basketball match created.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllBasketballMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await BasketballMatch.find();
    res.status(200).json({ success: true, message: "Matches fetched.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getBasketballMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const match = await BasketballMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Match fetched.", data: match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateBasketballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const { quarters, scoring_breakdown, match_status } = req.body;

    const match = await BasketballMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    const updateData: any = {};
    
    if (quarters !== undefined) {
      if (!Array.isArray(quarters)) {
         res.status(400).json({ success: false, message: "quarters must be an array." });
         return;
      }

      const evaluation = evaluateMatch(match.team1_name, match.team2_name, quarters);

      if (!evaluation.valid) {
         res.status(400).json({ success: false, message: evaluation.error });
         return;
      }

      updateData.quarters = quarters;
      updateData.team1_total_points = evaluation.team1Total;
      updateData.team2_total_points = evaluation.team2Total;
      updateData.winner = evaluation.winner;

      if (evaluation.status === "completed") {
         updateData.match_status = "completed";
      } else if (match_status) {
         updateData.match_status = match_status;
      } else if (quarters.length > 0) {
         updateData.match_status = "ongoing";
      }
    } else if (match_status) {
       if (!["scheduled", "ongoing", "completed"].includes(match_status)) {
        res.status(400).json({ success: false, message: "Invalid match_status." });
        return;
      }
      updateData.match_status = match_status;
    }

    if (scoring_breakdown !== undefined) {
       updateData.scoring_breakdown = scoring_breakdown;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "Provide quarters, scoring_breakdown, or match_status to update." });
      return;
    }

    const updatedMatch = await BasketballMatch.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Match score updated.", data: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteBasketballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const deletedMatch = await BasketballMatch.findOneAndDelete({ match_id: Number(match_id) });

    if (!deletedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Match deleted.", data: deletedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
