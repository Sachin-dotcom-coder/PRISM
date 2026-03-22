import mongoose, { Document, Schema } from "mongoose";

export interface ITugOfWarEvent extends Document {
  event_id: number;
  event_name: "tug_of_war";
  event_date?: Date;
  venue?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: string;
  gender: "men" | "women";
}

const TugOfWarEventSchema = new Schema<ITugOfWarEvent>(
  {
    event_id: { type: Number, required: true },
    event_name: {
      type: String,
      enum: ["tug_of_war"],
      default: "tug_of_war",
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

TugOfWarEventSchema.index({ event_id: 1, gender: 1 }, { unique: true });

export default mongoose.model<ITugOfWarEvent>("TugOfWarEvent", TugOfWarEventSchema);
