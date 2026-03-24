import mongoose, { Document, Schema } from "mongoose";

export interface IPowersportsEvent extends Document {
  event_id: number;
  event_name: "squat" | "deadlift" | "benchpress";
  category: "u63" | "u83" | "a83";
  event_date?: Date;
  venue?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: string;
  gender: "men" | "women";
}

const PowersportsEventSchema = new Schema<IPowersportsEvent>(
  {
    event_id: { type: Number, required: true },
    event_name: {
      type: String,
      enum: ["squat", "deadlift", "benchpress"],
      required: true
    },
    category: {
      type: String,
      enum: ["u63", "u83", "a83"],
      required: true
    },
    event_date: { type: Date },
    venue: { type: String },
    department_1: { type: String, required: true },
    department_2: { type: String, required: true },
    winner: { type: String, default: null },
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

PowersportsEventSchema.index({ event_id: 1, gender: 1 }, { unique: true });

export default mongoose.model<IPowersportsEvent>("PowersportsEvent", PowersportsEventSchema);
