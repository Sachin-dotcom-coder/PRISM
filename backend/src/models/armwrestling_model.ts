import mongoose, { Document, Schema } from "mongoose";

export interface IArmWrestlingEvent extends Document {
  event_id: number;
  event_name: "right_hand" | "left_hand";
  category: "below_63" | "63_83" | "above_83";
  event_date?: Date;
  venue?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: string;
  gender: "men" | "women";
}

const ArmWrestlingEventSchema = new Schema<IArmWrestlingEvent>(
  {
    event_id: { type: Number, required: true },
    event_name: {
      type: String,
      enum: ["right_hand", "left_hand"],
      required: true
    },
    category: {
      type: String,
      enum: ["below_63", "63_83", "above_83"],
      required: true
    },
    event_date: { type: Date },
    venue: { type: String },
    department_1: { type: String, required: true },
    department_2: { type: String, required: true },
    winner: { type: String, default: null },
    event_status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
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

ArmWrestlingEventSchema.index({ event_id: 1, gender: 1 }, { unique: true });

export default mongoose.model<IArmWrestlingEvent>("ArmWrestlingEvent", ArmWrestlingEventSchema);
