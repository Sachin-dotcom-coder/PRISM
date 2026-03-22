export type PowersportsGender = "men" | "women";
export type PowersportsEventName = "squat" | "deadlift" | "benchpress";
export type PowersportsCategory = "below_63" | "63_83" | "above_83";

export interface IPowersportsEvent {
  _id?: string;
  event_id: number;
  event_name: PowersportsEventName;
  category: PowersportsCategory;
  event_date?: string;
  venue?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: "scheduled" | "ongoing" | "completed";
  gender: PowersportsGender;
  createdAt?: string;
  updatedAt?: string;
}

export const POWERSPORTS_EVENT_OPTIONS: { value: PowersportsEventName; label: string }[] = [
  { value: "squat", label: "Squat" },
  { value: "deadlift", label: "Deadlift" },
  { value: "benchpress", label: "Benchpress" }
];

export const POWERSPORTS_CATEGORY_OPTIONS: { value: PowersportsCategory; label: string }[] = [
  { value: "below_63", label: "Below 63" },
  { value: "63_83", label: "63 to 83" },
  { value: "above_83", label: "Above 83" }
];
