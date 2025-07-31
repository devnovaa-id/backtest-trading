'use client'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings,
  LogOut,
  Bell,
  Search,
  Shield,
  BarChart3,
  Bot,
  Crown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

function AdminSidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', description: 'Overview & analytics' },
    { icon: Users, label: 'Users', href: '/admin/users', description: 'Manage users & roles' },
    { icon: FileText, label: 'Blog', href: '/admin/blog', description: 'Content management' },
    { icon: MessageSquare, label: 'Comments', href: '/admin/comments', description: 'Moderate comments' },
    { icon: Settings, label: 'Settings', href: '/admin/settings', description: 'System configuration' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative p-8 border-b border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Admin Panel</h2>
                  <p className="text-blue-200 text-sm font-medium">ForexBot Pro</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-200 text-sm font-semibold">Administrator Access</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-6 py-8">
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 border border-transparent hover:border-blue-500/30"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 rounded-lg transition-all duration-300"></div>
                      <Icon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">{item.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                )
              })}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-700/50">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">System Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-300">
                  <span className="text-green-400">●</span> Server: Online
                </div>
                <div className="text-gray-300">
                  <span className="text-green-400">●</span> DB: Healthy
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-400">●</span> API: 99.9%
                </div>
                <div className="text-gray-300">
                  <span className="text-green-400">●</span> Bots: Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AdminHeader({ setSidebarOpen }) {
  const { user } = useUser()
  
  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search */}
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search users, content, settings..."
              className="pl-12 pr-6 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none w-80 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 px-6 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">1,247</div>
              <div className="text-xs text-gray-600">Users</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">$52.4K</div>
              <div className="text-xs text-gray-600">Revenue</div>
            </div>
          </div>
          
          {/* Notifications */}
          <button className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors group">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </span>
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{user?.fullName || 'Admin'}</p>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-red-500" />
                <p className="text-xs text-red-600 font-medium">Super Admin</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">
                {user?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
          <p className="text-white mt-4 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Check if user is admin
  const userRole = user?.publicMetadata?.role
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}