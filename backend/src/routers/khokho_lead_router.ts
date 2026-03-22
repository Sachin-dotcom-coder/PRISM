import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
  getLeaderboardStandings,
} from "../controllers/khokho_lead_controller";

const router = express.Router();

// All operations below use leaderboard_id, not MongoDB _id
router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/khokho-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/khokho-leaderboard
router.get("/standings", getLeaderboardStandings);  // DYNAMIC  - GET    /api/khokho-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);        // READ ONE - GET    /api/khokho-leaderboard/:leaderboard_id
router.put("/:id", updateLeaderboardEntry);         // UPDATE   - PUT    /api/khokho-leaderboard/:leaderboard_id
router.delete("/:id", deleteLeaderboardEntry);      // DELETE   - DELETE /api/khokho-leaderboard/:leaderboard_id

export default router;
