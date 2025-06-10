import express from "express";
import pool from "./config/db";



const app = express();
const port: number = Number(process.env.SERVER_PORT) || 3000;

async function startServer() {
  try {
    // ทดสอบการเชื่อมต่อฐานข้อมูล
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // ออกจากโปรแกรมถ้าเชื่อมต่อไม่ได้
  }
}

startServer();

export default app