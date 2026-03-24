import mongoose, { Document, Schema } from "mongoose";

export interface ITTSet {
  team1_score: number;
  team2_score: number;
}

export interface ITTGame {
  game_number: number;
  match_type: "singles" | "doubles";
  sets: ITTSet[];
  team1_score: number;
  team2_score: number;
  winner: string | null;
}

export interface ITTMatch extends Document {
  match_id: number;
  match_name?: string;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  games: ITTGame[];
  total_games: number;
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
}

const TTSetSchema: Schema<ITTSet> = new Schema<ITTSet>({
  team1_score: { type: Number, required: true },
  team2_score: { type: Number, required: true }
});

const TTGameSchema: Schema<ITTGame> = new Schema<ITTGame>({
  game_number: { type: Number, required: true },
  match_type: {
    type: String,
    enum: ["singles", "doubles"],
    required: true,
    default: "singles"
  },
  sets: [TTSetSchema],
  team1_score: { type: Number, required: true },
  team2_score: { type: Number, required: true },
  winner: {
    type: String,
    default: null
  }
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

export default mongoose.model<ITTMatch>("TTMatch", TTMatchSchema);
