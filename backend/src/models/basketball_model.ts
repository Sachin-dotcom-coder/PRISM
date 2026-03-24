import mongoose, { Document, Schema } from "mongoose";

export interface IGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface IBasketballMatch extends Document {
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date;
  venue?: string;
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

const BasketballMatchSchema = new Schema<IBasketballMatch>(
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
    games: { type: [GameSchema], default: [] },
    total_games: { type: Number, default: 1 },
    winner: { type: String, default: null }, // Team name or 'draw'
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

export default mongoose.models.BasketballMatch || mongoose.model<IBasketballMatch>("BasketballMatch", BasketballMatchSchema);
