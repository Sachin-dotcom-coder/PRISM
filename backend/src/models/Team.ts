import { Schema, model, models } from "mongoose";

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "",
    },
    matches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    nrr: { type: Number, default: 0.0 },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);
import mongoose from "mongoose";

export function getTeamModel(gender: "m" | "f" = "m") {
  const collectionName = gender === "f" ? "teams_f" : "teams";
  const modelName = gender === "f" ? "TeamF" : "Team";
  return mongoose.models[modelName] || mongoose.model(modelName, TeamSchema, collectionName);
}
