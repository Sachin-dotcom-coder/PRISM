import { Request, Response } from "express";
import PowersportsEvent, { IParticipant, IAttempt } from "../models/powersports_model";

// Calculate best lift manually checking attempts
const calculateBest = (attempts: IAttempt[]) => {
  let highest = 0;
  if (Array.isArray(attempts)) {
    for (const att of attempts) {
      if (att.is_valid && typeof att.weight === "number" && att.weight > highest) {
        highest = att.weight;
      }
    }
  }
  return highest;
};

// Main processing logic
const processParticipants = (participants: any[]) => {
  let usesPoints = false;

  for (const part of participants) {
    if (!["below_63", "63_83", "above_83"].includes(part.weight_category)) {
      return { valid: false, error: "Invalid weight_category" };
    }

    // Determine Best Lifts
    part.best_squat = calculateBest(part.squat_attempts || []);
    part.best_bench = calculateBest(part.bench_attempts || []);
    part.best_deadlift = calculateBest(part.deadlift_attempts || []);

    // Total Weight Calculation
    part.total_weight = part.best_squat + part.best_bench + part.best_deadlift;
    
    // Check if points scoring system is used
    if (typeof part.points === "number") {
      usesPoints = true;
    }
  }

  // Rank sorting
  participants.sort((a, b) => {
    if (usesPoints) {
      // Sort by points descending
      return (b.points || 0) - (a.points || 0);
    } else {
      // Sort by total_weight descending
      return b.total_weight - a.total_weight;
    }
  });

  let winner = null;
  let currentRank = 1;

  for (let i = 0; i < participants.length; i++) {
    const p1 = participants[i];
    
    // Tie logic
    if (i > 0) {
      const p2 = participants[i - 1];
      const isTied = usesPoints ? (p1.points === p2.points) : (p1.total_weight === p2.total_weight);
      if (isTied) {
        p1.rank = p2.rank;
      } else {
        p1.rank = currentRank;
      }
    } else {
      p1.rank = currentRank;
    }
    
    currentRank++;

    if (p1.rank === 1 && (p1.total_weight > 0 || (usesPoints && p1.points > 0))) {
      // Pick the first rank 1
      if (!winner) winner = p1.participant_name;
    }
  }

  return { valid: true, processedParticipants: participants, winner };
};

export const createPowerSportsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      event_id, event_name, event_date, venue, participants, event_status
    } = req.body;

    if (event_id === undefined) {
      res.status(400).json({ success: false, message: "Missing required field: event_id." });
      return;
    }

    const participantsArr = participants || [];
    
    if (participantsArr.length > 0) {
        const evaluation = processParticipants(participantsArr);
        if (!evaluation.valid) {
            res.status(400).json({ success: false, message: evaluation.error });
            return;
        }
    }

    const newEvent = new PowersportsEvent({
      event_id,
      event_name: event_name || "powerlifting",
      event_date,
      venue,
      participants: participantsArr,
      event_status: event_status || "scheduled"
    });

    const savedEvent = await newEvent.save();
    res.status(201).json({ success: true, message: "PowerSports Event created.", data: savedEvent });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "event_id must be unique." });
      return;
    }
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAllPowerSportsEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await PowersportsEvent.find();
    res.status(200).json({ success: true, message: "Events fetched.", data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getPowerSportsEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id } = req.params;
    const event = await PowersportsEvent.findOne({ event_id: Number(event_id) });
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Event fetched.", data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const updatePowerSportsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id } = req.params;
    const { participants, event_status } = req.body;

    const event = await PowersportsEvent.findOne({ event_id: Number(event_id) });
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    const updateData: any = {};
    
    if (participants !== undefined) {
      if (!Array.isArray(participants)) {
         res.status(400).json({ success: false, message: "participants must be an array." });
         return;
      }
      
      const evaluation = processParticipants(participants);
      if (!evaluation.valid) {
         res.status(400).json({ success: false, message: evaluation.error });
         return;
      }

      updateData.participants = evaluation.processedParticipants;
      updateData.winner = evaluation.winner;

      if (event_status) {
         updateData.event_status = event_status;
      } else {
         updateData.event_status = "completed"; // Default to completed
      }
    } else if (event_status) {
       if (!["scheduled", "ongoing", "completed"].includes(event_status)) {
        res.status(400).json({ success: false, message: "Invalid event_status." });
        return;
      }
      updateData.event_status = event_status;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "Provide participants or event_status to update." });
      return;
    }

    const updatedEvent = await PowersportsEvent.findOneAndUpdate(
      { event_id: Number(event_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Event results updated.", data: updatedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deletePowerSportsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id } = req.params;
    const deletedEvent = await PowersportsEvent.findOneAndDelete({ event_id: Number(event_id) });

    if (!deletedEvent) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Event deleted.", data: deletedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
