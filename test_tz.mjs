import mysql from 'mysql2/promise';

const pool = mysql.createPool('mysql://root:sunfra@localhost:3306/sunfrafarms');

async function checkDate() {
  try {
    const [rows] = await pool.execute("SELECT id, date, DATE(date) as str_date FROM egg_sale WHERE id = 221");
    console.log(rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkDate();
