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

export const createOffer = async (offer: Omit<Offer, "id" | "status" | "created_at" | "updated_at">): Promise<Offer> => {
  const result = await pool.query(
    `INSERT INTO offers (user_id, type, currency, amount, price_per_unit, price_currency, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'open', NOW(), NOW()) RETURNING *`,
    [offer.user_id, offer.type, offer.currency, offer.amount, offer.price_per_unit, offer.price_currency]
  );
  return result.rows[0];
};


