import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [monthlyResult, doctorsResult] = await Promise.all([
      pool.query(`
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) AS month
        )
        SELECT
          TO_CHAR(m.month, 'Mon') AS label,
          TO_CHAR(m.month, 'YYYY-MM') AS month,
          COUNT(d.id)::int AS count
        FROM months m
        LEFT JOIN documents d
          ON d.created_at >= m.month
         AND d.created_at < m.month + INTERVAL '1 month'
        GROUP BY m.month
        ORDER BY m.month
      `),
      pool.query(`
        SELECT doctor_name AS name, COUNT(*)::int AS count
        FROM documents
        WHERE doctor_name IS NOT NULL AND doctor_name <> ''
        GROUP BY doctor_name
        ORDER BY count DESC, doctor_name ASC
        LIMIT 5
      `),
    ]);

    return NextResponse.json({
      success: true,
      monthly: monthlyResult.rows,
      doctors: doctorsResult.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
