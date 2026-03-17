import express from "express";
import {
  createTennisMatch,
  getAllTennisMatches,
  getTennisMatchById,
  updateTennisMatch,
  deleteTennisMatch,
  searchTennisMatches,
} from "../controllers/tennis_controller";

const router = express.Router();

router.post("/", createTennisMatch);          // CREATE   - POST   /api/tennis
router.get("/", getAllTennisMatches);         // READ ALL  - GET    /api/tennis
router.get("/search", searchTennisMatches);  // SEARCH    - GET    /api/tennis/search?category=...&stage=...
router.get("/:id", getTennisMatchById);      // READ ONE  - GET    /api/tennis/:id
router.put("/:id", updateTennisMatch);       // UPDATE    - PUT    /api/tennis/:id
router.delete("/:id", deleteTennisMatch);    // DELETE    - DELETE /api/tennis/:id

export default router;