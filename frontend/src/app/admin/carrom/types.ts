export type CarromGender = "men" | "women";

export interface ICarromEvent {
  _id?: string;
  event_id: number;
  event_name: "carrom";
  event_date?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: "scheduled" | "completed";
  gender: CarromGender;
  createdAt?: string;
  updatedAt?: string;
}
