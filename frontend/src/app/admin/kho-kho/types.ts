export interface IKhoKhoMatch {
  _id?: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date?: Date | string;
  team1_score?: number | '';
  team2_score?: number | '';
  winner?: string | null;
  venue?: string;
  match_status: "scheduled" | "completed";
  gender: "men" | "women";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
