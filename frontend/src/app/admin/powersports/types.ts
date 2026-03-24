export type PowersportsGender = "men" | "women";
export type PowersportsEventName = "squat" | "deadlift" | "benchpress";
export type PowersportsCategory = "u63" | "u83" | "a83";

export interface IPowersportsEvent {
  _id?: string;
  event_id: number;
  event_name: PowersportsEventName;
  category: PowersportsCategory;
  event_date?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: "scheduled" | "completed";
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
  { value: "u63", label: "Under 63kg" },
  { value: "u83", label: "Under 83kg" },
  { value: "a83", label: "Above 83kg" }
];

export const POWERSPORTS_DEPARTMENTS = [
  "CS", "ECE", "EEE", "MECH", "CHEM", "SCI", "AI+MBA", "CIV"
];
