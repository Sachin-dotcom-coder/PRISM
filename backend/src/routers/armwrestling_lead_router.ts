import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/armwrestling_lead_controller";

const router = express.Router();

// All operations below use leaderboard_id, not MongoDB _id
router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/armwrestling-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/armwrestling-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/armwrestling-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/armwrestling-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/armwrestling-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/armwrestling-leaderboard/:leaderboard_id

export default router;
