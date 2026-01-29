import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    const result = await db.query("SELECT NOW()");
    return NextResponse.json({
      success: true,
      time: result.rows[0].now,
    });
  } catch (err: any) {
    console.error("DB TEST ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
