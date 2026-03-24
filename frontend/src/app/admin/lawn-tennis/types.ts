export interface IGame {
  tie_id: number;
  game_name: string; // Singles 1, Singles 2, Doubles (Decider)
  score_dept1: number | '';
  score_dept2: number | '';
}

export interface ILawnTennisMatch {
  _id?: string;
  match_id: string;
  match_type: "singles" | "doubles"; // This might refer to the overall tie type or be redundant now
  category: string;
  stage: string;
  dept_name1: string;
  dept_name2: string;
  series_format: "best_of_7" | "best_of_9" | "full_set";
  games: IGame[];
  winner_dept?: string;
  status: "scheduled" | "completed";
  gender: "men" | "women";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
