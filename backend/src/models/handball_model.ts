import mongoose, { Document, Schema } from "mongoose";

export interface IHalf {
  half_number: number; // 1 or 2
  team1_goals: number;
  team2_goals: number;
}

export interface IExtraTime {
  period_number: number;
  team1_goals: number;
  team2_goals: number;
}

export interface IHandballMatch extends Document {
  match_id: number;
  match_stage: string;
  team1_name: string;
  team2_name: string;
  match_date?: Date;
  venue?: string;
  halves: IHalf[];
  extra_time: IExtraTime[];
  team1_total_goals: number;
  team2_total_goals: number;
  winner: string | null;
  match_status: string;
}

const HalfSchema = new Schema<IHalf>({
  half_number: { type: Number, required: true, enum: [1, 2] },
  team1_goals: { type: Number, required: true, min: 0 },
  team2_goals: { type: Number, required: true, min: 0 }
});

const ExtraTimeSchema = new Schema<IExtraTime>({
  period_number: { type: Number, required: true, min: 1 },
  team1_goals: { type: Number, required: true, min: 0 },
  team2_goals: { type: Number, required: true, min: 0 }
});

const HandballMatchSchema = new Schema<IHandballMatch>(
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
    halves: { type: [HalfSchema], default: [] },
    extra_time: { type: [ExtraTimeSchema], default: [] },
    team1_total_goals: { type: Number, default: 0 },
    team2_total_goals: { type: Number, default: 0 },
    winner: { type: String, default: null }, // Team name or 'draw'
    match_status: { 
      type: String, 
      enum: ["scheduled", "ongoing", "completed"], 
      default: "scheduled" 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IHandballMatch>("HandballMatch", HandballMatchSchema);
