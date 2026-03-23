import mongoose, { Schema, Connection } from "mongoose";

const KabaddiLeaderboardSchema = new Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    scoreDiff: { type: Number, default: 0 },
    group: { type: String, default: "A" },
  },
  { timestamps: true, strict: false }
);

const KABADDI_URI = process.env.MONGODB_KABADDI_URI || "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/kabaddiDB?appName=PRISM";
const kabaddiDb = mongoose.createConnection(KABADDI_URI);

export function getKabaddiLeaderboardModel(
  gender: "m" | "f" = "m"
) {
  // ✅ FIX: Match actual MongoDB collection names
  const collectionName =
    gender === "f" ? "teams_f" : "teams";

  const modelName =
    gender === "f"
      ? "KabaddiLeaderboardF"
      : "KabaddiLeaderboard";

  // ✅ SAFE model reuse (prevents overwrite errors)
  return (
    kabaddiDb.models[modelName] ||
    kabaddiDb.model(modelName, KabaddiLeaderboardSchema, collectionName)
  );
}