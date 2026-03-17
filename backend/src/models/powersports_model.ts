import mongoose, { Document, Schema } from "mongoose";

export interface IAttempt {
  attempt_number: number;
  weight: number;
  is_valid: boolean;
}

export interface IParticipant {
  participant_name: string;
  department: string;
  weight_category: string;
  squat_attempts: IAttempt[];
  bench_attempts: IAttempt[];
  deadlift_attempts: IAttempt[];
  best_squat: number;
  best_bench: number;
  best_deadlift: number;
  total_weight: number;
  points?: number;
  rank: number | null;
}

export interface IPowersportsEvent extends Document {
  event_id: number;
  event_name: string;
  event_date?: Date;
  venue?: string;
  participants: IParticipant[];
  winner: string | null;
  event_status: string;
}

const AttemptSchema = new Schema<IAttempt>({
  attempt_number: { type: Number, required: true },
  weight: { type: Number, required: true, min: 0 },
  is_valid: { type: Boolean, default: false }
});

const ParticipantSchema = new Schema<IParticipant>({
  participant_name: { type: String, required: true },
  department: { type: String, required: true },
  weight_category: {
    type: String,
    enum: ["below_63", "63_83", "above_83"],
    required: true
  },
  squat_attempts: { type: [AttemptSchema], default: [] },
  bench_attempts: { type: [AttemptSchema], default: [] },
  deadlift_attempts: { type: [AttemptSchema], default: [] },
  best_squat: { type: Number, default: 0 },
  best_bench: { type: Number, default: 0 },
  best_deadlift: { type: Number, default: 0 },
  total_weight: { type: Number, default: 0 },
  points: { type: Number, required: false }, // Optional Scoring system
  rank: { type: Number, default: null }
});

const PowersportsEventSchema = new Schema<IPowersportsEvent>(
  {
    event_id: { type: Number, required: true, unique: true },
    event_name: { type: String, default: "powerlifting" },
    event_date: { type: Date },
    venue: { type: String },
    participants: { type: [ParticipantSchema], default: [] },
    winner: { type: String, default: null }, // Participant name
    event_status: { 
      type: String, 
      enum: ["scheduled", "ongoing", "completed"], 
      default: "scheduled" 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IPowersportsEvent>("PowersportsEvent", PowersportsEventSchema);
