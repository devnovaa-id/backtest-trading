'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  History, 
  Bot,
  Zap,
  Shield,
  Crown,
  BookOpen,
  Users,
  CreditCard,
  LogOut
} from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Ringkasan performa trading'
  },
  {
    name: 'Backtest',
    href: '/dashboard/backtest',
    icon: TrendingUp,
    description: 'Uji strategi dengan data historis'
  },
  {
    name: 'Trading Bot',
    href: '/dashboard/bot',
    icon: Bot,
    description: 'Kelola bot trading otomatis'
  },
  {
    name: 'Strategi',
    href: '/dashboard/strategies',
    icon: Zap,
    description: 'Strategi scalping profesional',
    isPremium: true
  },
  {
    name: 'Riwayat Trading',
    href: '/dashboard/history',
    icon: History,
    description: 'Log semua aktivitas trading'
  },
  {
    name: 'Analisis',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Analisis mendalam performa'
  }
]

const bottomNavigation = [
  {
    name: 'Upgrade Premium',
    href: '/dashboard/upgrade',
    icon: Crown,
    description: 'Akses fitur premium',
    isUpgrade: true
  },
  {
    name: 'Dokumentasi',
    href: '/dashboard/docs',
    icon: BookOpen,
    description: 'Panduan lengkap platform'
  },
  {
    name: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Konfigurasi akun dan preferensi'
  }
]

function NavItem({ item, isActive }) {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role || 'user'
  
  // Check if user has access to premium features
  const hasAccess = !item.isPremium || userRole === 'premium' || userRole === 'admin'

  return (
    <Link
      href={hasAccess ? item.href : '/dashboard/upgrade'}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
          : hasAccess
          ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          : 'text-gray-400 hover:bg-gray-50'
      } ${item.isUpgrade ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : ''}`}
    >
      <item.icon
        className={`mr-3 h-5 w-5 ${
          isActive ? 'text-blue-700' : hasAccess ? 'text-gray-500 group-hover:text-gray-700' : 'text-gray-300'
        } ${item.isUpgrade ? 'text-white' : ''}`}
      />
      <div className="flex-1">
        <div className="flex items-center">
          {item.name}
          {item.isPremium && userRole !== 'premium' && userRole !== 'admin' && (
            <Crown className="ml-2 h-3 w-3 text-yellow-500" />
          )}
        </div>
        <p className={`text-xs mt-0.5 ${
          isActive ? 'text-blue-600' : hasAccess ? 'text-gray-500' : 'text-gray-300'
        } ${item.isUpgrade ? 'text-blue-100' : ''}`}>
          {item.description}
        </p>
      </div>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75" />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static lg:inset-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">ForexBot Pro</span>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user?.publicMetadata?.role === 'premium' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.publicMetadata?.role === 'premium' ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      'Free'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-3 py-4 border-t border-gray-200 space-y-1">
            {bottomNavigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* Stats Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">Status Hari Ini</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">+2.4%</div>
                <div className="text-xs text-gray-500">Profit</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">12</div>
                <div className="text-xs text-gray-500">Trades</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}