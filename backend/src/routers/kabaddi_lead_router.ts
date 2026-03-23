import express from "express";
import {
  getLeaderboard,
  addTeam,
  updateTeam,
  deleteTeam
} from "../controllers/kabaddi_lead_controller";

const router = express.Router();

router.get("/", getLeaderboard);
router.post("/", addTeam);
router.put("/", updateTeam);
router.delete("/", deleteTeam);

export default router;
