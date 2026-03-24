import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  match_id: number;
  sport_type: string;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date: Date;
  venue: string;
  winner: string;
  match_status: string;
}

const MatchSchema: Schema<IMatch> = new Schema<IMatch>(
  {
    match_id: {
      type: Number,
      required: true,
      unique: true
    },
    sport_type: {
      type: String,
      required: true
    },
    match_stage: {
      type: String,
      enum: ["group", "semifinal", "final"],
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
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    winner: {
      type: String,
      default: null
    },
    match_status: {
      type: String,
      enum: ["scheduled", "completed"],
      required: true,
      default: "scheduled"
    }
  },
  { timestamps: true }
);

export default mongoose.model<IMatch>("Match", MatchSchema);
