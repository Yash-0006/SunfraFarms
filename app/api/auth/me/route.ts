import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name || 'Admin',
      }
    }, { status: 200 });
  } catch (error) {
    // If token verification fails, consider unauthenticated
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
