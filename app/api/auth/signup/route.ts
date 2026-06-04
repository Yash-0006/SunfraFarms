import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, mobile, email, password } = await request.json();

    // 1. Check if user exists
    const existingUsers: any = await query('SELECT * FROM users WHERE email = ? OR mobile = ?', [email, mobile]);

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this email or mobile already exists' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user
    await query(
      'INSERT INTO users (first_name, last_name, mobile, email, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, mobile, email, hashedPassword]
    );

    return NextResponse.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
