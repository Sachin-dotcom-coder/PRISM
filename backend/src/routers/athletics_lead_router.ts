import express from "express";
import {
  createLeaderboardEntry,
  getAllLeaderboardEntries,
  getLeaderboardStandings,
  getLeaderboardEntryById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
} from "../controllers/athletics_lead_controller";

const router = express.Router();

router.post("/", createLeaderboardEntry);           // CREATE   - POST   /api/athletics-leaderboard
router.get("/", getAllLeaderboardEntries);          // READ ALL - GET    /api/athletics-leaderboard
router.get("/standings", getLeaderboardStandings); // STANDINGS- GET    /api/athletics-leaderboard/standings
router.get("/:id", getLeaderboardEntryById);       // READ ONE - GET    /api/athletics-leaderboard/:id
router.put("/:id", updateLeaderboardEntry);        // UPDATE   - PUT    /api/athletics-leaderboard/:id
router.delete("/:id", deleteLeaderboardEntry);     // DELETE   - DELETE /api/athletics-leaderboard/:id

export default router;