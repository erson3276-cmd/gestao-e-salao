import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const salonSession = request.cookies.get('salon_session')
  const superAdminSession = request.cookies.get('super_admin_session')
  const adminAuth = request.cookies.get('admin_auth')

  const isSuperAdminPath = pathname.startsWith('/super-admin')
  const isSalonPath = pathname.startsWith('/admin')
  const isAuthPath = pathname === '/login' || pathname === '/register'
  const isPublicPath = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || pathname === '/manifest.json' || pathname.match(/\.(png|jpg|svg|ico)$/)

  // Allow public paths
  if (isPublicPath) return NextResponse.next()

  // Super admin routes
  if (isSuperAdminPath) {
    if (!superAdminSession || superAdminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Salon routes - check subscription expiry
  if (isSalonPath) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    if (!salonSession && !superAdminSession && !adminAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check subscription expiry for salon sessions
    if (salonSession) {
      try {
        const session = JSON.parse(salonSession.value)
        if (session.subscriptionEndsAt) {
          const expiresAt = new Date(session.subscriptionEndsAt)
          const now = new Date()
          if (now > expiresAt) {
            // Subscription expired - redirect to payment/expired page
            return NextResponse.redirect(new URL('/subscription-expired', request.url))
          }
        }
      } catch {
        // Invalid session, let them through and server-side check will handle
      }
    }

    return NextResponse.next()
  }

  // Auth pages - allow access
  if (isAuthPath) {
    return NextResponse.next()
  }

  // Subscription expired page
  if (pathname === '/subscription-expired') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/super-admin/:path*', '/login', '/register', '/subscription-expired']
}
