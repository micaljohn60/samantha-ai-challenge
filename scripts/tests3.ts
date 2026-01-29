// scripts/testS3.ts
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env.local" });
// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_REGION:", process.env.AWS_REGION);

// Check env variables
if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_REGION ||
  !process.env.S3_BUCKET_NAME
) {
  throw new Error("AWS environment variables are not set correctly!");
}

// Create S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function testS3() {
  const filePath = path.join(__dirname, "test.pdf");
  if (!fs.existsSync(filePath)) {
    console.error("❌ test.pdf not found in scripts folder");
    return;
  }

  const fileContent = fs.readFileSync(filePath);
  const key = `test.pdf`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: fileContent,
      ContentType: "application/pdf",
    });

    await s3.send(command);

    console.log("✅ S3 upload successful:", key);
    console.log(
      "File URL:",
      `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
    );
  } catch (err) {
    console.error("❌ S3 upload failed:", err);
  }
}

testS3();
