import { NextResponse } from 'next/server';

export async function POST() {
  // Create a successful response
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Delete the auth_token cookie to clear the session
  response.cookies.delete('auth_token');
  
  return response;
}
