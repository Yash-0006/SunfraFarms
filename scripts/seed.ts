import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

const envPathLocal = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPathLocal)) {
  process.loadEnvFile(envPathLocal);
} else if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const LOCATIONS = ['Shed A', 'Shed B', 'Shed C'];
const BUYERS = ['Local Market', 'City Supermarket', 'Wholesale Distributor', 'Bakery Chain', 'Direct Customer'];

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randQuantity = (minTrays: number, maxTrays: number) => {
  const trays = randInt(minTrays, maxTrays);
  const loose = randInt(0, 29);
  return parseFloat(`${trays}.${loose < 10 ? '0' + loose : loose}`);
};

async function seed() {
  const pool = mysql.createPool(dbUrl as string);

  try {
    console.log('Clearing old data...');
    await pool.execute('TRUNCATE TABLE egg_production');
    await pool.execute('TRUNCATE TABLE egg_sale');

    console.log('Seeding new production data...');
    const insertProd = 'INSERT INTO egg_production (location, date, conditionn, quantity) VALUES (?, ?, ?, ?)';
    
    // Seed last 100 days for more data
    const today = new Date();
    for (let i = 100; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      for (const loc of LOCATIONS) {
        // Random production per day per shed
        await pool.execute(insertProd, [loc, dateStr, 'Good', randQuantity(20, 100)]);
        await pool.execute(insertProd, [loc, dateStr, 'Damaged', randQuantity(0, 5)]);
        await pool.execute(insertProd, [loc, dateStr, 'Big', randQuantity(5, 30)]);
        await pool.execute(insertProd, [loc, dateStr, 'Small', randQuantity(5, 30)]);
      }
    }

    console.log('Seeding new sales data...');
    const insertSale = 'INSERT INTO egg_sale (name, date, remarks, big_quantity, small_quantity) VALUES (?, ?, ?, ?, ?)';

    for (let i = 100; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // 1-3 sales per day
      const salesCount = randInt(1, 3);
      for (let s = 0; s < salesCount; s++) {
        const buyer = BUYERS[randInt(0, BUYERS.length - 1)];
        const bigQty = randQuantity(10, 50);
        const smallQty = randQuantity(10, 50);
        await pool.execute(insertSale, [buyer, dateStr, 'Regular sale', bigQty, smallQty]);
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
