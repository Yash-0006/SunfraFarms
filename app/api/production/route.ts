import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity } from '@/lib/quantity-utils';

export async function GET() {
  try {
    const rows: any = await query('SELECT * FROM egg_production ORDER BY id DESC');
    
    // Group by location
    const groupedData: Record<string, { goodEggs: number, badEggs: number }> = {};
    
    rows.forEach((row: any) => {
      const loc = row.location;
      if (!groupedData[loc]) {
        groupedData[loc] = { goodEggs: 0, badEggs: 0 };
      }
      
      const eggs = parseToTotalEggs(row.quantity);
      if (row.conditionn === 'Good') {
        groupedData[loc].goodEggs += eggs;
      } else {
        groupedData[loc].badEggs += eggs;
      }
    });

    // Format for frontend
    const result = Object.keys(groupedData).map((loc) => ({
      location: loc,
      goodQuantity: normalizeQuantity(groupedData[loc].goodEggs),
      badQuantity: normalizeQuantity(groupedData[loc].badEggs),
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
    const { location, goodQuantity, badQuantity } = body;

    const goodEggs = parseToTotalEggs(goodQuantity || '0');
    const badEggs = parseToTotalEggs(badQuantity || '0');

    if (goodEggs > 0) {
      await query(
        'INSERT INTO egg_production (location, conditionn, quantity) VALUES (?, ?, ?)',
        [location, 'Good', normalizeQuantity(goodEggs)]
      );
    }
    
    if (badEggs > 0) {
      await query(
        'INSERT INTO egg_production (location, conditionn, quantity) VALUES (?, ?, ?)',
        [location, 'Bad', normalizeQuantity(badEggs)]
      );
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
    const { oldLocation, location, goodQuantity, badQuantity } = body;

    // To update properly without complex SQL conditions, we delete old records and insert new ones
    await query('DELETE FROM egg_production WHERE location = ?', [oldLocation]);

    const goodEggs = parseToTotalEggs(goodQuantity || '0');
    const badEggs = parseToTotalEggs(badQuantity || '0');

    if (goodEggs > 0) {
      await query(
        'INSERT INTO egg_production (location, conditionn, quantity) VALUES (?, ?, ?)',
        [location, 'Good', normalizeQuantity(goodEggs)]
      );
    }
    
    if (badEggs > 0) {
      await query(
        'INSERT INTO egg_production (location, conditionn, quantity) VALUES (?, ?, ?)',
        [location, 'Bad', normalizeQuantity(badEggs)]
      );
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
