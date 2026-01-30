// app/api/patients-documents/route.ts

// API route to fetch all patients along with their associated documents,
// returning each patient with a JSON array of their documents

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
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
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Failed to fetch patients with documents:", err);
    return NextResponse.json(
      { success: false, error: "DB error" },
      { status: 500 },
    );
  }
}
