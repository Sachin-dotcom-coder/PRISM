import { Request, Response } from "express";
import LTTie from "../models/LT.model";

const evaluateTie = (tieStage: string, team1_name: string, team2_name: string, matches: any[]) => {
  if (matches.length > 3) {
    return { valid: false, error: "Maximum 3 matches allowed per tie." };
  }
  
  let singlesCount = 0;
  let doublesCount = 0;
  for (const m of matches) {
    if (m.match_type === "singles") singlesCount++;
    if (m.match_type === "doubles") doublesCount++;
  }
  
  if (singlesCount > 2) return { valid: false, error: "Maximum 2 singles matches allowed." };
  if (doublesCount > 1) return { valid: false, error: "Maximum 1 doubles match allowed." };

  let t1MatchesWon = 0;
  let t2MatchesWon = 0;

  for (const m of matches) {
    let t1Games = 0;
    let t2Games = 0;
    
    for (const g of m.games) {
      const isTiebreak = (tieStage === "semifinal" || tieStage === "final") && (t1Games === 6 && t2Games === 6);
      
      let gameWinner = g.winner;
      
      if (!isTiebreak) {
         if (g.team1_points < 40 && ![0, 15, 30].includes(g.team1_points)) {
            return { valid: false, error: `Invalid points ${g.team1_points} for standard game. Must be 0, 15, 30, 40 etc.` };
         }
         if (g.team2_points < 40 && ![0, 15, 30].includes(g.team2_points)) {
            return { valid: false, error: `Invalid points ${g.team2_points} for standard game. Must be 0, 15, 30, 40 etc.` };
         }
      }

      if (!gameWinner) {
        if (isTiebreak) {
          if (g.team1_points >= 7 && g.team1_points - g.team2_points >= 2) gameWinner = team1_name;
          else if (g.team2_points >= 7 && g.team2_points - g.team1_points >= 2) gameWinner = team2_name;
        } else {
          if (g.team1_points > g.team2_points && g.team1_points >= 40) gameWinner = team1_name;
          else if (g.team2_points > g.team1_points && g.team2_points >= 40) gameWinner = team2_name;
        }
      }
      
      g.winner = gameWinner || null;

      if (gameWinner === team1_name) t1Games++;
      else if (gameWinner === team2_name) t2Games++;
    }

    m.team1_games_won = t1Games;
    m.team2_games_won = t2Games;

    let matchWinner = m.winner;
    if (!matchWinner) {
      if (tieStage === "league" && t1Games >= 4) matchWinner = team1_name;
      else if (tieStage === "league" && t2Games >= 4) matchWinner = team2_name;
      else if (tieStage === "quarterfinal" && t1Games >= 5) matchWinner = team1_name;
      else if (tieStage === "quarterfinal" && t2Games >= 5) matchWinner = team2_name;
      else if (tieStage === "semifinal" || tieStage === "final") {
        if ((t1Games === 6 && t1Games - t2Games >= 2) || t1Games === 7) matchWinner = team1_name;
        else if ((t2Games === 6 && t2Games - t1Games >= 2) || t2Games === 7) matchWinner = team2_name;
      }
    }
    
    m.winner = matchWinner || null;

    if (matchWinner === team1_name) t1MatchesWon++;
    else if (matchWinner === team2_name) t2MatchesWon++;
  }

  let tieWinner = null;
  let status = "ongoing";

  if (t1MatchesWon >= 2) {
    tieWinner = team1_name;
    status = "completed";
  } else if (t2MatchesWon >= 2) {
    tieWinner = team2_name;
    status = "completed";
  } else if (matches.length === 0) {
    status = "scheduled";
  }

  return { valid: true, tieWinner, status, t1MatchesWon, t2MatchesWon, processedMatches: matches };
};

export const createLTMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_stage, team1_name, team2_name, match_date, venue, matches
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_name || !team2_name) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    if (!["league", "quarterfinal", "semifinal", "final"].includes(match_stage)) {
       res.status(400).json({ success: false, message: "Invalid match_stage." });
       return;
    }

    const matchesArr = matches || [];
    const evaluation = evaluateTie(match_stage, team1_name, team2_name, matchesArr);
    
    if (!evaluation.valid) {
      res.status(400).json({ success: false, message: evaluation.error });
      return;
    }

    const newTie = new LTTie({
      match_id,
      match_stage,
      team1_name,
      team2_name,
      match_date,
      venue,
      matches: evaluation.processedMatches,
      team1_matches_won: evaluation.t1MatchesWon,
      team2_matches_won: evaluation.t2MatchesWon,
      winner: evaluation.tieWinner,
      match_status: evaluation.status !== "scheduled" ? evaluation.status : (req.body.match_status || "scheduled")
    });

    const savedTie = await newTie.save();
    res.status(201).json({ success: true, message: "Lawn Tennis Tie created successfully.", data: savedTie });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllLTMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const ties = await LTTie.find();
    res.status(200).json({ success: true, message: "Ties fetched.", data: ties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getLTMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const tie = await LTTie.findOne({ match_id: Number(match_id) });
    if (!tie) {
      res.status(404).json({ success: false, message: "Match/Tie not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Tie fetched.", data: tie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateLTMatchScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const { matches, match_status } = req.body;

    const tie = await LTTie.findOne({ match_id: Number(match_id) });
    if (!tie) {
      res.status(404).json({ success: false, message: "Match/Tie not found." });
      return;
    }

    const updateData: any = {};

    if (matches !== undefined) {
      if (!Array.isArray(matches)) {
        res.status(400).json({ success: false, message: "matches must be an array." });
        return;
      }
      
      const evaluation = evaluateTie(tie.match_stage, tie.team1_name, tie.team2_name, matches);
      if (!evaluation.valid) {
        res.status(400).json({ success: false, message: evaluation.error });
        return;
      }

      updateData.matches = evaluation.processedMatches;
      updateData.team1_matches_won = evaluation.t1MatchesWon;
      updateData.team2_matches_won = evaluation.t2MatchesWon;
      updateData.winner = evaluation.tieWinner;
      
      if (evaluation.status === "completed") {
         updateData.match_status = "completed";
      } else if (match_status) {
         updateData.match_status = match_status;
      } else if (matches.length > 0) {
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
      res.status(400).json({ success: false, message: "Provide matches or match_status to update." });
      return;
    }

    const updatedTie = await LTTie.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Tie updated.", data: updatedTie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteLTMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const deletedTie = await LTTie.findOneAndDelete({ match_id: Number(match_id) });

    if (!deletedTie) {
      res.status(404).json({ success: false, message: "Match/Tie not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Tie deleted.", data: deletedTie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
