import express from "express";

// controllers
import { register, getUser } from "../controllers/user.controller";

const router = express.Router();

router.post("/register", register);
router.get("/users", getUser);

export default router