import mongoose, { Schema } from "mongoose";

const RaidSchema = new Schema({
  raid_id: { type: String },
  raider: { type: String },
  result: { type: String, enum: ["SUCCESSFUL", "FAILED", "EMPTY RAID", "SUPER RAID", "UNSUCCESSFUL"] },
  points_scored: { type: Number, default: 0 }
}, { strict: false });

const HalfSchema = new Schema({
  half_number: { type: Number },
  team_a_score: { type: Number, default: 0 },
  team_b_score: { type: Number, default: 0 }
}, { strict: false });

const KabaddiMatchSchema = new Schema(
  {
    match_id: { type: String, required: true, unique: true },
    sport: { type: String, default: "kabaddi" },
    format: { type: String, default: "Standard" },
    status: {
      type: String,
      enum: ["UPCOMING", "LIVE", "COMPLETED"],
      default: "UPCOMING",
    },
    teams: {
      team_a: { 
        name: { type: String },
        score: { type: Number, default: 0 }
      },
      team_b: { 
        name: { type: String },
        score: { type: Number, default: 0 }
      },
    },
    date: { type: String },
    startTime: { type: String },
    current_half: { type: Number, default: 1 },
    recent_raids: [RaidSchema],
    halves: [HalfSchema]
  },
  { timestamps: true, strict: false }
);

const KABADDI_URI = process.env.MONGODB_KABADDI_URI || "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/kabaddiDB?appName=PRISM";
const kabaddiDb = mongoose.createConnection(KABADDI_URI);

export function getKabaddiMatchModel(gender: "m" | "f" = "m") {
  const collectionName = gender === "f" ? "kabaddimatches_f" : "kabaddimatches";
  const modelName = gender === "f" ? "KabaddiMatchF" : "KabaddiMatch";
  return kabaddiDb.models[modelName] || kabaddiDb.model(modelName, KabaddiMatchSchema, collectionName);
}
