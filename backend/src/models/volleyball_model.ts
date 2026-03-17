import mongoose, { Document, Schema } from "mongoose";

export interface IVolleyballMatch extends Document {
  match_id: string;
  category: "boys" | "girls";
  stage: "league" | "quarter_final" | "semi_final" | "grand_finale";
  best_of: 3 | 5;
  points_per_set: 15 | 25;
  status: "scheduled" | "ongoing" | "completed";
  dept_name1: string;
  dept_name2: string;
  winner_dept?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolleyballMatchSchema: Schema<IVolleyballMatch> = new Schema(
  {
    match_id: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["boys", "girls"],
      required: true,
    },
    stage: {
      type: String,
      enum: ["league", "quarter_final", "semi_final", "grand_finale"],
      required: true,
    },
    best_of: {
      type: Number,
      enum: [3, 5],
    },
    points_per_set: {
      type: Number,
      enum: [15, 25],
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
      default: "scheduled",
      required: true,
    },
    dept_name1: {
      type: String,
      required: true,
    },
    dept_name2: {
      type: String,
      required: true,
    },
    winner_dept: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Pre-validate hook to automatically set best_of and points_per_set based on rules

VolleyballMatchSchema.pre<IVolleyballMatch>("validate", async function () {
  if (this.stage === "league") {
    this.best_of = 3;
    this.points_per_set = 15;
  } else if (this.stage === "quarter_final" || this.stage === "semi_final") {
    this.best_of = 3;
    this.points_per_set = this.category === "boys" ? 25 : 15;
  } else if (this.stage === "grand_finale") {
    this.best_of = this.category === "boys" ? 5 : 3;
    this.points_per_set = 25;
  }
});


export default mongoose.models.VolleyballMatch || mongoose.model<IVolleyballMatch>("VolleyballMatch", VolleyballMatchSchema);
