import mysql from 'mysql2/promise';

const pool = mysql.createPool('mysql://root:sunfra@localhost:3306/sunfrafarms');

// Quantity logic (1.30 -> 60 eggs -> 2.00)
function parseToTotalEggs(quantity) {
  const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(qty)) return 0;
  const trays = Math.floor(qty);
  const eggs = Math.round((qty - trays) * 100);
  return (trays * 30) + eggs;
}

function normalizeQuantity(totalEggs) {
  if (totalEggs < 0) return 0;
  const trays = Math.floor(totalEggs / 30);
  const remainingEggs = totalEggs % 30;
  return trays + (remainingEggs / 100);
}

const getValidQty = (minTrays, maxTrays) => {
  const trays = Math.floor(Math.random() * (maxTrays - minTrays + 1) + minTrays);
  const loose = Math.floor(Math.random() * 30); // 0 to 29
  // This input could theoretically look like 10.25 (10 trays, 25 loose)
  const inputQty = parseFloat((trays + (loose / 100)).toFixed(2));
  // Apply the rule to ensure it's normalized before inserting
  return normalizeQuantity(parseToTotalEggs(inputQty));
};

async function seedTodayMultiple() {
  try {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sheds = ['Shed A', 'Shed B', 'Shed C'];
    const buyers = ['Local Bakery', 'Supermarket', 'Farmers Market'];

    console.log(`Seeding multiple records for today (${date})...`);

    // 1. Seed Production
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
    console.log('✅ Inserted Production data for today.');

    // 2. Seed Sales
    const remarksList = ['Cash paid', 'Pending', 'UPI Transfer', ''];
    for (let i = 0; i < 3; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const bigQty = getValidQty(10, 40);
      const smallQty = getValidQty(0, 5);
      const remarks = remarksList[Math.floor(Math.random() * remarksList.length)];

      await pool.execute(
        'INSERT INTO egg_sale (name, big_quantity, small_quantity, remarks, date) VALUES (?, ?, ?, ?, ?)',
        [buyer, bigQty, smallQty, remarks, date]
      );
    }
    console.log('✅ Inserted Sales data for today.');

    // 3. Seed Labour Attendance (Last 90 days / 3 months to make charts look good)
    const [workers] = await pool.query("SELECT id FROM labour WHERE status = 'active'");
    if (workers.length > 0) {
      console.log(`Seeding attendance for ${workers.length} active workers over 3 months...`);
      const statuses = ['P', 'P', 'P', 'P', 'P', 'A', 'P/2']; // Weighted to mostly Present

      for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - dayOffset);
        // Format as YYYY-MM-DD
        const dateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

        for (const worker of workers) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          // Using INSERT IGNORE so we don't break unique constraints if re-run
          await pool.execute(
            'INSERT IGNORE INTO labour_attendance (labour_id, status, date) VALUES (?, ?, ?)',
            [worker.id, status, dateStr]
          );
        }
      }
      console.log('✅ Inserted Labour Attendance data for the past 3 months.');
    } else {
      console.log('⚠️ No active workers found to seed attendance.');
    }

    console.log('Data seeding for today complete!');
  } catch (err) {
    console.error('Failed to seed:', err);
  } finally {
    await pool.end();
  }
}

seedTodayMultiple();
