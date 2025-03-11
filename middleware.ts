import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the Privy auth cookie
  const privyAuthCookie = request.cookies.get('privy-token');
  
  // Check if the user is authenticated
  const isAuthenticated = !!privyAuthCookie;
  
  // If the user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
    // Exclude API routes from redirection
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If the user is authenticated and trying to access the login page, redirect to home
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes that handle authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 