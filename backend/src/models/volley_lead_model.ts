import mongoose, { Document, Schema } from "mongoose";

export interface IVolleyballLeaderboard extends Document {
  dept_name: string;
  category: "men" | "women";
  group: string; // e.g. "A", "B", "C"
  points: string;
  Lost: string;
  Matches: string;
  Won: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolleyballLeaderboardSchema: Schema<IVolleyballLeaderboard> = new Schema(
  {
    dept_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },
    group: {
      type: String,
      required: true, // e.g. "A", "B"
    },
    points: { type: String, default: "0" },
    Lost: { type: String, default: "0" },
    Matches: { type: String, default: "0" },
    Won: { type: String, default: "0" },
  },
  {
    timestamps: true,
  }
);

// Compound unique: same dept can't appear twice in same category
VolleyballLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.models.VolleyballLeaderboard ||
  mongoose.model<IVolleyballLeaderboard>(
    "VolleyballLeaderboard",
    VolleyballLeaderboardSchema
  );
