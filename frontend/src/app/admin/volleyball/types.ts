export interface IGame {
  game_number: number;
  team1_score: number | '';
  team2_score: number | '';
}

export interface IVolleyballMatch {
  _id?: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date: Date | string;
  team1_score?: number | string;
  team2_score?: number | string;
  games?: IGame[]; 
  total_games?: number; 
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
  createdAt?: string;
  updatedAt?: string;
}
