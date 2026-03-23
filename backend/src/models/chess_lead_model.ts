import mongoose, { Document, Schema } from "mongoose";

export interface IChessLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  category: "boys" | "girls";
  group: string; // e.g. "A", "B"
  createdAt: Date;
  updatedAt: Date;
}

const ChessLeaderboardSchema: Schema<IChessLeaderboard> = new Schema(
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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A department can only be registered once per category
ChessLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.model<IChessLeaderboard>("ChessLeaderboard", ChessLeaderboardSchema);
