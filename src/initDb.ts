import pool from "./config/db";

const createTables = async () => {
  try {
    // สร้างตาราง users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // สร้างตาราง offers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(10) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        amount NUMERIC NOT NULL,
        price_per_unit NUMERIC NOT NULL,
        price_currency VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // สร้างตาราง trades
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        offer_buy_id INTEGER NOT NULL,
        offer_sell_id INTEGER NOT NULL,
        amount NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        traded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (offer_buy_id) REFERENCES offers(id) ON DELETE CASCADE,
        FOREIGN KEY (offer_sell_id) REFERENCES offers(id) ON DELETE CASCADE
      );
    `);

    // สร้างตาราง crypto_balances
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crypto_balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        balance NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, currency),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // สร้างตาราง fiat_balances
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fiat_balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        balance NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, currency),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // สร้างตาราง crypto_transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crypto_transactions (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        amount NUMERIC NOT NULL,
        tx_hash VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // สร้างตาราง fiat_transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fiat_transactions (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        amount NUMERIC NOT NULL,
        type VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    console.log("All tables created or verified successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
  }
};

createTables();
