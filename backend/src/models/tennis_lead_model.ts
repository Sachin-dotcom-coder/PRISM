import mongoose, { Document, Schema } from "mongoose";

export interface ITennisLeaderboard extends Document {
  dept_name: string;
  category: "boys" | "girls";
  group: string;
}

const TennisLeaderboardSchema: Schema<ITennisLeaderboard> = new Schema(
  {
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

export default mongoose.models.TennisLeaderboard || mongoose.model<ITennisLeaderboard>("TennisLeaderboard", TennisLeaderboardSchema);