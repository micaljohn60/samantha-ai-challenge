// API route to GET a document by ID with patient and category info,
// and to UPDATE a document and related patient details

import { NextResponse, NextRequest } from "next/server";
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

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const result = await pool.query(
      `
      SELECT
        d.id,
        d.file_name,
        d.s3_key,
        d.patient_id,
        p.full_name AS patient_name,
        d.category_id,
        c.name AS category,
        d.doctor_name as gp_doctor,
        d.date_of_report,
        d.document_subject,
        d.source_contact,
        d.store_in,
        p.prefix,
        d.created_at
      FROM documents d
      LEFT JOIN patients p ON d.patient_id = p.id
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE d.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("GET DOCUMENT ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const { gp_doctor, patient_name, prefix } = data;

    const patientRes = await pool.query(
      `SELECT patient_id FROM documents WHERE id = $1 LIMIT 1`,
      [id],
    );

    if (patientRes.rows.length === 0)
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 },
      );

    const patient_id = patientRes.rows[0].patient_id;

    if (prefix || patient_name) {
      await pool.query(
        `UPDATE patients SET prefix = COALESCE($1, prefix), full_name = COALESCE($2, full_name) WHERE id = $3`,
        [prefix, patient_name, patient_id],
      );
    }

    await pool.query(
      `
      UPDATE documents SET
        doctor_name = COALESCE($1, doctor_name),
        date_of_report = COALESCE($2, date_of_report),
        document_subject = COALESCE($3, document_subject),
        source_contact = COALESCE($4, source_contact),
        store_in = COALESCE($5, store_in),
        category_id = COALESCE($6, category_id)
      WHERE id = $7
      `,
      [
        gp_doctor,
        data.date_of_report || null,
        data.document_subject || null,
        data.source_contact || null,
        data.store_in || null,
        data.category_id || null,
        id,
      ],
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Update failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
