import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardStandings,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
} from "../controllers/tennis_lead_controller";

const router = express.Router();

router.post("/", createLeaderboardEntry);                    // CREATE   - POST   /api/tennis-leaderboard
router.get("/", getAllLeaderboardEntries);                  // READ ALL  - GET    /api/tennis-leaderboard
router.get("/standings", getLeaderboardStandings);          // STANDINGS - GET    /api/tennis-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);                // READ ONE  - GET    /api/tennis-leaderboard/:id
router.put("/:id", updateLeaderboardEntry);                 // UPDATE    - PUT    /api/tennis-leaderboard/:id
router.delete("/:id", deleteLeaderboardEntry);              // DELETE    - DELETE /api/tennis-leaderboard/:id

export default router;