import { NextResponse } from "next/server";
import pool from "@/lib/db";
import redis from "@/lib/redis";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const redisKey = `patients:v3:page:${page}:limit:${limit}`;

    // Try to get cached data
    const cached = await redis.get(redisKey);
    if (cached) {
      console.log("Cache hit ✅");
      return NextResponse.json(JSON.parse(cached));
    }

    // Fetch from DB
    const countRes = await pool.query(`SELECT COUNT(*) FROM patients`);
    const totalItems = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      `
      SELECT 
        p.id AS patient_id,
        p.full_name,
        json_agg(
          json_build_object(
            'document_id', d.id, 
            'gp_name', d.doctor_name,
            's3_key' , d.s3_key,
            'document_subject', d.document_subject,
            'date_of_report', d.date_of_report
          )
        ) AS documents
      FROM patients p
      LEFT JOIN documents d ON d.patient_id = p.id
      GROUP BY p.id, p.full_name
      ORDER BY p.full_name ASC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset],
    );

    const response = {
      success: true,
      data: result.rows,
      pagination: { page, limit, totalPages, totalItems },
    };

    // 3Store in Redis for 60 seconds
    await redis.set(redisKey, JSON.stringify(response), "EX", 600);

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "DB error" },
      { status: 500 },
    );
  }
}
