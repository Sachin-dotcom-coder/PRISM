import express from "express";
import {
  createKabaddiMatch,
  getAllKabaddiMatches,
  getKabaddiMatchById,
  updateKabaddiMatch,
  deleteKabaddiMatch
} from "../controllers/kabaddi_controller";

const router = express.Router();

router.post("/", createKabaddiMatch);
router.get("/", getAllKabaddiMatches);
router.get("/:id", getKabaddiMatchById);
router.put("/:id", updateKabaddiMatch);
router.delete("/", deleteKabaddiMatch);
router.delete("/:id", deleteKabaddiMatch);

export default router;
