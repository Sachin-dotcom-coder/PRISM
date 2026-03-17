import express from "express";
import {
  createMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  searchMatches,
} from "../controllers/matchcontroller";

const router = express.Router();

router.post("/", createMatch);          // CREATE   - POST   /api/matches
router.get("/", getAllMatches);         // READ ALL  - GET    /api/matches
router.get("/search", searchMatches);  // SEARCH    - GET    /api/matches/search?sport_type=...&match_status=...
router.get("/:id", getMatchById);      // READ ONE  - GET    /api/matches/:id
router.put("/:id", updateMatch);       // UPDATE    - PUT    /api/matches/:id
router.delete("/:id", deleteMatch);    // DELETE    - DELETE /api/matches/:id

export default router;
