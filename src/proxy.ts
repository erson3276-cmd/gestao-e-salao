import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const salonSession = request.cookies.get('salon_session')
  const superAdminSession = request.cookies.get('super_admin_session')

  const isSuperAdminPath = pathname.startsWith('/super-admin')
  const isSalonPath = pathname.startsWith('/admin')
  const isAuthPath = pathname === '/login' || pathname === '/register'

  if (isSuperAdminPath) {
    if (!superAdminSession || superAdminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (isSalonPath) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    if (!salonSession && !superAdminSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (isAuthPath && (salonSession || superAdminSession)) {
    if (superAdminSession) {
      return NextResponse.redirect(new URL('/super-admin', request.url))
    }
    return NextResponse.redirect(new URL('/admin/agenda', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/super-admin/:path*', '/login', '/register']
}
