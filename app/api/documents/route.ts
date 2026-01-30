// API route to fetch all documents with basic
// info, ordered by newest first

import { NextResponse } from "next/server";
import pool from "@/lib/db";
// import { Pool } from "pg";

// const pool =
//   global.pgPool ||
//   new Pool({
//     host: process.env.PG_HOST,
//     port: Number(process.env.PG_PORT || 5432),
//     user: process.env.PG_USER,
//     password: process.env.PG_PASSWORD,
//     database: process.env.PG_DATABASE,
//     ssl: { rejectUnauthorized: false },
//   });

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, file_name,s3_key, created_at
      FROM documents
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ success: true, documents: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
