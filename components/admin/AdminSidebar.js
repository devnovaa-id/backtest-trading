'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  Shield,
  TrendingUp,
  MessageSquare,
  Database,
  Activity,
  DollarSign,
  UserCheck,
  Zap,
  BookOpen,
  Globe,
  AlertTriangle
} from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Overview dan statistik platform'
  },
  {
    name: 'Manajemen User',
    href: '/admin/users',
    icon: Users,
    description: 'Kelola pengguna dan role'
  },
  {
    name: 'Order & Pembayaran',
    href: '/admin/orders',
    icon: CreditCard,
    description: 'Proses pembayaran dan langganan'
  },
  {
    name: 'Blog & Konten',
    href: '/admin/blog',
    icon: FileText,
    description: 'Kelola artikel dan konten'
  },
  {
    name: 'Trading Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Analisis performa trading'
  },
  {
    name: 'Backtest Monitor',
    href: '/admin/backtests',
    icon: Activity,
    description: 'Monitor aktivitas backtest'
  },
  {
    name: 'System Health',
    href: '/admin/system',
    icon: Database,
    description: 'Status sistem dan API'
  }
]

const bottomNavigation = [
  {
    name: 'Support Center',
    href: '/admin/support',
    icon: MessageSquare,
    description: 'Kelola tiket support'
  },
  {
    name: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
    description: 'Konfigurasi platform'
  }
]

function NavItem({ item, isActive }) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <item.icon
        className={`mr-3 h-5 w-5 ${
          isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
        }`}
      />
      <div className="flex-1">
        <div>{item.name}</div>
        <p className={`text-xs mt-0.5 ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        }`}>
          {item.description}
        </p>
      </div>
    </Link>
  )
}

export default function AdminSidebar() {
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
          <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <Shield className="h-8 w-8 text-white" />
            <div className="ml-2">
              <div className="text-lg font-bold text-white">Admin Panel</div>
              <div className="text-xs text-blue-100">ForexBot Pro</div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Mode Administrator Aktif
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">Status Platform</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">99.9%</div>
                <div className="text-xs text-gray-500">Uptime</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">1,247</div>
                <div className="text-xs text-gray-500">Users</div>
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

          {/* System Status */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">Status Sistem</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Database</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Polygon API</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Clerk Auth</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}