import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id,name
       FROM categories 
       ORDER BY name ASC`,
    );

    return NextResponse.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error("Failed to fetch category:", err);
    return NextResponse.json(
      { success: false, error: "DB error" },
      { status: 500 },
    );
  }
}
