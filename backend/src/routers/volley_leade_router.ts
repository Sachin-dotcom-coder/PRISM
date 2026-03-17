import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardStandings,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
} from "../controllers/volley_lead_controller";

const router = express.Router();
+
router.post("/", createLeaderboardEntry);             // CREATE   - POST   /api/volleyball-leaderboard
router.get("/", getAllLeaderboardEntries);            // READ ALL - GET    /api/volleyball-leaderboard
router.get("/standings", getLeaderboardStandings);   // STANDINGS- GET    /api/volleyball-leaderboard/standings?category=boys
router.get("/:id", getLeaderboardEntryById);         // READ ONE - GET    /api/volleyball-leaderboard/:id
router.put("/:id", updateLeaderboardEntry);          // UPDATE   - PUT    /api/volleyball-leaderboard/:id
router.delete("/:id", deleteLeaderboardEntry);       // DELETE   - DELETE /api/volleyball-leaderboard/:id

export default router;
