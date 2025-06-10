import pool from "../config/db";


export interface CryptoBalance {
    id: number;
    user_id: number;
    currency: string;
    balance: number;
};

export const getCryptoBalance = async (user_id: number, currency: string): Promise<CryptoBalance | null> => {
    const result = await pool.query(
        `SELECT * FROM users WHERE user_id = $1 AND currency = $2`,
        [user_id, currency]
    );
    return result.rows[0] || null
}

export const updateCryptoBalance = async (user_id: number, currency: string, amount: number) => {
    // validate user_id and currency
    const existing = await getCryptoBalance(user_id, currency);
    if (existing) {
        await pool.query(
            `UPDATE crypto_balances SET balance = balance + $1 WHERE user_id = $2 AND currency = $3`,
            [amount, user_id, currency]
        );
    } else {
        await pool.query(
            `INSERT INTO crypto_balances (user_id, currency, balance) VALUES ($1, $2, $3)`,
            [user_id, currency, amount]
        );
    };
};