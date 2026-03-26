import { Request, Response } from "express";
import AthleticsEvent, { IAthleticsEvent, IParticipant } from "../models/athletics_model";

const EVENT_CONFIG = {
  hammer_throw: { event_type: "throw", genders: ["men", "women"] },
  shot_put: { event_type: "throw", genders: ["men", "women"] },
  discus: { event_type: "throw", genders: ["men", "women"] },
  javelin: { event_type: "throw", genders: ["men", "women"] },
  long_jump: { event_type: "jump", genders: ["men", "women"] },
  triple_jump: { event_type: "jump", genders: ["men", "women"] },
  running_5000m: { event_type: "run", genders: ["men"] },
  running_3000m: { event_type: "run", genders: ["women"] }
} as const;

type AthleticsEventName = keyof typeof EVENT_CONFIG;
type AthleticsGender = "men" | "women";
type AthleticsEventType = IAthleticsEvent["event_type"];
type ValidationFailure = { valid: false; message: string };
type ParticipantValidationSuccess = { valid: true; participants: IParticipant[] };
type EventValidationSuccess = {
  valid: true;
  payload: {
    event_id: number;
    event_name: AthleticsEventName;
    event_type: AthleticsEventType;
    event_date?: Date | string;
    venue?: string;
    participants: IParticipant[];
    winner: string | null;
    event_status: string;
    gender: AthleticsGender;
  };
};

const ASCENDING_EVENTS = new Set<AthleticsEventType>(["run"]);

const isValidGender = (value: unknown): value is AthleticsGender =>
  value === "men" || value === "women";

const isValidEventName = (value: unknown): value is AthleticsEventName =>
  typeof value === "string" && value in EVENT_CONFIG;

const sanitizeParticipant = (participant: Partial<IParticipant>) => ({
  participant_name: String(participant.participant_name || "").trim(),
  department: String(participant.department || "").trim(),
  performance: Number(participant.performance),
  rank: participant.rank ?? null
});

const validateParticipants = (participants: unknown): ValidationFailure | ParticipantValidationSuccess => {
  if (!Array.isArray(participants) || participants.length === 0) {
    return { valid: false, message: "At least one participant is required." as const };
  }

  const sanitized = participants.map((participant) =>
    sanitizeParticipant(participant as Partial<IParticipant>)
  );

  for (const participant of sanitized) {
    if (!participant.participant_name || !participant.department) {
      return { valid: false, message: "Participant name and department are required." as const };
    }

    if (!Number.isFinite(participant.performance) || participant.performance < 0) {
      return { valid: false, message: "Performance must be a numeric value greater than or equal to 0." as const };
    }
  }

  return { valid: true, participants: sanitized };
};

const rankParticipants = (
  participants: IParticipant[],
  eventType: AthleticsEventType
) => {
  const sorted = [...participants].sort((a, b) => {
    if (a.performance === b.performance) {
      return a.participant_name.localeCompare(b.participant_name);
    }

    return ASCENDING_EVENTS.has(eventType)
      ? a.performance - b.performance
      : b.performance - a.performance;
  });

  return sorted.map((participant, index, arr) => {
    let rank = index + 1;

    if (index > 0 && participant.performance === arr[index - 1].performance) {
      rank = arr[index - 1].rank ?? rank;
    }

    return { ...participant, rank };
  });
};

const resolveWinner = (
  winner: unknown,
  participants: IParticipant[]
): ValidationFailure | { valid: true; winner: string | null } => {
  if (winner == null || winner === "") {
    return { valid: true, winner: null as string | null };
  }

  const winnerName = String(winner).trim();
  const exists = participants.some(
    (participant) => participant.participant_name === winnerName
  );

  if (!exists) {
    return { valid: false, message: "Winner must match one of the participant names." as const };
  }

  return { valid: true, winner: winnerName };
};

const validateEvent = (
  body: Record<string, unknown>
): ValidationFailure | EventValidationSuccess => {
  const { event_id, event_name, event_type, gender, participants, winner } = body;

  if (event_id === undefined || !event_name || !event_type || !gender) {
    return { valid: false, message: "event_id, event_name, event_type, and gender are required." as const };
  }

  if (!Number.isFinite(Number(event_id))) {
    return { valid: false, message: "event_id must be numeric." as const };
  }

  if (!isValidGender(gender)) {
    return { valid: false, message: "Invalid gender selection." as const };
  }

  if (!isValidEventName(event_name)) {
    return { valid: false, message: "Invalid event_name." as const };
  }

  const config = EVENT_CONFIG[event_name];
  if (config.event_type !== event_type) {
    return { valid: false, message: "event_type does not match the selected event_name." as const };
  }

  const normalizedEventType = config.event_type as AthleticsEventType;
  const normalizedEventStatus =
    body.event_status && ["scheduled", "ongoing", "completed"].includes(String(body.event_status))
      ? String(body.event_status)
      : "scheduled";

  if (!(config.genders as readonly AthleticsGender[]).includes(gender)) {
    return { valid: false, message: "Selected event is not available for this gender." as const };
  }

  const participantValidation = validateParticipants(participants);
  if (!participantValidation.valid) {
    return participantValidation;
  }

  const rankedParticipants = rankParticipants(
    participantValidation.participants,
    normalizedEventType
  );

  const winnerValidation = resolveWinner(winner, rankedParticipants);
  if (!winnerValidation.valid) {
    return winnerValidation;
  }

  return {
    valid: true,
    payload: {
      event_id: Number(event_id),
      event_name,
      event_type: normalizedEventType,
      event_date: body.event_date ? String(body.event_date) : undefined,
      venue: body.venue ? String(body.venue) : undefined,
      participants: rankedParticipants,
      winner: winnerValidation.winner,
      event_status: normalizedEventStatus,
      gender
    }
  };
};

const getGenderFromRequest = (req: Request) => {
  const rawGender = req.query.gender ?? req.body.gender;

  const gender =
    typeof rawGender === "string" ? rawGender : Array.isArray(rawGender) ? rawGender[0] : undefined;

  return isValidGender(gender) ? gender : null;
};

export const createAthleticsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateEvent(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const savedEvent = await AthleticsEvent.create(validation.payload);
    res.status(201).json({ success: true, message: "Athletics event created.", data: savedEvent });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "event_id must be unique." });
      return;
    }

    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllAthleticsEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender query parameter is required." });
      return;
    }

    const events = await AthleticsEvent.find({ gender }).sort({ event_id: 1 });
    res.status(200).json({ success: true, message: "Events fetched.", data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAthleticsEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender query parameter is required." });
      return;
    }

    const { event_id } = req.params;
    const event = await AthleticsEvent.findOne({ event_id: Number(event_id), gender });

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Event fetched.", data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateAthleticsResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender is required in query or body." });
      return;
    }

    const { event_id } = req.params;
    const existingEvent = await AthleticsEvent.findOne({ event_id: Number(event_id), gender });

    if (!existingEvent) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    const mergedPayload = {
      ...existingEvent.toObject(),
      ...req.body,
      event_id: Number(event_id),
      gender
    };

    const validation = validateEvent(mergedPayload);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const updatedEvent = await AthleticsEvent.findOneAndUpdate(
      { event_id: Number(event_id), gender },
      validation.payload,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Event updated.", data: updatedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteAthleticsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender query parameter is required." });
      return;
    }

    const { event_id } = req.params;
    const deletedEvent = await AthleticsEvent.findOneAndDelete({
      event_id: Number(event_id),
      gender
    });

    if (!deletedEvent) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Event deleted.", data: deletedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
