// API route to fetch all distinct doctor names
// from the documents table, sorted alphabetically

import { NextResponse } from "next/server";
import pool from "@/lib/db";
// import { Pool } from "pg";

// const pool = new Pool({
//   host: process.env.PG_HOST,
//   port: Number(process.env.PG_PORT || 5432),
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DATABASE,
//   ssl: { rejectUnauthorized: false },
// });

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT DISTINCT(doctor_name)
       FROM documents 
       ORDER BY doctor_name ASC`,
    );

    return NextResponse.json({ success: true, doctors: result.rows });
  } catch (err) {
    console.error("Failed to fetch doctors:", err);
    return NextResponse.json(
      { success: false, error: "DB error" },
      { status: 500 },
    );
  }
}
