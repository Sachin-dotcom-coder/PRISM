import express from "express";
import {
  createVolleyballMatch,
  getAllVolleyballMatches,
  getVolleyballMatchById,
  updateVolleyballMatch,
  deleteVolleyballMatch,
  searchVolleyballMatches,
} from "../controllers/volley_controller";

const router = express.Router();

router.post("/", createVolleyballMatch);          // CREATE   - POST   /api/volleyball-matches
router.get("/", getAllVolleyballMatches);         // READ ALL  - GET    /api/volleyball-matches
router.get("/search", searchVolleyballMatches);  // SEARCH    - GET    /api/volleyball-matches/search?category=...&stage=...
router.get("/:id", getVolleyballMatchById);      // READ ONE  - GET    /api/volleyball-matches/:id
router.put("/:id", updateVolleyballMatch);       // UPDATE    - PUT    /api/volleyball-matches/:id
router.delete("/:id", deleteVolleyballMatch);    // DELETE    - DELETE /api/volleyball-matches/:id

export default router;