import mongoose, { Document, Schema } from "mongoose";

export interface IVolleyballLeaderboard extends Document {
  dept_name: string;
  category: "boys" | "girls";
  group: string; // e.g. "A", "B", "C"
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

// Compound unique: same dept can't appear twice in same category
VolleyballLeaderboardSchema.index(
  { dept_name: 1, category: 1 },
  { unique: true }
);

const VOLLEYBALL_URI = process.env.MONGODB_VOLLEYBALL_URI || 
  "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/volleyballDB?appName=PRISM";

const volleyballDb = mongoose.createConnection(VOLLEYBALL_URI);

export default volleyballDb.models.VolleyballLeaderboard ||
  volleyballDb.model<IVolleyballLeaderboard>(
    "VolleyballLeaderboard",
    VolleyballLeaderboardSchema
  );
