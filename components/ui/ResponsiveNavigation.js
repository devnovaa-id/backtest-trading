'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { 
  Menu, 
  X, 
  BarChart3, 
  BookOpen, 
  Settings, 
  HelpCircle,
  LogOut,
  Crown,
  Sparkles,
  Home,
  TrendingUp,
  Bot,
  Shield,
  Bell,
  Search
} from 'lucide-react'

export default function ResponsiveNavigation() {
  const { user, isLoaded } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requireAuth: true },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ]

  const userRole = user?.publicMetadata?.role || 'user'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                  ForexBot Pro
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">
                  AI Trading Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              if (item.requireAuth && !user) return null
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50/80 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="font-medium relative z-10">{item.name}</span>
                </Link>
              )
            })}

            {/* User Actions */}
            {isLoaded && (
              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                {user ? (
                  <>
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Upgrade Button for Free Users */}
                    {userRole === 'user' && (
                      <Link
                        href="/dashboard/upgrade"
                        className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-semibold"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade</span>
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </Link>
                    )}

                    {/* User Button */}
                    <div className="relative">
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: 'w-10 h-10 border-2 border-blue-200 hover:border-blue-400 transition-colors',
                            userButtonPopoverCard: 'shadow-2xl border border-gray-200',
                          },
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-gray-700 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50/80 transition-all duration-200">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Get Started</span>
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {user && (
              <div className="relative">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                    },
                  }}
                />
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                if (item.requireAuth && !user) return null
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Mobile User Actions */}
            {isLoaded && (
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {user.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {user.fullName || 'User'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userRole === 'premium' ? 'bg-purple-100 text-purple-700' :
                            userRole === 'admin' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {userRole === 'premium' ? 'Premium' : userRole === 'admin' ? 'Admin' : 'Free'}
                          </span>
                          {userRole === 'premium' && <Crown className="w-4 h-4 text-purple-600" />}
                        </div>
                      </div>
                    </div>
                    
                    {/* Upgrade Button for Free Users */}
                    {userRole === 'user' && (
                      <Link
                        href="/dashboard/upgrade"
                        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg text-center font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Crown className="w-5 h-5" />
                          <span>Upgrade to Premium</span>
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </Link>
                    )}
                    
                    {/* Settings Link */}
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <SignInButton mode="modal">
                      <button
                        className="block w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 text-center font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button
                        className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-center font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Get Started Free</span>
                        </div>
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}