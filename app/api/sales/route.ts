import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { normalizeQuantity, parseToTotalEggs } from '@/lib/quantity-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const periodParam = searchParams.get('period');
    
    let rows: any;
    let queryStr = 'SELECT * FROM egg_sale';
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
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, quantity, remarks } = body;

    const totalEggs = parseToTotalEggs(quantity);
    const normalizedQty = normalizeQuantity(totalEggs);

    const result = await query(
      'INSERT INTO egg_sale (name, quantity, remarks) VALUES (?, ?, ?)',
      [name, normalizedQty, remarks]
    );

    return NextResponse.json({ success: true, insertedId: (result as any).insertId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save sales data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, quantity, remarks } = body;

    const totalEggs = parseToTotalEggs(quantity);
    const normalizedQty = normalizeQuantity(totalEggs);

    await query(
      'UPDATE egg_sale SET name = ?, quantity = ?, remarks = ? WHERE id = ?',
      [name, normalizedQty, remarks, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update sales data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {

  try {
    const body = await request.json();
    const { id } = body;

    await query(
      'DELETE FROM egg_sale WHERE id = ?', [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete data' }, {
      status: 500
    });
  }
}