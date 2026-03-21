import mongoose, { Document, Schema } from "mongoose";

export interface IPowersportsLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  category: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

const PowersportsLeaderboardSchema: Schema<IPowersportsLeaderboard> = new Schema(
  {
    leaderboard_id: { type: Number, required: true, unique: true },
    dept_name: { type: String, required: true },
    category: { type: String, required: true },
    group: { type: String, required: true },
  },
  { timestamps: true }
);

PowersportsLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.model<IPowersportsLeaderboard>("PowersportsLeaderboard", PowersportsLeaderboardSchema);
