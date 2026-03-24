import mongoose, { Document, Schema } from "mongoose";

export interface ISet {
  team1_score: number;
  team2_score: number;
}

export interface IGame {
  game_number: number;
  game_type: "single" | "double";
  sets: ISet[];
  team1_score: number;
  team2_score: number;
  winner: string | null;
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

const SetSchema: Schema<ISet> = new Schema<ISet>({
  team1_score: { type: Number, default: 0 },
  team2_score: { type: Number, default: 0 }
});

const GameSchema: Schema<IGame> = new Schema<IGame>({
  game_number: {
    type: Number,
    required: true
  },
  game_type: {
    type: String,
    enum: ["single", "double"],
    default: "single"
  },
  sets: {
    type: [SetSchema],
    default: () => [
      { team1_score: 0, team2_score: 0 },
      { team1_score: 0, team2_score: 0 },
      { team1_score: 0, team2_score: 0 }
    ]
  },
  team1_score: {
    type: Number,
    default: 0
  },
  team2_score: {
    type: Number,
    default: 0
  },
  winner: {
    type: String,
    default: null
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
      enum: ["scheduled", "completed"],
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
