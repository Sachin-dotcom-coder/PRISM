import express from "express";
import {
  createCarromEvent,
  deleteCarromEvent,
  getAllCarromEvents,
  getCarromEventById,
  updateCarromEvent
} from "../controllers/carrom_controller";

const router = express.Router();

router.post("/", createCarromEvent);
router.get("/", getAllCarromEvents);
router.get("/:event_id", getCarromEventById);
router.put("/:event_id", updateCarromEvent);
router.delete("/:event_id", deleteCarromEvent);

export default router;
