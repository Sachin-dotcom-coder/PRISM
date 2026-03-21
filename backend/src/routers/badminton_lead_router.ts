import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/badminton_lead_controller";

const router = express.Router();

router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/badminton-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/badminton-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/badminton-leaderboard/standings
// All operations below use leaderboard_id, not MongoDB _id
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/badminton-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/badminton-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/badminton-leaderboard/:leaderboard_id

export default router;
