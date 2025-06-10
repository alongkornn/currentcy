import pool from "../config/db";

export interface Trade {
  id: number;
  offer_buy_id: number;
  offer_sell_id: number;
  amount: number;
  price: number;
  traded_at: Date;
}

export const createTrade = async (trade: Omit<Trade, "id" | "traded_at">): Promise<Trade> => {
  const result = await pool.query(
    `INSERT INTO trades (offer_buy_id, offer_sell_id, amount, price, traded_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [trade.offer_buy_id, trade.offer_sell_id, trade.amount, trade.price]
  );
  return result.rows[0];
};
