import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity } from '@/lib/quantity-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const periodParam = searchParams.get('period');
    
    let rows: any;
    let queryStr = 'SELECT * FROM egg_production';
    let params: any[] = [];

    if (dateParam) {
      queryStr += ' WHERE DATE(date) = ?';
      params.push(dateParam);
    } else if (periodParam && periodParam !== 'all') {
      const today = new Date();
      let days = 0;
      if (periodParam === 'week') days = 7;
      else if (periodParam === 'month') days = 30;
      else if (periodParam === 'year') days = 365;
      
      const cutoff = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
      const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
      queryStr += ' WHERE DATE(date) >= ?';
      params.push(cutoffStr);
    }

    queryStr += ' ORDER BY id DESC';
    rows = await query(queryStr, params);
    
    // Group by location
    const groupedData: Record<string, { goodEggs: number, damagedEggs: number, bigEggs: number, smallEggs: number }> = {};
    
    rows.forEach((row: any) => {
      const loc = row.location;
      if (!groupedData[loc]) {
        groupedData[loc] = { goodEggs: 0, damagedEggs: 0, bigEggs: 0, smallEggs: 0 };
      }
      
      const eggs = parseToTotalEggs(row.quantity);
      if (row.conditionn === 'Good') {
        groupedData[loc].goodEggs += eggs;
      } else if (row.conditionn === 'Damaged') {
        groupedData[loc].damagedEggs += eggs;
      } else if (row.conditionn === 'Big') {
        groupedData[loc].bigEggs += eggs;
      } else if (row.conditionn === 'Small') {
        groupedData[loc].smallEggs += eggs;
      } else {
        // Fallback for legacy 'Damage' or 'Bad'
        groupedData[loc].damagedEggs += eggs;
      }
    });

    // Format for frontend
    const result = Object.keys(groupedData).map((loc) => ({
      location: loc,
      goodQuantity: normalizeQuantity(groupedData[loc].goodEggs),
      damagedQuantity: normalizeQuantity(groupedData[loc].damagedEggs),
      bigQuantity: normalizeQuantity(groupedData[loc].bigEggs),
      smallQuantity: normalizeQuantity(groupedData[loc].smallEggs),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch production data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, goodQuantity, damagedQuantity, bigQuantity, smallQuantity } = body;

    const goodEggs = parseToTotalEggs(goodQuantity || '0');
    const damagedEggs = parseToTotalEggs(damagedQuantity || '0');
    const bigEggs = parseToTotalEggs(bigQuantity || '0');
    const smallEggs = parseToTotalEggs(smallQuantity || '0');

    const inserts = [
      { condition: 'Good', qty: goodEggs },
      { condition: 'Damaged', qty: damagedEggs },
      { condition: 'Big', qty: bigEggs },
      { condition: 'Small', qty: smallEggs }
    ];

    for (const insert of inserts) {
      if (insert.qty > 0) {
        await query(
          'INSERT INTO egg_production (location, conditionn, quantity, date) VALUES (?, ?, ?, NOW())',
          [location, insert.condition, normalizeQuantity(insert.qty)]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add production data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { oldLocation, location, goodQuantity, damagedQuantity, bigQuantity, smallQuantity } = body;

    // To update properly without complex SQL conditions, we delete old records and insert new ones
    await query('DELETE FROM egg_production WHERE location = ?', [oldLocation]);

    const goodEggs = parseToTotalEggs(goodQuantity || '0');
    const damagedEggs = parseToTotalEggs(damagedQuantity || '0');
    const bigEggs = parseToTotalEggs(bigQuantity || '0');
    const smallEggs = parseToTotalEggs(smallQuantity || '0');

    const inserts = [
      { condition: 'Good', qty: goodEggs },
      { condition: 'Damaged', qty: damagedEggs },
      { condition: 'Big', qty: bigEggs },
      { condition: 'Small', qty: smallEggs }
    ];

    for (const insert of inserts) {
      if (insert.qty > 0) {
        await query(
          'INSERT INTO egg_production (location, conditionn, quantity, date) VALUES (?, ?, ?, NOW())',
          [location, insert.condition, normalizeQuantity(insert.qty)]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update production data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { location } = body;

    await query('DELETE FROM egg_production WHERE location = ?', [location]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
