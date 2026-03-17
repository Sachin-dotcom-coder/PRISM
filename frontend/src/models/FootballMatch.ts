import { Schema, Connection } from "mongoose";

const GoalSchema = new Schema({
  player: { type: String },
  team: { type: String },
  time: { type: String },
});

const FootballMatchSchema = new Schema(
  {
    match_id: { type: String, required: true, unique: true },
    sport: { type: String, default: "football" },
    status: { 
      type: String, 
      enum: ["UPCOMING", "FIRST_HALF", "HALF_TIME", "SECOND_HALF", "COMPLETED"], 
      default: "UPCOMING" 
    },
    teams: {
      team1: { type: String, required: true },
      team2: { type: String, required: true },
    },
    score: {
      team1: { type: Number, default: 0 },
      team2: { type: Number, default: 0 },
    },
    goals: [GoalSchema],
    result: {
      winner: { type: String, default: null },
      final_score: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export function getFootballMatchModel(conn: Connection, gender: "m" | "f" = "m") {
  const modelName = gender === "f" ? "FootballMatchF" : "FootballMatchM";
  const collectionName = gender === "f" ? "matches_f" : "matches";
  return conn.models[modelName] || conn.model(modelName, FootballMatchSchema, collectionName);
}
