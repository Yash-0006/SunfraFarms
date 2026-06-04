import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { normalizeQuantity, parseToTotalEggs } from '@/lib/quantity-utils';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM egg_sale ORDER BY id DESC');
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