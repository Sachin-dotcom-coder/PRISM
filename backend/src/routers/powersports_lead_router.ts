import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/powersports_lead_controller";

const router = express.Router();

router.post("/", createLeaderboardEntry);
router.get("/", getAllLeaderboardEntries);
router.get("/standings", getLeaderboardStandings);
router.get("/:id", getLeaderboardEntryById);
router.put("/:id", updateLeaderboardEntry);
router.delete("/:id", deleteLeaderboardEntry);

export default router;
