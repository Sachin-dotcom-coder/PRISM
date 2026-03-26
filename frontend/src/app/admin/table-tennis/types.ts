export interface ITTSet {
  team1_score: number | '';
  team2_score: number | '';
}

export interface IGame {
  game_number: number;
  match_type: "singles" | "doubles";
  sets: ITTSet[];
  team1_score: number | '';
  team2_score: number | '';
  winner?: string | null;
}

export interface ITableTennisMatch {
  _id?: string;
  match_id: number;
  match_stage: string;
  team1_department: string;
  team2_department: string;
  match_date: Date | string;
  venue?: string;
  team1_score?: number | string;
  team2_score?: number | string;
  games: IGame[];
  total_games: number;
  winner: string | null;
  match_status: "scheduled" | "completed";
  gender: "men" | "women";
  match_type: string;
}
