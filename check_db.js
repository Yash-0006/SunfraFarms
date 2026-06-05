const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function check() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  
  const [descProd] = await pool.query('DESCRIBE egg_production');
  console.log('egg_production:', descProd);
  
  const [descSale] = await pool.query('DESCRIBE egg_sale');
  console.log('egg_sale:', descSale);

  pool.end();
}

check().catch(console.error);
