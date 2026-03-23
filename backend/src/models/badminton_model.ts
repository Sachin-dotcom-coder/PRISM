import mongoose, { Document, Schema } from "mongoose";

export interface IGame {
  game_number: number;
  team1_score: number;
  team2_score: number;
}

export interface IBadmintonMatch extends Document {
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date: Date;
  venue?: string;
  games: IGame[];
  team1_score: number;
  team2_score: number;
  total_games: number;
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
}

const GameSchema: Schema<IGame> = new Schema<IGame>({
  game_number: {
    type: Number,
    required: true
  },
  team1_score: {
    type: Number,
    required: true
  },
  team2_score: {
    type: Number,
    required: true
  }
});

const BadmintonMatchSchema: Schema<IBadmintonMatch> = new Schema<IBadmintonMatch>(
  {
    match_id: {
      type: Number,
      required: true,
      unique: true
    },
    match_stage: {
      type: String,
      enum: ["group", "semifinal", "final"],
      required: true
    },
    team1_department: {
      type: String,
      required: true
    },
    team2_department: {
      type: String,
      required: true
    },
    match_date: {
      type: Date,
      required: true
    },
    venue: {
      type: String
    },

    // ✅ NEW: Game-wise scores
    games: {
      type: [GameSchema],
      default: []
    },

    // ✅ Overall Match Scores
    team1_score: {
      type: Number,
      default: 0
    },
    team2_score: {
      type: Number,
      default: 0
    },

    // ✅ NEW: total number of games played
    total_games: {
      type: Number,
      default: 0
    },

    winner: {
      type: String,
      default: null
    },

    match_status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
      default: "scheduled"
    },
    gender: {
      type: String,
      enum: ["men", "women"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IBadmintonMatch>("BadmintonMatch", BadmintonMatchSchema);
