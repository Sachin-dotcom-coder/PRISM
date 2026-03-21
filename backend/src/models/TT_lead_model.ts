import mongoose, { Document, Schema } from "mongoose";

export interface ITTLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  category: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

const TTLeaderboardSchema: Schema<ITTLeaderboard> = new Schema(
  {
    leaderboard_id: { type: Number, required: true, unique: true },
    dept_name: { type: String, required: true },
    category: { type: String, required: true },
    group: { type: String, required: true },
  },
  { timestamps: true }
);

TTLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.model<ITTLeaderboard>("TTLeaderboard", TTLeaderboardSchema);
