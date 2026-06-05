require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
async function main() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  try {
    const [schema] = await pool.query('DESCRIBE users');
    console.log(schema);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
