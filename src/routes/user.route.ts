import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.get("/users", (req: Request, res: Response): void => {
    res.status(200).json({ "message": "user route" });
});

export default router