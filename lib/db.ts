import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in the environment variables.");
    }
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

export async function query(sql: string, values?: any[]) {
  const p = getPool();
  const [rows] = await p.execute(sql, values);
  return rows;
}

// Export the pool getter or use it inside query
export default getPool;
