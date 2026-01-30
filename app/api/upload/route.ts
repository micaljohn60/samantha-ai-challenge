// API route to upload a PDF to AWS S3: reads the file from the request,
// uploads it to S3, and returns a signed URL for access

import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    // Get filename from header
    const fileName = req.headers.get("x-filename");
    if (!fileName)
      return NextResponse.json(
        { error: "Filename not provided" },
        { status: 400 },
      );

    // Read PDF body as ArrayBuffer
    const pdfArrayBuffer = await req.arrayBuffer();
    if (!pdfArrayBuffer)
      return NextResponse.json({ error: "No file sent" }, { status: 400 });

    const key = `uploads/${Date.now()}-${fileName}`;

    // Actually upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: key,
        Body: Buffer.from(pdfArrayBuffer),
        ContentType: "application/pdf",
      }),
    );

    // Generate signed URL
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: key,
      }),
      { expiresIn: 3600 },
    );

    console.log("Signed URL:", signedUrl);

    // Return to frontend
    return NextResponse.json({ fileUrl: signedUrl, s3key: key });
  } catch (err: any) {
    console.error("S3 upload failed:", err);
    return NextResponse.json(
      { error: "S3 upload failed", details: err.message },
      { status: 500 },
    );
  }
}
