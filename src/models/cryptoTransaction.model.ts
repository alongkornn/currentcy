import pool from "../config/db";

export interface CryptoTransaction {
  id: number;
  from_user_id: number;
  to_user_id: number;
  currency: string;
  amount: number;
  timestamp: Date;
}

export const createCryptoTransaction = async (tx: Omit<CryptoTransaction, "id" | "timestamp">): Promise<CryptoTransaction> => {
  const result = await pool.query(
    `INSERT INTO crypto_transactions (from_user_id, to_user_id, currency, amount, timestamp)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [tx.from_user_id, tx.to_user_id, tx.currency, tx.amount]
  );
  return result.rows[0];
};
