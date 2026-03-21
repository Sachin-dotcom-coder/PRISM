import { Router } from "express";
import {
  createKhoKhoMatch,
  getAllKhoKhoMatches,
  getKhoKhoMatchById,
  updateKhoKhoScore,
  deleteKhoKhoMatch
} from "../controllers/khokho_controller";

const router = Router();

router.post("/", createKhoKhoMatch);
router.get("/", getAllKhoKhoMatches);
router.get("/:match_id", getKhoKhoMatchById);
router.put("/:match_id", updateKhoKhoScore);
router.delete("/:match_id", deleteKhoKhoMatch);

export default router;
