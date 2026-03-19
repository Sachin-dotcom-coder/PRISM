import mongoose, { Document, Schema } from "mongoose";

export interface IAthleticsLeaderboard extends Document {
  leaderboard_id: number;
  dept_name: string;
  event_name:
    | "hammer_throw"
    | "shot_put"
    | "javelin"
    | "discus"
    | "long_jump"
    | "triple_jump"
    | "double_jump";
  category: "boys" | "girls";
  group: string; // e.g. "A", "B"
  createdAt: Date;
  updatedAt: Date;
}

const AthleticsLeaderboardSchema: Schema<IAthleticsLeaderboard> = new Schema(
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
      enum: [
        "hammer_throw",
        "shot_put",
        "javelin",
        "discus",
        "long_jump",
        "triple_jump",
        "double_jump",
      ],
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
AthleticsLeaderboardSchema.index(
  { dept_name: 1, event_name: 1, category: 1 },
  { unique: true }
);

export default mongoose.models.AthleticsLeaderboard ||
  mongoose.model<IAthleticsLeaderboard>(
    "AthleticsLeaderboard",
    AthleticsLeaderboardSchema
  );