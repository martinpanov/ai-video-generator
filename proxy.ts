import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './app/lib/session';

const protectedRoutes = ["/", "/clips"];
const publicRoutes = ["/login", "/register"];

export default async function proxy(request: NextRequest) {
  // Skip proxy for Server Actions (they handle their own redirects)
  if (request.headers.get('next-action')) {
    return NextResponse.next();
  }

  const isAuth = await verifySession();
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  );
  const isPublicRoute = publicRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  );

  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicRoute && isAuth) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};