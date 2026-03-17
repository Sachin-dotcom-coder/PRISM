import { Request, Response } from "express";
import AthleticsEvent, { IParticipant, IAttempt } from "../models/athletics_model";

const evaluatePerformances = (participants: any[]) => {
  for (const participant of participants) {
    let best = 0;
    
    if (participant.attempts && Array.isArray(participant.attempts)) {
      for (const attempt of participant.attempts) {
        if (typeof attempt.performance !== "number" || attempt.performance < 0) {
          return { valid: false, error: "Attempt performance must be a positive number." };
        }
        if (!attempt.is_foul && attempt.performance > best) {
          best = attempt.performance;
        }
      }
    }
    
    participant.best_performance = best;
  }

  // Sort participants by best_performance descending
  participants.sort((a, b) => b.best_performance - a.best_performance);

  let winner = null;
  let currentRank = 1;

  for (let i = 0; i < participants.length; i++) {
    // If best_performance is 0, they might not have valid attempts, but we can still rank/tie them.
    // Handling ties in ranking
    if (i > 0 && participants[i].best_performance === participants[i - 1].best_performance) {
      participants[i].rank = participants[i - 1].rank;
    } else {
      participants[i].rank = currentRank;
    }
    currentRank++;
    
    if (participants[i].rank === 1 && participants[i].best_performance > 0) {
      // It's possible multiple participants tie for 1st. We can set winner to the first one or a combined string.
      // Usually the first one or logic dictates tie-breakers. Here we just set the first 1st place as winner.
      if (!winner) winner = participants[i].participant_name;
    }
  }

  return { valid: true, processedParticipants: participants, winner };
};

export const createAthleticsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      event_id, event_name, event_type, event_date, venue, participants
    } = req.body;

    if (event_id === undefined || !event_name || !event_type) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    const eventNames = ["hammer_throw", "shot_put", "javelin", "discus", "long_jump", "triple_jump", "double_jump"];
    if (!eventNames.includes(event_name)) {
       res.status(400).json({ success: false, message: "Invalid event_name." });
       return;
    }

    if (!["throw", "jump"].includes(event_type)) {
       res.status(400).json({ success: false, message: "Invalid event_type." });
       return;
    }

    const participantsArr = participants || [];
    const evaluation = evaluatePerformances(participantsArr);
    
    if (!evaluation.valid) {
      res.status(400).json({ success: false, message: evaluation.error });
      return;
    }

    const newEvent = new AthleticsEvent({
      event_id,
      event_name,
      event_type,
      event_date,
      venue,
      participants: evaluation.processedParticipants,
      winner: evaluation.winner,
      event_status: req.body.event_status || "scheduled"
    });

    const savedEvent = await newEvent.save();
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
    const events = await AthleticsEvent.find();
    res.status(200).json({ success: true, message: "Events fetched.", data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const getAthleticsEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id } = req.params;
    const event = await AthleticsEvent.findOne({ event_id: Number(event_id) });
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
    const { event_id } = req.params;
    const { participants, event_status } = req.body;

    const event = await AthleticsEvent.findOne({ event_id: Number(event_id) });
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
      
      const evaluation = evaluatePerformances(participants);
      if (!evaluation.valid) {
         res.status(400).json({ success: false, message: evaluation.error });
         return;
      }

      updateData.participants = evaluation.processedParticipants;
      updateData.winner = evaluation.winner;

      if (event_status) {
         updateData.event_status = event_status;
      } else {
         updateData.event_status = "completed"; // Default to completed when updating results
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

    const updatedEvent = await AthleticsEvent.findOneAndUpdate(
      { event_id: Number(event_id) },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Event results updated.", data: updatedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};

export const deleteAthleticsEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id } = req.params;
    const deletedEvent = await AthleticsEvent.findOneAndDelete({ event_id: Number(event_id) });

    if (!deletedEvent) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Event deleted.", data: deletedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server Error", data: error.message });
  }
};
