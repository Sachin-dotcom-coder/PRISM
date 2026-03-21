import mongoose, { Document, Schema } from "mongoose";

export interface IKhoKhoMatch extends Document {
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
}

const KhoKhoMatchSchema = new Schema<IKhoKhoMatch>(
  {
    match_id: { type: Number, required: true, unique: true },
    match_stage: { type: String, required: true },
    team1_department: { type: String, required: true },
    team2_department: { type: String, required: true },
    match_date: { type: Date },
    venue: { type: String },
    team1_score: { type: Number },
    team2_score: { type: Number },
    winner: { type: String, default: null },
    match_status: { 
      type: String, 
      enum: ["scheduled", "ongoing", "completed"], 
      default: "scheduled" 
    },
    gender: { type: String, enum: ["men", "women"], required: true }
  },
  { timestamps: true }
);

export default mongoose.models.KhoKhoMatch || mongoose.model<IKhoKhoMatch>("KhoKhoMatch", KhoKhoMatchSchema);
