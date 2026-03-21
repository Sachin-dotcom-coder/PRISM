import { Schema, Connection } from "mongoose";

// Matches footballDB → teams_m collection exactly
const FootballTeamSchema = new Schema({
  name:           { type: String },
  shortName:      { type: String },
  matches:        { type: Number, default: 0 },
  wins:           { type: Number, default: 0 },
  draws:          { type: Number, default: 0 },
  losses:         { type: Number, default: 0 },
  goalsFor:       { type: Number, default: 0 },
  goalsAgainst:   { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points:         { type: Number, default: 0 },
  group:          { type: String, enum: ["A", "B"], default: "A" },
}, { timestamps: true, strict: false });

export function getFootballTeamModel(conn: Connection, gender: "m" | "f" = "m") {
  const collectionName = gender === "f" ? "teams_f" : "teams_m";
  const modelName = gender === "f" ? "FootballTeamF" : "FootballTeam";
  return conn.models[modelName] || conn.model(modelName, FootballTeamSchema, collectionName);
}
