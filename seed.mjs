import mysql from 'mysql2/promise';

const pool = mysql.createPool('mysql://root:sunfra@localhost:3306/sunfrafarms');

async function seed() {
  try {
    // Clear existing data to avoid duplicates if run multiple times
    await pool.execute('DELETE FROM egg_production');
    await pool.execute('DELETE FROM egg_sale');
    
    console.log('Cleared existing data.');

    // get dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 19).replace('T', ' '));
    }

    const sheds = ['Shed A', 'Shed B', 'Shed C'];
    const buyers = ['Local Bakery', 'Supermarket', 'Farmers Market'];

    const getValidQty = (minTrays, maxTrays) => {
      const trays = Math.floor(Math.random() * (maxTrays - minTrays + 1) + minTrays);
      const loose = Math.floor(Math.random() * 30); // 0 to 29
      return parseFloat((trays + (loose / 100)).toFixed(2));
    };

    for (const date of dates) {
      // Production
      for (const shed of sheds) {
        const goodQty = getValidQty(10, 50);
        const damagedQty = getValidQty(0, 5);
        const bigQty = getValidQty(0, 3);
        const smallQty = getValidQty(0, 4);
        
        await pool.execute(
          'INSERT INTO egg_production (location, quantity, conditionn, date) VALUES (?, ?, ?, ?)',
          [shed, goodQty, 'Good', date]
        );
        await pool.execute(
          'INSERT INTO egg_production (location, quantity, conditionn, date) VALUES (?, ?, ?, ?)',
          [shed, damagedQty, 'Damaged', date]
        );
        await pool.execute(
          'INSERT INTO egg_production (location, quantity, conditionn, date) VALUES (?, ?, ?, ?)',
          [shed, bigQty, 'Big', date]
        );
        await pool.execute(
          'INSERT INTO egg_production (location, quantity, conditionn, date) VALUES (?, ?, ?, ?)',
          [shed, smallQty, 'Small', date]
        );
      }

      // Sales
      const salesQty = getValidQty(20, 100);
      await pool.execute(
        'INSERT INTO egg_sale (name, quantity, date) VALUES (?, ?, ?)',
        [buyers[Math.floor(Math.random() * buyers.length)], salesQty, date]
      );
    }
    
    console.log('Dummy data seeded successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

seed();
