import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/chess_lead_controller";

const router = express.Router();

// All operations below use leaderboard_id, not MongoDB _id
router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/chess-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/chess-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/chess-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/chess-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/chess-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/chess-leaderboard/:leaderboard_id

export default router;
