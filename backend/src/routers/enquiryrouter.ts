import express from "express";
import { createEnquiry, getEnquiries } from "../controllers/enquirycontroller";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", getEnquiries);

export default router;