import mongoose, { Document, Schema } from "mongoose";

export interface IPowersportsLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  category: string;
  group: string;
  gender: "M" | "F";
  createdAt: Date;
  updatedAt: Date;
}

const PowersportsLeaderboardSchema: Schema<IPowersportsLeaderboard> = new Schema(
  {
    dept_name: { type: String, required: true },
    category: { type: String, required: true },
    group: { type: String, required: true },
    gender: { type: String, enum: ["M", "F"], required: true },
  },
  { timestamps: true }
);

PowersportsLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.model<IPowersportsLeaderboard>("PowersportsLeaderboard", PowersportsLeaderboardSchema);
