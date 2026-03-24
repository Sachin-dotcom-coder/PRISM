export type AthleticsGender = "men" | "women";
export type AthleticsEventType = "throw" | "jump" | "run";
export type AthleticsCategory = "throw" | "run_jump";
export type AthleticsEventName =
  | "hammer_throw"
  | "shot_put"
  | "discus"
  | "javelin"
  | "long_jump"
  | "triple_jump"
  | "running_5000m"
  | "running_3000m";

export interface IParticipant {
  participant_name: string;
  department: string;
  performance: number | string;
  rank: number | null;
}

export interface IAthleticsEvent {
  _id?: string;
  event_id: number;
  event_name: AthleticsEventName;
  event_type: AthleticsEventType;
  event_date?: string;
  participants: IParticipant[];
  winner: string | null;
  event_status: "scheduled" | "ongoing" | "completed";
  gender: AthleticsGender;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventOption {
  value: AthleticsEventName;
  label: string;
  eventType: AthleticsEventType;
  genders: AthleticsGender[];
}

export const THROW_EVENT_OPTIONS: EventOption[] = [
  { value: "hammer_throw", label: "Hammer Throw", eventType: "throw", genders: ["men", "women"] },
  { value: "shot_put", label: "Shot Put", eventType: "throw", genders: ["men", "women"] },
  { value: "discus", label: "Discus", eventType: "throw", genders: ["men", "women"] },
  { value: "javelin", label: "Javelin", eventType: "throw", genders: ["men", "women"] }
];

export const RUN_JUMP_EVENT_OPTIONS: EventOption[] = [
  { value: "long_jump", label: "Long Jump", eventType: "jump", genders: ["men", "women"] },
  { value: "triple_jump", label: "Triple Jump", eventType: "jump", genders: ["men", "women"] },
  { value: "running_5000m", label: "Running 5000m", eventType: "run", genders: ["men"] },
  { value: "running_3000m", label: "Running 3000m", eventType: "run", genders: ["women"] }
];

export const CATEGORY_OPTIONS = {
  throw: THROW_EVENT_OPTIONS,
  run_jump: RUN_JUMP_EVENT_OPTIONS
} as const;

export const getEventOptions = (
  category: AthleticsCategory,
  gender: AthleticsGender
) => CATEGORY_OPTIONS[category].filter((option) => option.genders.includes(gender));

export const getEventMeta = (eventName: AthleticsEventName) =>
  [...THROW_EVENT_OPTIONS, ...RUN_JUMP_EVENT_OPTIONS].find(
    (option) => option.value === eventName
  );

export type AthleticsLeadEventName =
  | "Javelin Throw"
  | "Discus Throw"
  | "Shot Put"
  | "Hammer Throw"
  | "Long Jump"
  | "Triple Jump"
  | "Running";

export const ATHLETICS_LEAD_EVENT_OPTIONS: AthleticsLeadEventName[] = [
  "Javelin Throw",
  "Discus Throw",
  "Shot Put",
  "Hammer Throw",
  "Long Jump",
  "Triple Jump",
  "Running"
];

export interface ATeam {
  _id?: string;
  dept_name: string;
  event_name: AthleticsLeadEventName;
  category: "M" | "F";
  group: string;
  points?: string | number;
}
