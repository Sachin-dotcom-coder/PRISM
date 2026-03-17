import { Router } from "express";
import {
  createLTMatch,
  getAllLTMatches,
  getLTMatchById,
  updateLTMatchScore,
  deleteLTMatch
} from "../controllers/LT.controller";

const router = Router();

router.post("/", createLTMatch);
router.get("/", getAllLTMatches);
router.get("/:match_id", getLTMatchById);
router.put("/:match_id", updateLTMatchScore);
router.delete("/:match_id", deleteLTMatch);

export default router;
