// API route to fetch a PDF file from AWS S3 by key and return it as an inline response

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    // ✅ Await params (Next.js requirement)
    const { key } = await context.params;

    // ✅ Decode URL-encoded S3 key
    const decodedKey = decodeURIComponent(key);

    console.log("Fetching S3 Key:", decodedKey);

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: decodedKey,
    });

    const response = await s3.send(command);

    return new Response(response.Body as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (err: any) {
    console.error("S3 Fetch Error:", err);
    return new Response("File not found", { status: 404 });
  }
}
