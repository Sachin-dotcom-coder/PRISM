export type ArmWrestlingGender = "men" | "women";
export type ArmWrestlingEventName = "right_hand" | "left_hand";
export type ArmWrestlingCategory = "below_63" | "63_83" | "above_83";

export interface IArmWrestlingEvent {
  _id?: string;
  event_id: number;
  event_name: ArmWrestlingEventName;
  category: ArmWrestlingCategory;
  event_date?: string;
  department_1: string;
  department_2: string;
  winner: string | null;
  event_status: "scheduled" | "completed";
  gender: ArmWrestlingGender;
  createdAt?: string;
  updatedAt?: string;
}

export const ARM_WRESTLING_EVENT_OPTIONS: { value: ArmWrestlingEventName; label: string }[] = [
  { value: "right_hand", label: "Right Hand" },
  { value: "left_hand", label: "Left Hand" }
];

export const ARM_WRESTLING_CATEGORY_OPTIONS: { value: ArmWrestlingCategory; label: string }[] = [
  { value: "below_63", label: "Below 63" },
  { value: "63_83", label: "63 to 83" },
  { value: "above_83", label: "Above 83" }
];
