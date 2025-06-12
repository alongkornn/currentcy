import pool from "../config/db";

export interface FiatBalance {
  id: number;
  user_id: number;
  currency: string;
  balance: number;
}

export const getFiatBalance = async (userId: number, currency: string): Promise<FiatBalance> => {
  try {
    const result = await pool.query(
      `SELECT * FROM fiat_balances WHERE user_id = $1 AND currency = $2`,
      [userId, currency]
    );
    return result.rows[0];
  } catch (error) {
    console.log("Error", error)
    throw error;
  }
};

export const increaseFiatBalance = async (userId: number, currency: string, amount: number) => {
  try {
    const existing = await getFiatBalance(userId, currency);
    if (existing) {
      await pool.query(
        `UPDATE fiat_balances SET balance = balance + $1 WHERE user_id = $2 AND currency = $3`,
        [amount, userId, currency]
      );
    }
    return console.log("FiatBalance could not be found with the user.")
  } catch (error) {
    console.log("Error : ", error);
    throw error;
  }
};

export const reduceFiatBalance = async (userId: number, currency: string, amount: number) => {
  try {
    const existing = await getFiatBalance(userId, currency);
    if (existing) {
      await pool.query(
        `UPDATE fiat_balances SET balance = balance - $1 WHERE user_id = $2 AND currency = $3`,
        [amount, userId, currency]
      );
    }
    return console.log("FiatBalance could not be found with the user.")
  } catch (error) {
    console.log("Error : ", error);
    throw error;
  }
};
