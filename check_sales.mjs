import mysql from 'mysql2/promise';

const pool = mysql.createPool('mysql://root:sunfra@localhost:3306/sunfrafarms');

async function checkDb() {
  try {
    const [rows] = await pool.execute('SELECT id, name, big_quantity, small_quantity, date FROM egg_sale ORDER BY date DESC LIMIT 20');
    console.log('Recent egg_sale records:');
    console.log(rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkDb();
