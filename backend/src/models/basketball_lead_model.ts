import mongoose, { Document, Schema } from "mongoose";

export interface IBasketballLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  category: "boys" | "girls";
  group: string; // e.g. "A", "B"
  createdAt: Date;
  updatedAt: Date;
}

const BasketballLeaderboardSchema: Schema<IBasketballLeaderboard> = new Schema(
  {
    leaderboard_id: {
      type: Number,
      required: true,
      unique: true,
    },
    dept_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["boys", "girls"],
      required: true,
    },
    group: {
      type: String,
      required: true, // e.g. "A", "B"
    },
  },
  {
    timestamps: true,
  }
);

// A department can only be registered once per category
BasketballLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.models.BasketballLeaderboard ||
  mongoose.model<IBasketballLeaderboard>(
    "BasketballLeaderboard",
    BasketballLeaderboardSchema
  );
