# Samantha.AI - Clinic Document Application

**Samantha.AI** is a Next.js application designed for clinics to process and manage documents efficiently. The app allows you to **scan PDFs using Gemini API 2.5 Flash**, extract key patient and document data, save it to a database, and securely store files in an AWS S3 bucket.

---

## Features

- Upload and scan PDFs with **Gemini API 2.5 Flash**.
- Automatically extract patient information, document details, and categories.
- Save extracted data into **PostgreSQL** database.
- Store uploaded PDF files securely in **AWS S3**.
- User-friendly interface for viewing and managing documents.
- Reusable notifications for success/error messages.

---

## 1. Clone the Repository

```bash
git clone https://github.com/micaljohn60/samantha-ai-challenge.git
cd samantha-ai

```

```bash
npm install
```

OR

```bash
yarn install
```

## 2. Create Environment Variables

```bash

NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>

NEXT_PUBLIC_AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
NEXT_PUBLIC_AWS_REGION=<your-aws-region>
NEXT_PUBLIC_S3_BUCKET_NAME=<your-s3-bucket-name>

NEXT_PUBLIC_DATABASE_URL=<your-database-url>
NEXT_PUBLIC_PG_HOST=<your-pg-host>
NEXT_PUBLIC_PG_USER=postgres
NEXT_PUBLIC_PG_PASSWORD=<your-pg-password>
NEXT_PUBLIC_PG_DATABASE=<your-database-name>

```

## 3. Run the Development Server

```bash
npm run dev
```
