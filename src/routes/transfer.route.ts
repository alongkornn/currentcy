import express from "express";
import { createTransferCrypto, createTransferFiat } from "../controllers/transfer.controller";



const router = express.Router();

router.post("/transfer/fiat", createTransferFiat);
router.post("/transfer/crypto", createTransferCrypto);


export default router;