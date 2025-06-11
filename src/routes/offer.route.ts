import express from "express";
import { createOffer } from "../controllers/offer.controller";
const router = express.Router();

router.post("/offer", createOffer);

export default router;