import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl)
      return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });

    // Fetch the PDF from S3
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error("Failed to fetch PDF from S3");

    const pdfBuffer = Buffer.from(await res.arrayBuffer());

    // Send PDF to Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a medical document AI assistant. 

check category form the following. take the closet one

Admissions summary,
Advance care planning ,
Allied health letter,
Certificate ,
Clinical notes,
Clinical photograph,
Consent form,
DAS21,
Discharge summary,
ECG,
Email,
Form,
Immunisation,
Indigenous PIP,
Letter,
Medical imaging report,
MyHealth registration,
New PT registration form,
Pathology results,
Patient consent,
Record request, 
Referral letter,
Workcover,
Workcover consent

Extract prefix, patient_name, date_of_report, document_subject, source_contact, store_in, gp_doctor, category.
Return your output as plain text (do NOT wrap in JSON or code blocks). Convert date_of_report to convertible data format
`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBuffer.toString("base64"),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Gemini raw output:", text);

    // ✅ Return raw string directly
    return NextResponse.json({ extractedText: text });
  } catch (err: any) {
    console.error("Gemini extraction failed:", err);
    return NextResponse.json(
      { error: "Extraction failed", details: err.message },
      { status: 500 },
    );
  }
}
