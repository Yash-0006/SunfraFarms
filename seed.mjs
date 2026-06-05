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

    for (const date of dates) {
      // Production
      for (const shed of sheds) {
        // Random quantity between 10 to 50 trays
        const goodQty = (Math.random() * 40 + 10).toFixed(2);
        const badQty = (Math.random() * 5).toFixed(2);
        
        await pool.execute(
          'INSERT INTO egg_production (location, quantity, conditionn, date) VALUES (?, ?, ?, ?)',
          [shed, parseFloat(goodQty), 'Good', date]
        );
        
        await pool.execute(
          'INSERT INTO egg_production (location, quantity, conditionn, date) VALUES (?, ?, ?, ?)',
          [shed, parseFloat(badQty), 'Damage', date]
        );
      }

      // Sales
      const salesQty = (Math.random() * 80 + 20).toFixed(2);
      await pool.execute(
        'INSERT INTO egg_sale (name, quantity, date) VALUES (?, ?, ?)',
        [buyers[Math.floor(Math.random() * buyers.length)], parseFloat(salesQty), date]
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
