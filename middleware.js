// middleware.js
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/backtest(.*)',
  '/bot(.*)',
  '/profile(.*)',
  '/admin(.*)'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const isPremiumRoute = createRouteMatcher([
  //'/dashboard/backtest(.*)',
  '/dashboard/strategies(.*)',
  '/dashboard/bot/premium(.*)',
  '/dashboard/analytics/advanced(.*)'
])

const isUpgradeRoute = createRouteMatcher([
  '/dashboard/upgrade',
  '/dashboard/orders'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const userRole = sessionClaims?.metadata?.role
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Protect admin route (requires login + role admin)
  if (isAdminRoute(req)) {
    if (!userId) {
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }
    if (userRole !== 'admin') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Routes that require authentication (non-admin protected)
  if (isProtectedRoute(req)) {
    if (!userId) {
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }
  }

  // Premium route protection
  if (isPremiumRoute(req)) {
    if (!userId) {
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }
    if (userRole !== 'premium' && userRole !== 'admin') {
      url.pathname = '/dashboard/upgrade'
      return NextResponse.redirect(url)
    }
  }

  // Auto-upgrade redirect for free users trying to access premium-ish paths
  const premiumFallbackPaths = [
    //'/dashboard/backtest',
    '/dashboard/strategies',
    '/dashboard/bot',
    '/dashboard/analytics'
  ]

  if (
    userId &&
    !isUpgradeRoute(req) &&
    !isAdminRoute(req) &&
    premiumFallbackPaths.some(p => pathname.startsWith(p)) &&
    (!userRole || userRole === 'user')
  ) {
    url.pathname = '/dashboard/upgrade'
    return NextResponse.redirect(url)
  }

  // Jika semua lolos, lanjutkan
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
