import mongoose, { Document, Schema } from "mongoose";

export interface IParticipant {
  participant_name: string;
  department: string;
  performance: number;
  rank: number | null;
}

export interface IAthleticsEvent extends Document {
  event_id: number;
  event_name: string;
  event_type: "throw" | "jump" | "run";
  event_date?: Date;
  venue?: string;
  participants: IParticipant[];
  winner: string | null;
  event_status: string;
  gender: "men" | "women";
}

const ParticipantSchema = new Schema<IParticipant>({
  participant_name: { type: String, required: true },
  department: { type: String, required: true },
  performance: { type: Number, required: true, min: 0 },
  rank: { type: Number, default: null }
});

const AthleticsEventSchema = new Schema<IAthleticsEvent>(
  {
    event_id: { type: Number, required: true },
    event_name: { 
      type: String, 
      enum: [
        "hammer_throw",
        "shot_put",
        "discus",
        "javelin",
        "long_jump",
        "triple_jump",
        "running_5000m",
        "running_3000m"
      ], 
      required: true 
    },
    event_type: { 
      type: String, 
      enum: ["throw", "jump", "run"], 
      required: true 
    },
    event_date: { type: Date },
    venue: { type: String },
    participants: { type: [ParticipantSchema], default: [] },
    winner: { type: String, default: null }, // Participant name
    event_status: { 
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

AthleticsEventSchema.index({ event_id: 1, gender: 1 }, { unique: true });

export default mongoose.model<IAthleticsEvent>("AthleticsEvent", AthleticsEventSchema);
