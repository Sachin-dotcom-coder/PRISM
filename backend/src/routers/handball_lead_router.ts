import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/handball_lead_controller";

const router = express.Router();

// All operations below use leaderboard_id, not MongoDB _id
router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/handball-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/handball-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/handball-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/handball-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/handball-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/handball-leaderboard/:leaderboard_id

export default router;
