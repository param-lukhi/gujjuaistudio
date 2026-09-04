import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'gujju-ai-studio-secret-key-2026',
  });

  const { pathname } = req.nextUrl;

  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminPage = pathname.startsWith('/admin') && !isAdminLoginPage;
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isDashboardPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/client') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/files');

  const isBookingPage = pathname.startsWith('/book');

  // Dedicated Admin Login Page handling
  if (isAdminLoginPage) {
    if (token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Client Auth pages handling
  if (isAuthPage) {
    if (token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Admin route protection: Only ADMIN role allowed
  if (isAdminPage) {
    if (!token) {
      const adminLoginUrl = new URL('/admin/login', req.url);
      adminLoginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Client/Dashboard & Booking route protection: Logged in users allowed
  if (isDashboardPage || isBookingPage) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/client/:path*',
    '/book',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};

