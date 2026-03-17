import { Schema, Connection } from "mongoose";

const HomepageTeamSchema = new Schema({
  name:      { type: String },
  shortName: { type: String },
  First:     { type: Number, default: 0 },  // 1st place finishes
  Second:    { type: Number, default: 0 },  // 2nd place finishes
  Third:     { type: Number, default: 0 },  // 3rd place finishes
  points:    { type: Number, default: 0 },
}, { timestamps: true, strict: false });

export function getHomepageTeamModel(conn: Connection, gender: "m" | "f" = "m") {
  const modelName = gender === "f" ? "LeaderboardF" : "Leaderboard";
  const collectionName = gender === "f" ? "Leaderboard_f" : "Leaderboard";
  return conn.models[modelName] || conn.model(modelName, HomepageTeamSchema, collectionName);
}
