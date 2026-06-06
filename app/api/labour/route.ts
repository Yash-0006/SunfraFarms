import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/labour — list all workers, optional ?status=active
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM labour';
    const params: any[] = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY name ASC';

    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /api/labour error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

// POST /api/labour — create a new worker
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, aadhar, reference, status } = body;

    if (!name || !mobile || !aadhar) {
      return NextResponse.json({ error: 'name, mobile, aadhar are required' }, { status: 400 });
    }

    const result: any = await query(
      'INSERT INTO labour (name, mobile, aadhar, reference, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), mobile.trim(), aadhar.trim(), (reference || '').trim(), status || 'active']
    );

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('POST /api/labour error:', error);
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 });
  }
}

// PUT /api/labour — update an existing worker
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, mobile, aadhar, reference, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await query(
      'UPDATE labour SET name=?, mobile=?, aadhar=?, reference=?, status=? WHERE id=?',
      [name.trim(), mobile.trim(), aadhar.trim(), (reference || '').trim(), status, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/labour error:', error);
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 });
  }
}

// DELETE /api/labour — delete a worker
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await query('DELETE FROM labour WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/labour error:', error);
    return NextResponse.json({ error: 'Failed to delete worker' }, { status: 500 });
  }
}
