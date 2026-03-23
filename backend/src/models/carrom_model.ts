import mongoose, { Document, Schema } from "mongoose";

export interface ICarromEvent extends Document {
  event_id: number;
  event_name: "carrom";
  event_date?: Date;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: string;
  gender: "men" | "women";
}

const CarromEventSchema = new Schema<ICarromEvent>(
  {
    event_id: { type: Number, required: true },
    event_name: {
      type: String,
      enum: ["carrom"],
      default: "carrom",
      required: true
    },
    event_date: { type: Date },
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

CarromEventSchema.index({ event_id: 1, gender: 1 }, { unique: true });

export default mongoose.model<ICarromEvent>("CarromEvent", CarromEventSchema);
