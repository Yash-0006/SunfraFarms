import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod');

// Define routes that don't require authentication
const publicRoutes = ['/', '/api/auth/login', '/api/auth/signup', '/api/seed'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('auth_token')?.value;

  // If user is on login/signup and already has a token, redirect to dashboard
  const isAuthRoute = pathname === '/';
  if (isAuthRoute) {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/', request.url));
      } catch (e) {
        // Invalid token, allow access to auth page
      }
    }
    return NextResponse.next();
  }

  // Allow exact home page and other public routes
  if (pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!token) {
    // No token found, redirect to login
    return NextResponse.redirect(new URL('/?login=true', request.url));
  }

  try {
    // Verify token
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login and clear cookie
    const response = NextResponse.redirect(new URL('/?login=true', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  // Apply middleware to all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
