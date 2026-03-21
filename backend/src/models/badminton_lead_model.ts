import mongoose, { Document, Schema } from "mongoose";

export interface IBadmintonLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  event_name: "singles" | "doubles";
  category: "boys" | "girls";
  group: string; // e.g. "A", "B"
  createdAt: Date;
  updatedAt: Date;
}

const BadmintonLeaderboardSchema: Schema<IBadmintonLeaderboard> = new Schema(
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
    event_name: {
      type: String,
      enum: ["singles", "doubles"],
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

// A department can only be registered once per event + category combination
BadmintonLeaderboardSchema.index(
  { dept_name: 1, event_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.models.BadmintonLeaderboard ||
  mongoose.model<IBadmintonLeaderboard>(
    "BadmintonLeaderboard",
    BadmintonLeaderboardSchema
  );
