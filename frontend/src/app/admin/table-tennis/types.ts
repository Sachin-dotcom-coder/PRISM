export interface IGame {
  game_number: number;
  match_type: "singles" | "doubles";
  team1_score: number | '';
  team2_score: number | '';
  winner?: string | null;
}

export interface ITableTennisMatch {
  _id?: string;
  match_id: number;
  match_stage: string;
  match_type?: "singles" | "doubles";
  team1_department: string;
  team2_department: string;
  match_date: Date | string;
  team1_score?: number | string;
  team2_score?: number | string;
  games: IGame[];
  total_games: number;
  winner: string | null;
  match_status: string;
  gender: "men" | "women";
}
