import pool from "../config/db";


export interface CryptoBalance {
    id: number;
    user_id: number;
    currency: string;
    balance: number;
};

export const getCryptoBalance = async (userId: number, currency: string): Promise<CryptoBalance> => {
    try {
        const result = await pool.query(
            `SELECT * FROM crypto_balances WHERE user_id = $1 AND currency = $2`,
            [userId, currency]
        );
        return result.rows[0]
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const increaseCryptoBalance = async (user_id: number, currency: string, amount: number) => {
    try {
        const existing = await getCryptoBalance(user_id, currency);
        if (existing) {
            await pool.query(
                `UPDATE crypto_balances SET balance = balance + $1 WHERE user_id = $2 AND currency = $3`,
                [amount, user_id, currency]
            );
        }
        return console.log("CryptoBalance could not be found with the user.")
    } catch (error) {
        console.log(error);
        throw error
    }
};

export const reduceCryptoBalance = async (user_id: number, currency: string, amount: number) => {
    try {
        const existing = await getCryptoBalance(user_id, currency);
        if (existing) {
            await pool.query(
                `UPDATE crypto_balances SET balance = balance - $1 WHERE user_id = $2 AND currency = $3`,
                [amount, user_id, currency]
            );
        }
        return console.log("FiatBalance could not be found with the user.")
    } catch (error) {
        console.log(error);
        throw error;
    }
};