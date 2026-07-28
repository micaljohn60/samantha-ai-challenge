import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT COALESCE(c.name, 'Uncategorised') AS name, COUNT(*)::int AS count
      FROM documents d
      LEFT JOIN categories c ON c.id = d.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC, name ASC
      LIMIT 5
    `);

    return NextResponse.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
