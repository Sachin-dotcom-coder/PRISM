import { Request, Response } from "express";
import CarromEvent from "../models/carrom_model";

type CarromGender = "men" | "women";

const isValidGender = (value: unknown): value is CarromGender =>
  value === "men" || value === "women";

const getGenderFromRequest = (req: Request) => {
  const gender = req.query.gender ?? req.body.gender;
  return isValidGender(gender) ? gender : null;
};

const validatePayload = (body: Record<string, unknown>) => {
  const { event_id, department_1, department_2, winner, gender } = body;

  if (event_id === undefined || !department_1 || !department_2 || !gender) {
    return {
      valid: false,
      message: "event_id, department_1, department_2, and gender are required." as const
    };
  }

  if (!Number.isFinite(Number(event_id))) {
    return { valid: false, message: "event_id must be numeric." as const };
  }

  if (!isValidGender(gender)) {
    return { valid: false, message: "Invalid gender selection." as const };
  }

  const normalizedDepartment1 = String(department_1).trim();
  const normalizedDepartment2 = String(department_2).trim();

  if (!normalizedDepartment1 || !normalizedDepartment2) {
    return { valid: false, message: "Both departments must be provided." as const };
  }

  if (normalizedDepartment1 === normalizedDepartment2) {
    return { valid: false, message: "department_1 and department_2 must be different." as const };
  }

  const normalizedWinner = winner == null || winner === "" ? null : String(winner).trim();
  if (
    normalizedWinner &&
    normalizedWinner !== normalizedDepartment1 &&
    normalizedWinner !== normalizedDepartment2
  ) {
    return { valid: false, message: "Winner must match department_1 or department_2." as const };
  }

  return {
    valid: true,
    payload: {
      event_id: Number(event_id),
      event_name: "carrom" as const,
      event_date: body.event_date ? String(body.event_date) : undefined,
      department_1: normalizedDepartment1,
      department_2: normalizedDepartment2,
      winner: normalizedWinner,
      event_status:
        body.event_status && ["scheduled", "ongoing", "completed"].includes(String(body.event_status))
          ? String(body.event_status)
          : "scheduled",
      gender
    }
  };
};

export const createCarromEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const savedEvent = await CarromEvent.create(validation.payload!);
    res.status(201).json({ success: true, message: "Carrom event created.", data: savedEvent });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "event_id must be unique for the selected gender." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllCarromEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender query parameter is required." });
      return;
    }

    const events = await CarromEvent.find({ gender }).sort({ event_id: 1 });
    res.status(200).json({ success: true, message: "Events fetched.", data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getCarromEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender query parameter is required." });
      return;
    }

    const { event_id } = req.params;
    const event = await CarromEvent.findOne({ event_id: Number(event_id), gender });
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Event fetched.", data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updateCarromEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender is required in query or body." });
      return;
    }

    const { event_id } = req.params;
    const existingEvent = await CarromEvent.findOne({ event_id: Number(event_id), gender });
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

    const validation = validatePayload(mergedPayload);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    const updatedEvent = await CarromEvent.findOneAndUpdate(
      { event_id: Number(event_id), gender },
      validation.payload!,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Carrom event updated.", data: updatedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteCarromEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const gender = getGenderFromRequest(req);
    if (!gender) {
      res.status(400).json({ success: false, message: "gender query parameter is required." });
      return;
    }

    const { event_id } = req.params;
    const deletedEvent = await CarromEvent.findOneAndDelete({
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
