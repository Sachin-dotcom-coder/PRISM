import mongoose, { Document, Schema } from "mongoose";

export interface ITTGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
  winner: string;
}

export interface ITTMatch extends Document {
  match_id: number;
  match_name?: string;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date;
  venue?: string;
  games: ITTGame[];
  total_games: number;
  winner: string | null;
  match_status: string;
}

const TTGameSchema: Schema<ITTGame> = new Schema<ITTGame>({
  game_number: { type: Number, required: true },
  team1_score: { type: Number, required: true },
  team2_score: { type: Number, required: true }
});

const TTMatchSchema: Schema<ITTMatch> = new Schema<ITTMatch>(
  {
    match_id: {
      type: Number,
      required: true,
      unique: true
    },
    match_name: {
      type: String
    },
    match_stage: {
      type: String,
      required: true
    },
    team1_department: {
      type: String,
      required: true
    },
    team2_department: {
      type: String,
      required: true
    },
    match_date: {
      type: Date
    },
    venue: {
      type: String
    },
    games: [TTGameSchema],
    team1_score: {
      type: Number,
      default: 0
    },
    team2_score: {
      type: Number,
      default: 0
    },
    total_games: {
      type: Number,
      default: 0
    },
    winner: {
      type: String,
      default: null
    },
    match_status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
      default: "scheduled"
    }
  },
  { timestamps: true }
);

export default mongoose.model<ITTMatch>("TTMatch", TTMatchSchema);
