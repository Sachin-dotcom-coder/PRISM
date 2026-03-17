import mongoose, { Document, Schema } from "mongoose";

export interface IQuarter {
  quarter_number: number; // 1 to 4
  team1_points: number;
  team2_points: number;
}

export interface IScoringBreakdown {
  free_throw: number;
  two_pointer: number;
  three_pointer: number;
}

export interface IBasketballMatch extends Document {
  match_id: number;
  match_stage: string;
  team1_name: string;
  team2_name: string;
  match_date?: Date;
  venue?: string;
  quarters: IQuarter[];
  scoring_breakdown?: {
    team1?: IScoringBreakdown;
    team2?: IScoringBreakdown;
  };
  team1_total_points: number;
  team2_total_points: number;
  winner: string | null;
  match_status: string;
}

const QuarterSchema = new Schema<IQuarter>({
  quarter_number: { type: Number, required: true, min: 1, max: 4 },
  team1_points: { type: Number, required: true, min: 0 },
  team2_points: { type: Number, required: true, min: 0 }
});

const ScoringBreakdownSchema = new Schema<IScoringBreakdown>({
  free_throw: { type: Number, min: 0, default: 0 },
  two_pointer: { type: Number, min: 0, default: 0 },
  three_pointer: { type: Number, min: 0, default: 0 }
});

const BasketballMatchSchema = new Schema<IBasketballMatch>(
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
    quarters: { type: [QuarterSchema], default: [] },
    scoring_breakdown: {
      team1: { type: ScoringBreakdownSchema },
      team2: { type: ScoringBreakdownSchema }
    },
    team1_total_points: { type: Number, default: 0 },
    team2_total_points: { type: Number, default: 0 },
    winner: { type: String, default: null }, // Team name or 'draw'
    match_status: { 
      type: String, 
      enum: ["scheduled", "ongoing", "completed"], 
      default: "scheduled" 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IBasketballMatch>("BasketballMatch", BasketballMatchSchema);
