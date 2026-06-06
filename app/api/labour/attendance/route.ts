import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/labour/attendance?month=YYYY-MM
// Returns all active workers and their attendance for the given month
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // e.g. "2026-06"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month param required (YYYY-MM)' }, { status: 400 });
    }

    // All active workers
    const workers: any = await query(
      'SELECT id, name FROM labour WHERE status = ? ORDER BY name ASC',
      ['active']
    );

    // Attendance records for the month
    const records: any = await query(
      `SELECT labour_id, date, status 
       FROM labour_attendance 
       WHERE DATE_FORMAT(date, '%Y-%m') = ?`,
      [month]
    );

    // Build a lookup: { labour_id: { 'YYYY-MM-DD': 'P'|'A'|'P/2' } }
    const attendanceMap: Record<number, Record<string, string>> = {};
    for (const rec of records) {
      if (!attendanceMap[rec.labour_id]) attendanceMap[rec.labour_id] = {};
      const d = new Date(rec.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      attendanceMap[rec.labour_id][dateStr] = rec.status;
    }

    return NextResponse.json({ workers, attendanceMap });
  } catch (error) {
    console.error('GET /api/labour/attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/labour/attendance — upsert one attendance record
// Body: { labour_id, date: 'YYYY-MM-DD', status: 'P'|'A'|'P/2'|'' }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { labour_id, date, status } = body;

    if (!labour_id || !date) {
      return NextResponse.json({ error: 'labour_id and date are required' }, { status: 400 });
    }

    if (!status) {
      // Delete attendance record (clearing the cell)
      await query(
        'DELETE FROM labour_attendance WHERE labour_id = ? AND date = ?',
        [labour_id, date]
      );
    } else {
      const validStatuses = ['P', 'A', 'P/2'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status. Use P, A, or P/2' }, { status: 400 });
      }

      // Upsert
      const updateResult: any = await query(
        'UPDATE labour_attendance SET status = ? WHERE labour_id = ? AND date = ?',
        [status, labour_id, date]
      );
      if (updateResult.affectedRows === 0) {
        await query(
          'INSERT INTO labour_attendance (labour_id, date, status) VALUES (?, ?, ?)',
          [labour_id, date, status]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/labour/attendance error:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
