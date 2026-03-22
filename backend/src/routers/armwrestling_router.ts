import express from "express";
import {
  createArmWrestlingEvent,
  deleteArmWrestlingEvent,
  getAllArmWrestlingEvents,
  getArmWrestlingEventById,
  updateArmWrestlingEvent
} from "../controllers/armwrestling_controller";

const router = express.Router();

router.post("/", createArmWrestlingEvent);
router.get("/", getAllArmWrestlingEvents);
router.get("/:event_id", getArmWrestlingEventById);
router.put("/:event_id", updateArmWrestlingEvent);
router.delete("/:event_id", deleteArmWrestlingEvent);

export default router;
