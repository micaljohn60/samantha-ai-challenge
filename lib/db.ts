import { Pool } from "pg";

const pool = new Pool({
  host: process.env.NEXT_PUBLIC_PG_HOST,
  port: Number(process.env.NEXT_PUBLIC_PG_PORT || 5432),
  user: process.env.NEXT_PUBLIC_PG_USER,
  password: process.env.NEXT_PUBLIC_PG_PASSWORD,
  database: process.env.NEXT_PUBLIC_PG_DATABASE,
  ssl: false,
});

export default pool;
