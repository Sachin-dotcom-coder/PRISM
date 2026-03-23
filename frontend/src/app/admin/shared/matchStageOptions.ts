export const MATCH_STAGE_OPTIONS = [
  { value: "group", label: "Group" },
  { value: "league", label: "League" },
  { value: "misc", label: "Misc" },
  { value: "quarter_final", label: "Quarter Finals" },
  { value: "semifinal", label: "Semi Finals" },
  { value: "final", label: "Finals" },
] as const;

export const DEFAULT_MATCH_STAGE = "group";
export const DEFAULT_EVENT_STAGE = "misc";
