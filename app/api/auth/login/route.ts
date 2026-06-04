import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod');

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    // 1. Find user by email or mobile
    // We'll treat the input as either an email string or a mobile number string
    const users: any = await query('SELECT * FROM users WHERE email = ? OR mobile = ?', [email, email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 404 });
    }

    const user = users[0];

    // 2. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // Determine expiration based on Remember Me
    const expiresIn = rememberMe ? '30d' : '24h';
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // 3. Create JWT Token
    const token = await new SignJWT({ userId: user.user_id, email: user.email, name: user.first_name })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET);

    // 4. Set Cookie in the response
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
