import { Request, Response } from "express";
// offer
import {
    getOfferByBuyers,
    createOfferNoMatch,
    Offer,
    createOfferIsMatch,
    updateOffer,
    getOfferBySellers,
    updateOfferAmount
} from "../models/offer.model";

// cryptoBalance
import {
    getCryptoBalance,
    CryptoBalance,
    increaseCryptoBalance,
    reduceCryptoBalance
} from "../models/cryptoBalance.model";

// fiatBalance
import {
    increaseFiatBalance,
    reduceFiatBalance,
    getFiatBalance,
    FiatBalance
} from "../models/fiatBalance.model";

// cryptoTransaction
import { createCryptoTransaction, CryptoTransaction } from "../models/cryptoTransaction.model";

// fiatTransaction
import { createFiatTransaction, FiatTransaction } from "../models/fiatTransaction.model";

// trade
import { Trade, createTrade } from "../models/trade.model";

export const createOffer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, type, currency, amount, price_per_unit, price_currency } = req.body;
    
        if (!user_id || !type || !currency || !amount || !price_per_unit || !price_currency) {
            res.status(400).json({ "message": "All information must be filled in." })
            return
        }
    
        const offerData = {
            user_id,
            type,
            currency,
            amount,
            price_per_unit,
            price_currency
        }
    
        if (type === "sell") {
            // ตรวจสอบว่ามีรายการเสนอซื้อตรงตามเงื่อนไขไหม
            const buyers = await getOfferByBuyers(price_per_unit, amount, currency, price_currency);

            // ตรวจสอบจำนวนเหรียญว่าเพียงพอต่อการขายไหม ของผู้ขาย
            const sellerCryptoBalances = await getCryptoBalance(user_id, currency)
            if (sellerCryptoBalances.balance < amount) {
                res.status(400).json({ "message": "Amount is too much" })
                return
            }
            
            // ถ้าไม่มีให้สร้าง offer ไว้ในสถานะ open เพื่อรอรายการเสนอซื้อที่ตรงกัน
            if (buyers.length === 0) {
                const offer = await createOfferNoMatch(offerData);
                res.status(201).json({ "message": "Create offer sucessfully", "data": offer })
                return
            }

            const buyer: Offer = buyers[0];
            // ราคาที่ผู้ซื้อต้องจ่าย
            const buy_price = buyer.amount * buyer.price_per_unit

            // ดึงข้อมูลจำนวนเงินของผู้ซื้อ
            const buyerFiatBalance: FiatBalance = await getFiatBalance(buyer.user_id, buyer.price_currency);
            if (buy_price >= buyerFiatBalance.balance) {
                res.status(400).json({ "message": "Price per unit is too much" })
                return
            }
    
            // ถ้ามีรายการเสนอซื้อจะขายให้กับคนแรกที่ได้เสนอขาย
            // อัปเดตจำนวนเหรียญ
            const buyerCryptoBalance: CryptoBalance = await getCryptoBalance(buyer.user_id, buyer.currency);
            await increaseCryptoBalance(buyerCryptoBalance.user_id, buyerCryptoBalance.currency, buyer.amount)
            await reduceCryptoBalance(user_id, currency, buyer.amount);

            // อัปเดตจำนวนเงิน
            await reduceFiatBalance(buyerFiatBalance.user_id, buyerFiatBalance.currency, buy_price);
            await increaseFiatBalance(user_id, currency, buy_price);

            // สร้างประวัติการโอนเหรียญ
            const cryptoTransactionData = {
                from_user_id: user_id,
                to_user_id: buyer.user_id,
                currency,
                amount: buyer.amount
            }
            const cryptoTransaction: CryptoTransaction = await createCryptoTransaction(cryptoTransactionData);
            if (!cryptoTransaction) {
                res.status(500).json({ "message": "Can not add transaction" })
                return
            }

            // สร้างประวัติการโอนเงิน
            const fiatTransactionData: Omit<FiatTransaction, "id" | "timestamp"> = {
                from_user_id: buyer.user_id,
                to_user_id: user_id,
                currency: price_currency,
                amount: buy_price,
                type: "transfer"
            }

            const fiatTransaction: FiatTransaction = await createFiatTransaction(fiatTransactionData);
            if (!fiatTransaction) {
                res.status(500).json({ "message": "Can not add transaction" })
                return
            }

            const offerSeller = await createOfferIsMatch(offerData);
            await updateOffer(buyer.id, "completed");



            //สร้างรายการ Trades
            const tradeData: Omit<Trade, "id" | "traded_at"> = {
                offer_buy_id: buyer.id,
                offer_sell_id: offerSeller.id,
                currency,
                amount: buyer.amount,
                price: buy_price
            }
            const trade: Trade = await createTrade(tradeData);
    
            res.status(201).json({ "message": "Create offer sucessfully", "data": offerSeller });
            return
        }

        if (type === "buy") {
            // ตรวจสอบว่ามีรายการผู้ขายตรงตามเงื่อนไขไหม
            const sellers = await getOfferBySellers(price_per_unit, amount, currency, price_currency);
            const seller: Offer = sellers[0];

            const buy_price = price_per_unit * amount

            // ตรวจสอบว่าผู้ซื่้อมีเงินพอที่จะเสนอซื้อไหม
            const buyerFiatBalance: FiatBalance = await getFiatBalance(user_id, price_currency);
        
                if (buy_price >= buyerFiatBalance.balance) {
                    res.status(400).json({ "message": "Price per unit is too much" })
                    return
                }

            if (sellers.length === 0) {
                const offer = await createOfferNoMatch(offerData);
                res.status(201).json({ "message": "Create offer sucessfully", "data": offer})
                return
            }
            
            // อัปเดตจำนวนเหรียญ
            const sellerCryptoBalance: CryptoBalance = await getCryptoBalance(seller.user_id, seller.currency);
            await reduceCryptoBalance(sellerCryptoBalance.user_id, sellerCryptoBalance.currency, amount)
            await increaseCryptoBalance(user_id, currency, amount);

            // อัปเดตจำนวนเงิน
            const sellerFiatBalance: FiatBalance = await getFiatBalance(seller.user_id, seller.price_currency);
            await reduceFiatBalance(buyerFiatBalance.user_id, buyerFiatBalance.currency, buy_price);
            await increaseFiatBalance(sellerFiatBalance.user_id, sellerFiatBalance.currency, buy_price);

            // สร้างประวัติการโอนเหรียญ
            const cryptoTransactionData: Omit<CryptoTransaction, "id" | "timestamp"> = {
                from_user_id: seller.user_id,
                to_user_id: user_id,
                currency,
                amount
            }
            const cryptoTransaction: CryptoTransaction = await createCryptoTransaction(cryptoTransactionData);
            if (!cryptoTransaction) {
                res.status(500).json({ "message": "Can not add transaction" })
                return
            }

            // สร้างประวัติการโอนเงิน
            const fiatTransactionData: Omit<FiatTransaction, "id" | "timestamp"> = {
                from_user_id: user_id,
                to_user_id: seller.user_id,
                currency: price_currency,
                amount: buy_price,
                type: "transfer"
            }

            const fiatTransaction: FiatTransaction = await createFiatTransaction(fiatTransactionData);
            if (!fiatTransaction) {
                res.status(500).json({ "message": "Can not add transaction" })
                return
            }

            // อัปเดตสถานะของผู้ขาย
            const lastAmount: number = seller.amount - amount
            // ตรวจสอบว่าเหรียญที่เสนอขายหมดหรือยังถ้าหมดแล้วถึงจะเปลี่ยนสถานะเป็น completed
            if (lastAmount === 0) {
                await updateOffer(seller.id, "completed");
            }

            await updateOfferAmount(seller.id, lastAmount);

            // สร้างรายการ offer
            const offerBuyer = await createOfferIsMatch(offerData);

            //สร้างรายการ Trades
            const tradeData: Omit<Trade, "id" | "traded_at"> = {
                offer_buy_id: offerBuyer.id,
                offer_sell_id: seller.id,
                currency,
                amount,
                price: buy_price
            } 

            const trade: Trade = await createTrade(tradeData);

            res.status(201).json({ "message": "Create offer sucessfully", "data": offerBuyer })
            return
        }
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}