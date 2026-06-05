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
