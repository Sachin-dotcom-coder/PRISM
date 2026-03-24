import mongoose, { Document, Schema } from "mongoose";

export interface IGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface IVolleyballMatch extends Document {
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  games: IGame[];
  total_games: number;
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
}

const GameSchema = new Schema<IGame>({
  game_number: { type: Number, required: true },
  team1_score: { type: Number, required: true, min: 0 },
  team2_score: { type: Number, required: true, min: 0 }
}, { _id: false });

const VolleyballMatchSchema = new Schema<IVolleyballMatch>(
  {
    match_id: { type: Number, required: true, unique: true },
    match_stage: { 
      type: String, 
      required: true 
    },
    team1_department: { type: String, required: true },
    team2_department: { type: String, required: true },
    match_date: { type: Date },
    venue: { type: String },
    team1_score: { type: Number },
    team2_score: { type: Number },
    games: { type: [GameSchema], default: [] },
    total_games: { type: Number, default: 0 },
    winner: { type: String, default: null },
    match_status: {
      type: String,
      enum: ["scheduled", "completed"],
      default: "scheduled"
    },
    gender: {
      type: String,
      enum: ["men", "women"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.VolleyballMatch || mongoose.model<IVolleyballMatch>("VolleyballMatch", VolleyballMatchSchema);
