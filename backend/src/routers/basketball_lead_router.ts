import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/basketball_lead_controller";

const router = express.Router();

// All operations below use leaderboard_id, not MongoDB _id
router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/basketball-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/basketball-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/basketball-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/basketball-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/basketball-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/basketball-leaderboard/:leaderboard_id

export default router;
