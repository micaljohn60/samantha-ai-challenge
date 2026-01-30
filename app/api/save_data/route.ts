// API route to create a new document: ensures the patient exists, maps the category,
// inserts the document into the database, and returns the new document ID

import { NextRequest, NextResponse } from "next/server";
// import { Pool } from "pg";
import pool from "@/lib/db";

// // Use a global pool in dev to prevent multiple connections on hot reload
// declare global {
//   // eslint-disable-next-line no-var
//   var pgPool: Pool | undefined;
// }

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

// if (!global.pgPool) global.pgPool = pool;

// Helper: ensure patient exists
async function ensurePatientExists(
  prefix: string,
  fullName: string,
): Promise<number> {
  const res = await pool.query(
    `SELECT id FROM patients WHERE full_name = $1 LIMIT 1`,
    [fullName],
  );
  if (res.rows.length > 0) return res.rows[0].id;

  const insertRes = await pool.query(
    `INSERT INTO patients (prefix,full_name) VALUES ($1,$2) RETURNING id`,
    [prefix, fullName],
  );
  return insertRes.rows[0].id;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      prefix,
      patient_name,
      date_of_report,
      document_subject,
      source_contact,
      store_in,
      gp_doctor,
      category,
      s3_key,
      s3_url,
      file_name,
    } = data;

    // 1️⃣ Ensure patient exists
    const patient_id = await ensurePatientExists(prefix, patient_name);

    // 2️⃣ Map category to category_id
    const catRes = await pool.query(
      `SELECT id FROM categories WHERE name = $1 LIMIT 1`,
      [category],
    );
    const category_id = catRes.rows.length > 0 ? catRes.rows[0].id : null;

    // 3️⃣ Insert document
    const insertDoc = await pool.query(
      `
      INSERT INTO documents
        (patient_id, doctor_name, date_of_report, document_subject, source_contact, store_in, category_id, s3_key, s3_url,file_name)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
      `,
      [
        patient_id,
        gp_doctor,
        date_of_report,
        document_subject,
        source_contact,
        store_in,
        category_id,
        s3_key,
        s3_url,
        file_name,
      ],
    );

    return NextResponse.json({
      success: true,
      document_id: insertDoc.rows[0].id,
    });
  } catch (err: any) {
    console.error("DB insert failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
