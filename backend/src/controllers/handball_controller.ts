import { Request, Response } from "express";
import HandballMatch, { IHalf, IExtraTime } from "../models/handball_model";

const evaluateMatch = (team1_name: string, team2_name: string, halves: IHalf[], extra_time: IExtraTime[]) => {
  if (halves.length > 2) {
    return { valid: false, error: "Maximum 2 halves allowed." };
  }

  // Ensure unique half_numbers 1 and 2
  const halfNumbers = halves.map(h => h.half_number);
  const uniqueHalves = new Set(halfNumbers);
  if (uniqueHalves.size !== halves.length) {
     return { valid: false, error: "Duplicate halves provided." };
  }

  let t1Goals = 0;
  let t2Goals = 0;

  for (const h of halves) {
    if (!Number.isInteger(h.team1_goals) || h.team1_goals < 0) return { valid: false, error: "Goals must be >= 0 integer." };
    if (!Number.isInteger(h.team2_goals) || h.team2_goals < 0) return { valid: false, error: "Goals must be >= 0 integer." };
    
    t1Goals += h.team1_goals;
    t2Goals += h.team2_goals;
  }

  const regularTimeTied = halves.length === 2 && t1Goals === t2Goals;
  
  if (extra_time.length > 0 && (!regularTimeTied)) {
     return { valid: false, error: "Extra time is only allowed if the match is tied after 2 halves." };
  }

  // Ensure extra time periods are sequential
  for (const et of extra_time) {
      if (!Number.isInteger(et.team1_goals) || et.team1_goals < 0) return { valid: false, error: "Extra time goals must be >= 0 integer." };
      if (!Number.isInteger(et.team2_goals) || et.team2_goals < 0) return { valid: false, error: "Extra time goals must be >= 0 integer." };
      
      t1Goals += et.team1_goals;
      t2Goals += et.team2_goals;
  }

  let winner: string | null = null;
  let status = "ongoing";

  if (t1Goals > t2Goals) {
    winner = team1_name;
  } else if (t2Goals > t1Goals) {
    winner = team2_name;
  } else if (halves.length === 2) {
    // Both 2 halves played (and extra time played if any), still tied
    winner = "draw";
  }

  if (halves.length === 0) {
    status = "scheduled";
  } else if (halves.length === 2) {
    status = "completed";
  }

  return { valid: true, winner, status, team1Total: t1Goals, team2Total: t2Goals };
};

export const createHandballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_stage, team1_name, team2_name, match_date, venue, halves, extra_time
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_name || !team2_name) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    if (!["league", "quarterfinal", "semifinal", "final"].includes(match_stage)) {
       res.status(400).json({ success: false, message: "Invalid match_stage." });
       return;
    }

    const halvesArr = halves || [];
    const etArr = extra_time || [];
    
    const evaluation = evaluateMatch(team1_name, team2_name, halvesArr, etArr);
    if (!evaluation.valid) {
      res.status(400).json({ success: false, message: evaluation.error });
      return;
    }

    const newMatch = new HandballMatch({
      match_id,
      match_stage,
      team1_name,
      team2_name,
      match_date,
      venue,
      halves: halvesArr,
      extra_time: etArr,
      team1_total_goals: evaluation.team1Total,
      team2_total_goals: evaluation.team2Total,
      winner: evaluation.winner,
      match_status: evaluation.status !== "scheduled" ? evaluation.status : (req.body.match_status || "scheduled")
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ success: true, message: "Handball match created.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllHandballMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await HandballMatch.find();
    res.status(200).json({ success: true, message: "Matches fetched.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getHandballMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const match = await HandballMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Match fetched.", data: match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateHandballScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const { halves, extra_time, match_status } = req.body;

    const match = await HandballMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    const updateData: any = {};
    
    // Evaluate if halves or extra_time is provided
    if (halves !== undefined || extra_time !== undefined) {
      const evaluation = evaluateMatch(
        match.team1_name, 
        match.team2_name, 
        halves !== undefined ? halves : match.halves, 
        extra_time !== undefined ? extra_time : match.extra_time
      );

      if (!evaluation.valid) {
         res.status(400).json({ success: false, message: evaluation.error });
         return;
      }

      if (halves !== undefined) updateData.halves = halves;
      if (extra_time !== undefined) updateData.extra_time = extra_time;
      
      updateData.team1_total_goals = evaluation.team1Total;
      updateData.team2_total_goals = evaluation.team2Total;
      updateData.winner = evaluation.winner;

      if (evaluation.status === "completed") {
         updateData.match_status = "completed";
      } else if (match_status) {
         updateData.match_status = match_status;
      } else if ((halves !== undefined && halves.length > 0) || match.halves.length > 0) {
         updateData.match_status = "ongoing";
      }
    } else if (match_status) {
       if (!["scheduled", "ongoing", "completed"].includes(match_status)) {
        res.status(400).json({ success: false, message: "Invalid match_status." });
        return;
      }
      updateData.match_status = match_status;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "Provide halves, extra_time or match_status to update." });
      return;
    }

    const updatedMatch = await HandballMatch.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Match score updated.", data: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteHandballMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const deletedMatch = await HandballMatch.findOneAndDelete({ match_id: Number(match_id) });

    if (!deletedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Match deleted.", data: deletedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
