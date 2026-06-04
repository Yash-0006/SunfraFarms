require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [prodSchema] = await pool.query('DESCRIBE egg_production');
    console.log('egg_production:', prodSchema);

    const [saleSchema] = await pool.query('DESCRIBE egg_sale');
    console.log('egg_sale:', saleSchema);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

main();
