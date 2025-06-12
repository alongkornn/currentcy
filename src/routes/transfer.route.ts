import express from "express";
import { createTransferCrypto, createTransferFiat } from "../controllers/transfer.controller";



const router = express.Router();

router.post("/tranfer/fiat", createTransferFiat);
router.post("/tranfer/crypto", createTransferCrypto);


export default router;