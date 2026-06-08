import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { ProfileUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId;

    const users: any = await query('SELECT user_id, first_name, last_name, email, mobile FROM users WHERE user_id = ?', [userId]);

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId;

    const body = await request.json();
    const result = ProfileUpdateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { firstName, lastName, email, mobile, password } = result.data;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, mobile = ?, password = ? WHERE user_id = ?',
        [firstName, lastName, email, mobile, hashedPassword, userId]
      );
    } else {
      await query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, mobile = ? WHERE user_id = ?',
        [firstName, lastName, email, mobile, userId]
      );
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
