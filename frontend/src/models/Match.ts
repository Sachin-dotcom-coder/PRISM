import { Schema, Connection } from "mongoose";

const PlayerSchema = new Schema({
  id: { type: Number },
  name: { type: String },
  role: { type: String },
}, { strict: false });

const BattingStatsSchema = new Schema({
  batter: { type: String },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0.0 },
  status: { type: String, default: "not out" },
}, { strict: false });

const BowlingStatsSchema = new Schema({
  bowler: { type: String },
  overs: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  economyRates: { type: String, default: "0.0" },
}, { strict: false });

const InningsSchema = new Schema({
  team: { type: String },
  batting_team: { type: String }, 
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0.0 },
  fow: [{ score: Schema.Types.Mixed, wicket: Number, over: Schema.Types.Mixed }],
  batters: [BattingStatsSchema],
  bowlers: [BowlingStatsSchema],
}, { strict: false });

const MatchSchema = new Schema(
  {
    match_id: { type: String, required: true, unique: true },
    title: { type: String },
    sport: { type: String, default: "cricket" },
    format: { type: String, default: "T20" },
    status: { type: String, enum: ["UPCOMING", "LIVE", "COMPLETED"], default: "UPCOMING" },
    date: { type: String },
    startTime: { type: String },
    teams: {
      team1: {
        name: { type: String },
        shortName: { type: String },
        logo: { type: String },
        players: [PlayerSchema],
      },
      team2: {
        name: { type: String },
        shortName: { type: String },
        logo: { type: String },
        players: [PlayerSchema],
      },
    },
    toss: {
      winner: { type: String },
      decision: { type: String },
    },
    current_innings: { type: Number, default: 1 },
    innings: [InningsSchema],
    recent_balls: [{ type: String }],
    striker: { type: String },
    nonStriker: { type: String },
    currentBowler: { type: String },
    result: { type: Schema.Types.Mixed },
  },
  { timestamps: true, strict: false }
);

export function getMatchModel(conn: Connection, gender: "m" | "f" = "m") {
  const modelName = gender === "f" ? "MatchF" : "Match";
  const collectionName = gender === "f" ? "matches_f" : "matches";
  return conn.models[modelName] || conn.model(modelName, MatchSchema, collectionName);
}
