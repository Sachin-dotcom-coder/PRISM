import { Schema, Connection } from "mongoose";

const FootballTeamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    logo: { type: String, default: "" },
    matches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    group: { type: String, enum: ["A", "B"], default: "A" },
  },
  { timestamps: true }
);

export function getFootballTeamModel(conn: Connection, gender: "m" | "f" = "m") {
  // Matches footballDB → teams_m collection exactly
  const modelName = gender === "f" ? "FootballTeamF" : "FootballTeamM";
  const collectionName = gender === "f" ? "teams_f" : "teams_m";
  return conn.models[modelName] || conn.model(modelName, FootballTeamSchema, collectionName);
}
