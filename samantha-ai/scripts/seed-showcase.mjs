import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

config({ path: resolve(process.cwd(), ".env.local") });

const { Pool } = pg;
const scriptDir = dirname(fileURLToPath(import.meta.url));

const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name} in .env.local`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

const categories = [
  "Pathology results",
  "Referral letter",
  "Clinical notes",
  "Medical imaging report",
  "Discharge summary",
  "Immunisation",
  "Allied health letter",
  "Certificate",
];

const patients = [
  ["Mrs", "Olivia Bennett"],
  ["Mr", "Liam Carter"],
  ["Ms", "Amelia Hughes"],
  ["Mr", "Noah Thompson"],
  ["Mrs", "Charlotte Wilson"],
  ["Mr", "Ethan Mitchell"],
  ["Ms", "Isla Campbell"],
  ["Mr", "Lucas Anderson"],
  ["Mrs", "Mia Richardson"],
  ["Mr", "Henry Walker"],
  ["Ms", "Sophie Edwards"],
  ["Mr", "Jack Sullivan"],
  ["Mrs", "Grace Martin"],
  ["Mr", "William Foster"],
  ["Ms", "Ava Collins"],
  ["Mr", "Thomas Murphy"],
  ["Mrs", "Emily Cooper"],
  ["Mr", "James Stewart"],
];

const legacyFirstNames = [
  ["Ms", "Ruby"], ["Mr", "Oliver"], ["Mrs", "Ella"], ["Mr", "Leo"],
  ["Ms", "Zoe"], ["Mr", "Alexander"], ["Mrs", "Chloe"], ["Mr", "Samuel"],
  ["Ms", "Matilda"],
];
const legacyLastNames = ["Harris", "Davies", "Morrison", "Reid", "Parker", "Walsh"];
const legacyGeneratedNames = legacyFirstNames.flatMap(([, firstName]) =>
  legacyLastNames.map((lastName) => `${firstName} ${lastName}`),
);

patients.push(
  ["Ms", "Ruby Harris"], ["Mr", "Oliver Davies"], ["Mrs", "Ella Morrison"],
  ["Mr", "Leo Reid"], ["Ms", "Zoe Parker"], ["Mr", "Alexander Walsh"],
  ["Mrs", "Chloe Brennan"], ["Mr", "Samuel Fraser"], ["Ms", "Matilda Kerr"],
  ["Mr", "Daniel Webb"], ["Mrs", "Lucy Hamilton"], ["Mr", "Maxwell Brooks"],
  ["Ms", "Evie Russell"], ["Mr", "Benjamin Ward"], ["Mrs", "Hannah Johnston"],
  ["Mr", "Oscar Murray"], ["Ms", "Lily Grant"], ["Mr", "Arthur Phillips"],
  ["Mrs", "Georgia Turner"], ["Mr", "Charlie Evans"], ["Ms", "Freya Robertson"],
  ["Mr", "Harrison Bell"], ["Mrs", "Alice Kennedy"], ["Mr", "Edward Scott"],
  ["Ms", "Poppy Lawrence"], ["Mr", "George Bailey"], ["Mrs", "Jessica Morgan"],
  ["Mr", "Archie Dixon"], ["Ms", "Harper Kelly"], ["Mr", "Sebastian Clarke"],
  ["Mrs", "Phoebe Jenkins"], ["Mr", "Theodore Cook"], ["Ms", "Violet Barnes"],
  ["Mr", "Finn McKenzie"], ["Mrs", "Imogen Price"], ["Mr", "Jacob Reynolds"],
  ["Ms", "Layla Chapman"], ["Mr", "Hugo Davidson"], ["Mrs", "Rose Spencer"],
  ["Mr", "Isaac Fletcher"], ["Ms", "Abigail Mills"], ["Mr", "Xavier Holmes"],
  ["Mrs", "Sienna Armstrong"], ["Mr", "Patrick Woods"], ["Ms", "Evelyn Dean"],
  ["Mr", "Nathan Palmer"], ["Mrs", "Scarlett Lawson"], ["Mr", "Louis Matthews"],
  ["Ms", "Maya Pearson"], ["Mr", "Ryan Gallagher"], ["Mrs", "Clara Newman"],
  ["Mr", "Adam Sinclair"], ["Ms", "Ivy Marshall"], ["Mr", "Dylan Cameron"],
);

const doctors = ["Dr Sarah Nguyen", "Dr Michael Chen", "Dr Priya Nair", "Dr James O'Connor"];
const sources = [
  "Royal Prince Alfred Hospital",
  "Sydney Diagnostic Services",
  "Harbour Radiology",
  "Inner West Pathology",
  "Central Specialist Clinic",
  "Northside Allied Health",
];
const subjects = {
  "Pathology results": ["Full blood count results", "Lipid profile review", "HbA1c pathology results"],
  "Referral letter": ["Cardiology specialist referral", "Dermatology consultation referral", "Physiotherapy referral"],
  "Clinical notes": ["Chronic care review", "Medication and care plan review", "Follow-up consultation notes"],
  "Medical imaging report": ["Chest X-ray report", "Ultrasound imaging report", "MRI findings"],
  "Discharge summary": ["Hospital discharge summary", "Post-operative discharge summary"],
  Immunisation: ["Annual influenza vaccination", "Immunisation history update"],
  "Allied health letter": ["Physiotherapy progress letter", "Dietitian assessment letter"],
  Certificate: ["Medical certificate", "Fitness for work certificate"],
};
const categoryPattern = [0, 0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 7];

function daysAgo(days, hour) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 10 + (days % 40), 0, 0);
  return date;
}

async function uploadSamples() {
  const files = [1, 2, 3].map((n) =>
    resolve(scriptDir, `../public/samples/sample-document-${n}.pdf`),
  );
  const keys = [];

  for (const file of files) {
    const key = `showcase/${basename(file)}`;
    const contents = await readFile(file);
    const objectPath = key.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/pdf",
          "x-upsert": "true",
        },
        body: contents,
      },
    );
    if (!response.ok) {
      throw new Error(`Storage upload failed (${response.status}): ${await response.text()}`);
    }
    keys.push(key);
  }
  return keys;
}

async function seed() {
  const storageKeys = await uploadSamples();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE users SET email = 'admin@sammy.ai' WHERE email = 'admin@samantha.ai'",
    );

    const categoryIds = new Map();
    for (const name of categories) {
      let result = await client.query("SELECT id FROM categories WHERE name = $1 LIMIT 1", [name]);
      if (!result.rows.length) {
        result = await client.query("INSERT INTO categories (name) VALUES ($1) RETURNING id", [name]);
      }
      categoryIds.set(name, result.rows[0].id);
    }

    await client.query("DELETE FROM documents WHERE s3_key LIKE 'showcase/%'");
    await client.query(
      `DELETE FROM patients
       WHERE full_name = ANY($1::text[])
         AND NOT EXISTS (SELECT 1 FROM documents WHERE documents.patient_id = patients.id)`,
      [legacyGeneratedNames],
    );

    const patientNames = patients.map(([, fullName]) => fullName);
    const existingPatients = await client.query(
      "SELECT id, full_name FROM patients WHERE full_name = ANY($1::text[])",
      [patientNames],
    );
    const existingNames = new Set(existingPatients.rows.map((row) => row.full_name));
    const missingPatients = patients.filter(([, fullName]) => !existingNames.has(fullName));

    if (missingPatients.length) {
      const values = missingPatients.flat();
      const rows = missingPatients.map(
        (_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`,
      );
      await client.query(
        `INSERT INTO patients (prefix, full_name) VALUES ${rows.join(",")}`,
        values,
      );
    }

    const savedPatients = await client.query(
      "SELECT id, full_name FROM patients WHERE full_name = ANY($1::text[])",
      [patientNames],
    );
    const patientIdByName = new Map(savedPatients.rows.map((row) => [row.full_name, row.id]));
    const patientIds = patientNames.map((name) => patientIdByName.get(name));

    const documentValues = [];
    const documentRows = [];

    for (let index = 0; index < 320; index++) {
      const category = categories[categoryPattern[index % categoryPattern.length]];
      const subjectOptions = subjects[category];
      const subject = subjectOptions[index % subjectOptions.length];
      const patientIndex = (index * 7 + Math.floor(index / patients.length)) % patients.length;
      const reportAge = index < 38 ? index % 7 : 8 + ((index * 17) % 355);
      const createdAt = daysAgo(reportAge, 8 + (index % 9));
      const reportDate = new Date(createdAt);
      reportDate.setDate(reportDate.getDate() - (index % 4));
      const storageKey = storageKeys[index % storageKeys.length];
      const fileName = `${reportDate.toISOString().slice(0, 10)}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

      const row = [
        patientIds[patientIndex],
        doctors[index % doctors.length],
        reportDate.toISOString().slice(0, 10),
        subject,
        sources[index % sources.length],
        category === "Pathology results" || category === "Medical imaging report"
          ? "Investigations"
          : "Correspondence",
        categoryIds.get(category),
        storageKey,
        `/api/files/${encodeURIComponent(storageKey)}`,
        fileName,
        createdAt,
      ];
      const offset = documentValues.length;
      documentValues.push(...row);
      documentRows.push(`(${row.map((_, position) => `$${offset + position + 1}`).join(",")})`);
    }

    await client.query(
      `INSERT INTO documents
        (patient_id, doctor_name, date_of_report, document_subject, source_contact,
         store_in, category_id, s3_key, s3_url, file_name, created_at)
       VALUES ${documentRows.join(",")}`,
      documentValues,
    );

    await client.query("COMMIT");
    console.log(`Showcase data ready: ${patients.length} patients and 320 documents.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
