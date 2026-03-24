export type ChessGender = "men" | "women";

export interface IChessEvent {
  _id?: string;
  event_id: number;
  event_name: "chess";
  event_date?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: "scheduled" | "completed";
  gender: ChessGender;
  createdAt?: string;
  updatedAt?: string;
}
