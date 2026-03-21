export interface IKhoKhoMatch {
  _id?: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date | string;
  venue?: string;
  team1_score?: number | '';
  team2_score?: number | '';
  winner?: string | null;
  match_status: "scheduled" | "ongoing" | "completed";
  gender: "men" | "women";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
