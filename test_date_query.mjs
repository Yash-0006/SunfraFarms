import mysql from 'mysql2/promise';

const pool = mysql.createPool('mysql://root:sunfra@localhost:3306/sunfrafarms');

async function checkDate() {
  try {
    const [rows1] = await pool.execute("SELECT id, name, date FROM egg_sale WHERE DATE(date) = '2026-06-04'");
    console.log('Sales matching exactly DATE(date) = 2026-06-04:');
    console.log(rows1);

    const [rows2] = await pool.execute("SELECT id, name, date FROM egg_sale WHERE DATE(date) = '2026-06-05'");
    console.log('\nSales matching exactly DATE(date) = 2026-06-05:');
    console.log(rows2);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkDate();
