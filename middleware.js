import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/backtest(.*)',
  '/bot(.*)',
  '/profile(.*)'
])

const isPremiumRoute = createRouteMatcher([
  '/dashboard/strategies(.*)',
  '/dashboard/backtest/advanced(.*)',
  '/dashboard/bot/premium(.*)',
  '/dashboard/analytics/advanced(.*)'
])

const isUpgradeRoute = createRouteMatcher([
  '/dashboard/upgrade',
  '/dashboard/orders'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      return Response.redirect(new URL('/sign-in', req.url))
    }
  }
  
  // Check if user is trying to access premium features
  if (isPremiumRoute(req)) {
    if (!userId) {
      return Response.redirect(new URL('/sign-in', req.url))
    }
    
    const userRole = sessionClaims?.metadata?.role
    if (userRole !== 'premium' && userRole !== 'admin') {
      return Response.redirect(new URL('/dashboard/upgrade', req.url))
    }
  }
  
  // Auto-redirect free users to upgrade page when accessing certain features
  if (userId && !isUpgradeRoute(req)) {
    const userRole = sessionClaims?.metadata?.role
    const pathname = req.nextUrl.pathname
    
    // Redirect to upgrade if free user tries to access premium features
    const premiumPaths = [
      '/dashboard/strategies',
      '/dashboard/backtest',
      '/dashboard/bot',
      '/dashboard/analytics'
    ]
    
    if (premiumPaths.some(path => pathname.startsWith(path)) && 
        (!userRole || userRole === 'user')) {
      return Response.redirect(new URL('/dashboard/upgrade', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}