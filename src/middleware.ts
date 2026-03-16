import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');

  // Check if the path is superadmin route
  if (pathname.startsWith('/superadmin') || pathname.startsWith('/api/superadmin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );

      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string;
      console.log(`[MIDDLEWARE] SUPERADMIN Check | Role: ${userRole}`);

      if (userRole?.toUpperCase() !== 'SUPERADMIN') {
        if (isApiRoute) {
          return NextResponse.json({ error: 'Forbidden. Required SUPERADMIN' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/admin/pos', request.url));
      }

      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-email', payload.email as string);
      requestHeaders.set('x-user-role', 'SUPERADMIN');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error(`[MIDDLEWARE] SUPERADMIN Auth Error:`, error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if the path is admin route
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      if (isApiRoute) {
        console.warn(`[MIDDLEWARE] 401 Unauthorized (Admin): Missing token for path ${pathname}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );

      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string;

      console.log(`[MIDDLEWARE] Path: ${pathname} | User: ${payload.email} | Role: ${userRole}`);

      // 1. Block Customers from Admin Area (Exception for Kitchen account API access)
      if ((userRole === 'CUSTOMER' || !userRole) && payload.role !== 'KITCHEN') {
        console.warn(`[MIDDLEWARE] Access Denied for CUSTOMER on admin path: ${pathname}`);
        if (isApiRoute) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // 2. RBAC Logic
      // SUPERADMIN, MANAGER or Kitchen: Access Everything
      if (userRole === 'SUPERADMIN' || userRole === 'MANAGER' || userRole === 'KITCHEN') {
        // Pass through
      }
      // BARISTA / WAITER: Limited Access
      else if (['BARISTA', 'WAITER'].includes(userRole)) {
        // Allowed paths for Staff
        const allowedPaths = [
          '/admin/pos',
          '/admin/profile',
          '/admin/orders',
          '/admin/waste',
          '/api/admin/orders',
          '/api/admin/products',
          '/api/admin/staff',
          '/api/admin/staff-consumption',
          '/api/admin/waste',
          '/api/admin/loyalty/check',
          '/api/admin/loyalty/stats',
          '/api/orders'
        ];

        // Exact match or starts with (for sub-routes)
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path)) || pathname === '/admin';

        if (!isAllowed) {
          if (isApiRoute) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
          // Redirect unauthorized staff to POS
          return NextResponse.redirect(new URL('/admin/pos', request.url));
        }
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      if (payload.userId) {
        requestHeaders.set('x-user-id', payload.userId as string);
      }
      if (payload.email) {
        requestHeaders.set('x-user-email', payload.email as string);
      }
      if (payload.role) {
        requestHeaders.set('x-user-role', payload.role as string);
      }
      if (payload.businessId) {
        requestHeaders.set('x-business-id', payload.businessId as string);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error(`[MIDDLEWARE] Auth Error on ${pathname}:`, error);
      if (isApiRoute) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if the path is kitchen route
  if (pathname.startsWith('/kitchen') || pathname.startsWith('/api/kitchen')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      if (isApiRoute) {
        console.warn(`[MIDDLEWARE] 401 Unauthorized: Missing token for path ${pathname}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );
      const { payload } = await jwtVerify(token, secret);

      // Allow Kitchen, Admin, Barista and Managers
      if (
        payload.role !== 'MANAGER' &&
        payload.role !== 'BARISTA' &&
        payload.role !== 'KITCHEN'
      ) {
        if (isApiRoute) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/kitchen/:path*', '/api/kitchen/:path*', '/superadmin/:path*', '/api/superadmin/:path*'],
};