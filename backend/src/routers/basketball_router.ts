import { Router } from "express";
import {
  createBasketballMatch,
  getAllBasketballMatches,
  getBasketballMatchById,
  updateBasketballMatch,
  deleteBasketballMatch
} from "../controllers/basketball_controller";

const router = Router();

router.post("/", createBasketballMatch);
router.get("/", getAllBasketballMatches);
router.get("/:match_id", getBasketballMatchById);
router.put("/:match_id", updateBasketballMatch);
router.delete("/:match_id", deleteBasketballMatch);

export default router;
