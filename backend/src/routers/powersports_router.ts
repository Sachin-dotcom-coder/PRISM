import { Router } from "express";
import {
  createPowerSportsEvent,
  getAllPowerSportsEvents,
  getPowerSportsEventById,
  updatePowerSportsEvent,
  deletePowerSportsEvent
} from "../controllers/powersports_controller";

const router = Router();

router.post("/", createPowerSportsEvent);
router.get("/", getAllPowerSportsEvents);
router.get("/:event_id", getPowerSportsEventById);
router.put("/:event_id", updatePowerSportsEvent);
router.delete("/:event_id", deletePowerSportsEvent);

export default router;
