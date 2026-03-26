import mongoose, { Document, Schema } from "mongoose";

export interface ITennisGame {
  tie_id: number;
  game_name?: string;
  score_dept1: number;
  score_dept2: number;
}

export interface ITennisMatch extends Document {
  match_id: string;
  match_type: "singles" | "doubles";
  category: string;
  stage: string;
  dept_name1: string;
  dept_name2: string;
  games: ITennisGame[];
  winner_dept?: string;
  status: "scheduled" | "completed";
  gender: "men" | "women";
  createdAt: Date;
  updatedAt: Date;
}

const TennisGameSchema: Schema<ITennisGame> = new Schema(
  {
    tie_id: {
      type: Number,
      required: true,
    },
    game_name: {
      type: String,
      required: false,
    },
    score_dept1: {
      type: Number,
      required: true,
    },
    score_dept2: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const TennisMatchSchema: Schema<ITennisMatch> = new Schema(
  {
    match_id: {
      type: String,
      required: true,
      unique: true,
    },
    match_type: {
      type: String,
      enum: ["singles", "doubles"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stage: {
      type: String,
      required: true,
    },
    dept_name1: {
      type: String,
      required: true,
    },
    dept_name2: {
      type: String,
      required: true,
    },
    games: {
      type: [TennisGameSchema],
      default: [],
    },
    winner_dept: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed"],
      default: "completed",
      required: true,
    },
    gender: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TennisMatch || mongoose.model<ITennisMatch>("TennisMatch", TennisMatchSchema);