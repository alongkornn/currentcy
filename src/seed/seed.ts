import pool from "../config/db";

const seedData = async () => {
  try {
    console.log("Seeding data...");

    

    // Seed fiat balance
    await pool.query(
      `INSERT INTO fiat_balances (user_id, currency, balance)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, currency) DO NOTHING;`,
      [2, 'THB', 1000000]
    );
    await pool.query(
      `INSERT INTO fiat_balances (user_id, currency, balance)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, currency) DO NOTHING;`,
      [3, 'THB', 1000000]
    );

    // Seed crypto balance
    await pool.query(
      `INSERT INTO crypto_balances (user_id, currency, balance)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, currency) DO NOTHING;`,
      [2, 'BTC', 2]
    );
    await pool.query(
      `INSERT INTO crypto_balances (user_id, currency, balance)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, currency) DO NOTHING;`,
      [3, 'BTC', 10]
    );

    console.log("Seed complete!");
  } catch (error) {
    console.error("Error while seeding data:", error);
  } finally {
    await pool.end();
  }
};

seedData();
