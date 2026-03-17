import { Request, Response } from "express";
import TTMatch, { ITTGame } from "../models/TT.model";

// Helper function to validate games
const validateGames = (games: ITTGame[], stage: string, team1_name: string, team2_name: string) => {
  let team1Wins = 0;
  let team2Wins = 0;
  
  const maxGames = stage === "final" ? 5 : 3;
  const gamesNeededToWin = stage === "final" ? 3 : 2;

  if (games.length > maxGames) {
    return { valid: false, error: `Maximum allowed games for ${stage} is ${maxGames}.` };
  }

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    
    // Validate score logic (must reach 11, and win by 2)
    const isDeuce = game.team1_score >= 10 && game.team2_score >= 10;
    const scoreDiff = Math.abs(game.team1_score - game.team2_score);
    const maxScore = Math.max(game.team1_score, game.team2_score);

    if (!isDeuce && maxScore < 11) {
      return { valid: false, error: `Game ${game.game_number}: A game requires at least 11 points to win.` };
    }

    if (maxScore >= 11 && scoreDiff < 2) {
      return { valid: false, error: `Game ${game.game_number}: Must win by at least 2 points.` };
    }

    // Determine actual winner of the game
    const expectedWinner = game.team1_score > game.team2_score ? team1_name : team2_name;
    if (game.winner !== expectedWinner) {
       return { valid: false, error: `Game ${game.game_number}: Provided winner (${game.winner}) does not match the scores.` };
    }

    if (expectedWinner === team1_name) team1Wins++;
    else team2Wins++;

    // Check if match was already won before this game
    if (i < games.length - 1 && (team1Wins === gamesNeededToWin || team2Wins === gamesNeededToWin)) {
        return { valid: false, error: `Match already won. Extra games found.` };
    }
  }

  let matchWinner = null;
  let status = "ongoing";

  if (team1Wins === gamesNeededToWin) {
    matchWinner = team1_name;
    status = "completed";
  } else if (team2Wins === gamesNeededToWin) {
    matchWinner = team2_name;
    status = "completed";
  } else if (games.length === 0) {
    status = "scheduled";
  }

  return { valid: true, team1Wins, team2Wins, matchWinner, status };
};

export const createTTMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      match_id, match_name, match_stage, team1_name, team2_name, match_date, venue, games
    } = req.body;

    if (match_id === undefined || !match_stage || !team1_name || !team2_name) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    const gamesArr = games || [];
    const validation = validateGames(gamesArr, match_stage, team1_name, team2_name);
    
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.error });
      return;
    }

    const newMatch = new TTMatch({
      match_id,
      match_name,
      match_stage,
      team1_name,
      team2_name,
      match_date,
      venue,
      games: gamesArr,
      total_games: gamesArr.length,
      winner: validation.matchWinner,
      match_status: validation.status !== "scheduled" ? validation.status : (req.body.match_status || "scheduled")
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ success: true, message: "Match created successfully.", data: savedMatch });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "match_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllTTMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await TTMatch.find();
    res.status(200).json({ success: true, message: "Matches fetched.", data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getTTMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const match = await TTMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Match fetched.", data: match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateTTMatchScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const { games, match_status } = req.body;

    const match = await TTMatch.findOne({ match_id: Number(match_id) });
    if (!match) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    const updateData: any = {};
    
    if (games) {
      const validation = validateGames(games, match.match_stage, match.team1_name, match.team2_name);
      if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }
      updateData.games = games;
      updateData.total_games = games.length;
      updateData.winner = validation.matchWinner;
      
      // Override status based on games if it completes the match
      if (validation.status === "completed") {
         updateData.match_status = "completed";
      } else if (match_status) {
         updateData.match_status = match_status;
      } else if (games.length > 0) {
         updateData.match_status = "ongoing";
      }
    } else if (match_status) {
      updateData.match_status = match_status;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "Provide games or match_status to update." });
      return;
    }

    const updatedMatch = await TTMatch.findOneAndUpdate(
      { match_id: Number(match_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Match updated.", data: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteTTMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { match_id } = req.params;
    const deletedMatch = await TTMatch.findOneAndDelete({ match_id: Number(match_id) });

    if (!deletedMatch) {
      res.status(404).json({ success: false, message: "Match not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Match deleted.", data: deletedMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
