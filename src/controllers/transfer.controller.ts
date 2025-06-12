import { Request, Response } from "express";

import { createCryptoTransaction, CryptoTransaction } from "../models/cryptoTransaction.model";
import { getCryptoBalance, CryptoBalance, createFirstCryptoBalance, increaseCryptoBalance, reduceCryptoBalance } from "../models/cryptoBalance.model";

import { createFiatTransaction, FiatTransaction } from "../models/fiatTransaction.model";
import { FiatBalance, getFiatBalance, createFirstFiatBalance, increaseFiatBalance, reduceFiatBalance } from "../models/fiatBalance.model";

export const createTransferCrypto = async (req: Request, res: Response) => {
    try {
        const { from_user_id, to_user_id, currency, amount } = req.body
    
        if (!from_user_id || !to_user_id || !currency || !amount) {
            res.status(400).json({ "message": "All information must be filled in." })
            return
        }
    
        const cryptoTransaction: Omit<CryptoTransaction, "id" | "timestamp"> = {
            from_user_id,
            to_user_id,
            currency,
            amount
        }
    
        // ตรวจสอบเหรียญของผู้ส่ง
        const senderCryptoBalance: CryptoBalance = await getCryptoBalance(from_user_id, currency);
        // ตรวจสอบว่ามีเหรียญที่ต้องการส่งไหม
        if (!senderCryptoBalance) {
            res.status(404).json({ "message": `You don't have ${currency} coins.` })
            return
        } else if (senderCryptoBalance.balance < amount) {
            // ตรวจสอบว่ามีเหรียญพอที่จะส่งไหม
            res.status(400).json({ "message": `You don't have enough ${currency} coins.` })
            return
        }
    
        // ตรวจสอบเหรียญฝั่งผู้รับว่ามีเหรียญนี้หรือไม่ถ้าไม่มีให้สร้างใหม่ถ้ามีอยู่แล้วก็ให้เพิ่มจากอันเดิม
        const receiverCryptoBalance: CryptoBalance = await getCryptoBalance(to_user_id, currency);
        if (!receiverCryptoBalance) {
            const result = await createFirstCryptoBalance(to_user_id, currency, amount);
            if (!result) {
                res.status(500).json({ "message": "Can't create a new coin." })
                return
            }
        }

        await increaseCryptoBalance(to_user_id, currency, amount);
        await reduceCryptoBalance(from_user_id, currency, amount);

        const transaction = await createCryptoTransaction(cryptoTransaction);

        res.status(200).json({ "message": "Successful transaction.", "data": transaction})
        return
    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
}


export const createTransferFiat = async (req: Request, res: Response) => {
    try {
        const { from_user_id, to_user_id, currency, amount, type } = req.body
    
        if (!from_user_id || !to_user_id || !currency || !amount || !type) {
            res.status(400).json({ "message": "All information must be filled in." })
            return
        }

        const fiatTransaction: Omit<FiatTransaction, "id" | "timestamp"> = {
            from_user_id,
            to_user_id,
            currency,
            amount,
            type
        }

        // ตรวจสอบเงินของผู้ส่ง
        const senderFiatBalance: FiatBalance = await getFiatBalance(from_user_id, currency);
        // ตรวจสอบว่ามีสกุลเงินที่ต้องการส่งไหม
        if (!senderFiatBalance) {
            res.status(404).json({ "message": `You don't have the ${currency} currency` })
            return
        } else if (senderFiatBalance.balance < amount) {
            // ตรวจสอบว่ามีเงินพอที่จะส่งไหม
            res.status(400).json({ "message": `You don't have enough ${currency} currency.` })
            return
        }

        // ตรวจสอบเงินฝั่งผู้รับว่ามีสกุลเงินนี้หรือไม่ถ้าไม่มีให้สร้างใหม่ถ้ามีอยู่แล้วก็ให้เพิ่มจากอันเดิม
        const receiverFiatBalance: FiatBalance = await getFiatBalance(to_user_id, currency);
        if (!receiverFiatBalance) {
            const result = await createFirstFiatBalance(to_user_id, currency, amount);
            if (!result) {
                res.status(500).json({ "message": "Can't create a new coin." })
                return
            }
        }

        await increaseFiatBalance(to_user_id, currency, amount);
        await reduceFiatBalance(from_user_id, currency, amount);
        const transaction = await createFiatTransaction(fiatTransaction);
        res.status(200).json({ "message": "Successful transaction.", "data": transaction})
        return
    } catch (error) {
        console.log("Error", error);
        throw error;
    }
}