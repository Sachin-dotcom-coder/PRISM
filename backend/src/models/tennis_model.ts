import mongoose, { Document, Schema } from "mongoose";

export interface ITennisGame {
  tie_id: number;
  match_type: "singles" | "doubles";
  score_dept1: number;
  score_dept2: number;
  winner_dept: string;
  status: "scheduled" | "ongoing" | "completed";
}

export interface ITennisMatch extends Document {
  match_id: string;
  category: "boys" | "girls";
  stage: "league" | "quarter_final" | "semi_final" | "grand_finale";
  dept_name1: string;
  dept_name2: string;
  games: ITennisGame[];
  winner_dept?: string;
  status: "scheduled" | "ongoing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const TennisGameSchema: Schema<ITennisGame> = new Schema(
  {
    tie_id: {
      type: Number,
      required: true,
    },
    match_type: {
      type: String,
      enum: ["singles", "doubles"],
      required: true,
    },
    score_dept1: {
      type: Number,
      required: true,
    },
    score_dept2: {
      type: Number,
      required: true,
    },
    winner_dept: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
      default: "completed",
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
    category: {
      type: String,
      enum: ["boys", "girls"],
      required: true,
    },
    stage: {
      type: String,
      enum: ["league", "quarter_final", "semi_final", "grand_finale"],
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
      enum: ["scheduled", "ongoing", "completed"],
      default: "completed",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TennisMatch || mongoose.model<ITennisMatch>("TennisMatch", TennisMatchSchema);