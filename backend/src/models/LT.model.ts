import mongoose, { Document, Schema } from "mongoose";

export interface ILTGame {
  game_number: number;
  team1_points: number;
  team2_points: number;
  winner: string | null;
}

export interface ILTMatch {
  match_type: string; // "singles" or "doubles"
  player1_team1: string;
  player2_team1?: string;
  player1_team2: string;
  player2_team2?: string;
  games: ILTGame[];
  team1_games_won: number;
  team2_games_won: number;
  winner: string | null;
}

export interface ILTTie extends Document {
  match_id: number;
  match_stage: string;
  team1_name: string;
  team2_name: string;
  match_date?: Date;
  venue?: string;
  matches: ILTMatch[];
  team1_matches_won: number;
  team2_matches_won: number;
  winner: string | null;
  match_status: string;
}

const LTGameSchema = new Schema<ILTGame>({
  game_number: { type: Number, required: true },
  team1_points: { type: Number, required: true, min: 0 },
  team2_points: { type: Number, required: true, min: 0 },
  winner: { type: String, default: null }
});

const LTMatchSchema = new Schema<ILTMatch>({
  match_type: { type: String, enum: ["singles", "doubles"], required: true },
  player1_team1: { type: String, required: true },
  player2_team1: { type: String },
  player1_team2: { type: String, required: true },
  player2_team2: { type: String },
  games: { type: [LTGameSchema], default: [] },
  team1_games_won: { type: Number, default: 0 },
  team2_games_won: { type: Number, default: 0 },
  winner: { type: String, default: null }
});

const LTTieSchema = new Schema<ILTTie>(
  {
    match_id: { type: Number, required: true, unique: true },
    match_stage: { 
      type: String, 
      enum: ["league", "quarterfinal", "semifinal", "final"], 
      required: true 
    },
    team1_name: { type: String, required: true },
    team2_name: { type: String, required: true },
    match_date: { type: Date },
    venue: { type: String },
    matches: { type: [LTMatchSchema], default: [] },
    team1_matches_won: { type: Number, default: 0 },
    team2_matches_won: { type: Number, default: 0 },
    winner: { type: String, default: null },
    match_status: { 
      type: String, 
      enum: ["scheduled", "ongoing", "completed"], 
      default: "scheduled" 
    }
  },
  { timestamps: true }
);

export default mongoose.model<ILTTie>("LTTie", LTTieSchema);
