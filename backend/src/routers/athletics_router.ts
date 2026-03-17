import { Router } from "express";
import {
  createAthleticsEvent,
  getAllAthleticsEvents,
  getAthleticsEventById,
  updateAthleticsResults,
  deleteAthleticsEvent
} from "../controllers/athletics_controller";

const router = Router();

router.post("/", createAthleticsEvent);
router.get("/", getAllAthleticsEvents);
router.get("/:event_id", getAthleticsEventById);
router.put("/:event_id", updateAthleticsResults);
router.delete("/:event_id", deleteAthleticsEvent);

export default router;
