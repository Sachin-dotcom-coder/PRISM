import { Router } from "express";
import {
  createHandballMatch,
  getAllHandballMatches,
  getHandballMatchById,
  updateHandballScore,
  deleteHandballMatch
} from "../controllers/handball_controller";

const router = Router();

router.post("/", createHandballMatch);
router.get("/", getAllHandballMatches);
router.get("/:match_id", getHandballMatchById);
router.put("/:match_id", updateHandballScore);
router.delete("/:match_id", deleteHandballMatch);

export default router;
