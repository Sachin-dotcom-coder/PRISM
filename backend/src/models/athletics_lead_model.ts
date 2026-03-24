import mongoose, { Document, Schema } from "mongoose";

export interface IAthleticsLeaderboard extends Document {
  leaderboard_id?: string;
  dept_name: string;
  event_name:
    | "Javelin Throw"
    | "Discus Throw"
    | "Shot Put"
    | "Hammer Throw"
    | "Long Jump"
    | "Triple Jump"
    | "Running";
  category: "M" | "F";
  group: string; // e.g. "A", "B"
  points?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AthleticsLeaderboardSchema: Schema<IAthleticsLeaderboard> = new Schema(
  {
    leaderboard_id: {
      type: String,
      required: false,
    },
    dept_name: {
      type: String,
      required: true,
    },
    event_name: {
      type: String,
      enum: [
        "Javelin Throw",
        "Discus Throw",
        "Shot Put",
        "Hammer Throw",
        "Long Jump",
        "Triple Jump",
        "Running",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["M", "F"],
      required: true,
    },
    group: {
      type: String,
      required: true, // e.g. "A", "B"
    },
    points: {
      type: String,
      default: "0",
    },
  },
  {
    timestamps: true,
    collection: "athleticsleaderboards"
  }
);

// A department can only be registered once per event + category + group combination
AthleticsLeaderboardSchema.index(
  { dept_name: 1, event_name: 1, category: 1, group: 1 },
  { unique: true }
);

export default mongoose.models.AthleticsLeaderboard ||
  mongoose.model<IAthleticsLeaderboard>(
    "AthleticsLeaderboard",
    AthleticsLeaderboardSchema
  );