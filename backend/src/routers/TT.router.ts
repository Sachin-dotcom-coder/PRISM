import { Router } from "express";
import {
  createTTMatch,
  getAllTTMatches,
  getTTMatchById,
  updateTTMatchScore,
  deleteTTMatch
} from "../controllers/TT.controller";

const router = Router();

router.post("/", createTTMatch);
router.get("/", getAllTTMatches);
router.get("/:match_id", getTTMatchById);
router.put("/:match_id", updateTTMatchScore);
router.delete("/:match_id", deleteTTMatch);

export default router;
