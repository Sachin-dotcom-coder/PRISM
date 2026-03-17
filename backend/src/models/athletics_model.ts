import mongoose, { Document, Schema } from "mongoose";

export interface IAttempt {
  attempt_number: number;
  performance: number; // distance in meters
  is_foul: boolean;
}

export interface IParticipant {
  participant_name: string;
  department: string;
  attempts: IAttempt[];
  best_performance: number;
  rank: number | null;
}

export interface IAthleticsEvent extends Document {
  event_id: number;
  event_name: string;
  event_type: string;
  event_date?: Date;
  venue?: string;
  participants: IParticipant[];
  winner: string | null;
  event_status: string;
}

const AttemptSchema = new Schema<IAttempt>({
  attempt_number: { type: Number, required: true },
  performance: { type: Number, required: true, min: 0 },
  is_foul: { type: Boolean, default: false }
});

const ParticipantSchema = new Schema<IParticipant>({
  participant_name: { type: String, required: true },
  department: { type: String, required: true },
  attempts: { type: [AttemptSchema], default: [] },
  best_performance: { type: Number, default: 0 },
  rank: { type: Number, default: null }
});

const AthleticsEventSchema = new Schema<IAthleticsEvent>(
  {
    event_id: { type: Number, required: true, unique: true },
    event_name: { 
      type: String, 
      enum: ["hammer_throw", "shot_put", "javelin", "discus", "long_jump", "triple_jump", "double_jump"], 
      required: true 
    },
    event_type: { 
      type: String, 
      enum: ["throw", "jump"], 
      required: true 
    },
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

export default mongoose.model<IAthleticsEvent>("AthleticsEvent", AthleticsEventSchema);
