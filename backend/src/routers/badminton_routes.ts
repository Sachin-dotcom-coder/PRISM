import { Router } from "express";
import {
  createBadmintonMatch,
  getAllBadmintonMatches,
  getBadmintonMatchById,
  updateBadmintonMatch,
  deleteBadmintonMatch,
} from "../controllers/badminton_controller";

const router = Router();

// Create a new match
router.post("/", createBadmintonMatch);

// Get all matches
router.get("/", getAllBadmintonMatches);

// Get match by match_id
router.get("/:match_id", getBadmintonMatchById);

// ✅ Update match (this will handle scores + games)
router.put("/:match_id", updateBadmintonMatch);

// Delete match
router.delete("/:match_id", deleteBadmintonMatch);

export default router;