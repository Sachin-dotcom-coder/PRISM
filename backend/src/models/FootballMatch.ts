import { Schema, Connection } from "mongoose";

const GoalSchema = new Schema({
  team: { type: String },
  player: { type: String },
  minute: { type: Number },
}, { strict: false });

const FootballMatchSchema = new Schema(
  {
    match_id: { type: String, required: true, unique: true },
    sport: { type: String, default: "football" },
    status: {
      type: String,
      enum: ["UPCOMING", "FIRST_HALF", "HALF_TIME", "SECOND_HALF", "COMPLETED"],
      default: "UPCOMING",
    },
    teams: {
      team1: { type: String },
      team2: { type: String },
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
  { timestamps: true, strict: false }
);

// Takes a Connection (from createConnection) and returns the model
export function getFootballMatchModel(conn: Connection, gender: "m" | "f" = "m") {
  const collectionName = gender === "f" ? "matches_f" : "footballmatches";
  const modelName = gender === "f" ? "FootballMatchF" : "FootballMatch";
  return conn.models[modelName] || conn.model(modelName, FootballMatchSchema, collectionName);
}
