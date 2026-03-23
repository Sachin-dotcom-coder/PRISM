import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/carrom_lead_controller";

const router = express.Router();

// All operations below use leaderboard_id, not MongoDB _id
router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/carrom-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/carrom-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/carrom-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/carrom-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/carrom-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/carrom-leaderboard/:leaderboard_id

export default router;
