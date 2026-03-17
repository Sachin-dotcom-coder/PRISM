import { Schema, Connection } from "mongoose";

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    logo: { type: String, default: "" },
    matches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    nrr: { type: Number, default: 0.0 },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export function getTeamModel(conn: Connection, gender: "m" | "f" = "m") {
  const modelName = gender === "f" ? "TeamF" : "Team";
  const collectionName = gender === "f" ? "teams_f" : "teams";
  return conn.models[modelName] || conn.model(modelName, TeamSchema, collectionName);
}
