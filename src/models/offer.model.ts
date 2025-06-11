import pool from "../config/db";

export interface Offer {
  id: number;
  user_id: number;
  type: "buy" | "sell";
  currency: string;
  amount: number;
  price_per_unit: number;
  price_currency: "THB" | "USD";
  status: string;
  created_at: Date;
  updated_at: Date;
}

// สร้าง offer ที่ไม่ตรงตามเงื่อนไข
export const createOfferNoMatch = async (offer: Omit<Offer, "id" | "status" | "created_at" | "updated_at">): Promise<Offer> => {
  const result = await pool.query(
    `INSERT INTO offers (user_id, type, currency, amount, price_per_unit, price_currency, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'open', NOW(), NOW()) RETURNING *`,
    [offer.user_id, offer.type, offer.currency, offer.amount, offer.price_per_unit, offer.price_currency]
  );
  return result.rows[0];
};

// สร้าง offer ที่ตรงตามเงื่อนไข
export const createOfferIsMatch = async (offer: Omit<Offer, "id" | "status" | "created_at" | "updated_at">): Promise<Offer> => {
  const result = await pool.query(
    `INSERT INTO offers (user_id, type, currency, amount, price_per_unit, price_currency, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'completed', NOW(), NOW()) RETURNING *`,
    [offer.user_id, offer.type, offer.currency, offer.amount, offer.price_per_unit, offer.price_currency]
  );
  return result.rows[0];
};

// อัปเดตสถานะในรายการ offer
export const updateOffer = async (offerID: number, offerStatus: string) => {
  try {
    await pool.query(
      `UPDATE offers SET status = $1, updated_at = NOW(), WHERE id = $2 `,
      [offerStatus, , offerID]
    );
  } catch (error) {
    console.log(error)
  }
}

// ดึงข้อมูลของผู้ซื้อที่ตรงตามเงื่อนไข
export const getOfferByBuyers = async (price_per_unit: number, amount: number, currency: string, price_currency:number): Promise<Offer[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM offers 
       WHERE type = 'buy' 
         AND price_per_unit >= $1
         AND amount <= $2
         AND currency = $3
         AND price_currency = $4
       ORDER BY price_per_unit DESC`,
      [price_per_unit, amount, currency, price_currency]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching buyer offers:", error);
    throw error;
  }
};

// ดึงข้อมูลผู้ขายที่ตรงตามเงื่อนไข
export const getOfferBySellers = async (price_per_unit: number, amount: number, currency: string, price_currency: number): Promise<Offer[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM offers 
       WHERE type = 'buy' 
         AND price_per_unit <= $1
         AND amount >= $2
         AND currency = $3
         AND price_currency = $4
       ORDER BY price_per_unit ASC`,
      [price_per_unit, amount, currency, price_currency]
    );
    return result.rows
  } catch (error) {
    console.log(error)
    throw error;
  }
}
