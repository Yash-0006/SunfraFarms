import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { SignupSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { firstName, lastName, mobile, email, password } = result.data;

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
