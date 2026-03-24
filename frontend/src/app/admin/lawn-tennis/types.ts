export interface IGame {
  tie_id: number;
  score_dept1: number | '';
  score_dept2: number | '';
  status: "scheduled" | "completed";
}

export interface ILawnTennisMatch {
  _id?: string;
  match_id: string;
  match_type: "singles" | "doubles";
  category: string;
  stage: string;
  dept_name1: string;
  dept_name2: string;
  games: IGame[];
  winner_dept?: string;
  status: "scheduled" | "completed";
  gender: "men" | "women";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
