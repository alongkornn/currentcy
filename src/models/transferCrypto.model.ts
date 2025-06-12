import pool from "../config/db";


export interface TransferCrypto {
    id: number;
    from_user_id: number;
    to_user_id: number;
    balance: number;
    amount: number
};