export type TugOfWarGender = "men" | "women";
export type TugOfWarEventName = "tug_of_war";

export interface ITugOfWarEvent {
  _id?: string;
  event_id: number;
  event_name: TugOfWarEventName;
  event_date?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: "scheduled" | "ongoing" | "completed";
  gender: TugOfWarGender;
  createdAt?: string;
  updatedAt?: string;
}
