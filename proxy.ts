import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Since we are using a simple client-side localStorage auth for the kids app,
  // we can't fully check the token securely here without SSR cookies.
  // But we can check if they are trying to access protected routes and just pass through
  // The actual protection will happen in the client components via useAuth hook,
  // or we could set a simple cookie during login.
  
  // For a full production app, we would use Supabase SSR auth here.
  // But for this simplified app, we'll let the client handle redirects.
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/stories/:path*',
    '/games/:path*',
    '/coloring/:path*',
    '/profile/:path*',
  ],
};
