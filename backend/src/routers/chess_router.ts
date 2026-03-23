import express from "express";
import {
  createChessEvent,
  deleteChessEvent,
  getAllChessEvents,
  getChessEventById,
  updateChessEvent
} from "../controllers/chess_controller";

const router = express.Router();

router.post("/", createChessEvent);
router.get("/", getAllChessEvents);
router.get("/:event_id", getChessEventById);
router.put("/:event_id", updateChessEvent);
router.delete("/:event_id", deleteChessEvent);

export default router;
