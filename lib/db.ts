import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const pool = mysql.createPool(process.env.DATABASE_URL);

export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.execute(sql, values);
  return rows;
}

export default pool;
