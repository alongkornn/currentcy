import pool from "../config/db";

export interface FiatTransaction {
  id: number;
  from_user_id: number;
  to_user_id: number;
  currency: string;
  amount: number;
  type: "deposit" | "withdraw" | "transfer";
  timestamp: Date;
}

export const createFiatTransaction = async (tx: Omit<FiatTransaction, "id" | "timestamp">): Promise<FiatTransaction> => {
  const result = await pool.query(
    `INSERT INTO fiat_transactions (from_user_id, to_user_id, currency, amount, type, timestamp)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [tx.from_user_id, tx.to_user_id, tx.currency, tx.amount, tx.type]
  );
  return result.rows[0];
};
