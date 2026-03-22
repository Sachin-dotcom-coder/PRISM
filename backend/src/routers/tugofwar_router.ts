import express from "express";
import {
  createTugOfWarEvent,
  deleteTugOfWarEvent,
  getAllTugOfWarEvents,
  getTugOfWarEventById,
  updateTugOfWarEvent
} from "../controllers/tugofwar_controller";

const router = express.Router();

router.post("/", createTugOfWarEvent);
router.get("/", getAllTugOfWarEvents);
router.get("/:event_id", getTugOfWarEventById);
router.put("/:event_id", updateTugOfWarEvent);
router.delete("/:event_id", deleteTugOfWarEvent);

export default router;
