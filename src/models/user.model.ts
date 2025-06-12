import pool from "../config/db"

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date
};

export const createUser = async (user: Omit<User, "id" | "created_at">): Promise<User> => {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [user.name, user.email, user.password]
        );
        return result.rows[0];
    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
};

export const getAllUser = async (): Promise<User[]> => {
    try {
        const result = await pool.query(`SELECT * FROM users`);
        return result.rows
    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
}

export const getUserByEmail = async (email: string): Promise<User> => {
    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0]
    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
}