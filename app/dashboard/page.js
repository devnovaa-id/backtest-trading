'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Settings, 
  CreditCard, 
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Calendar,
  PlayCircle,
  PauseCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  Bookmark,
  Share2,
  Download,
  Filter,
  Search
} from 'lucide-react'

function WelcomeSection({ user }) {
  const userRole = user?.publicMetadata?.role || 'user'
  const isNewUser = new Date(user?.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Selamat datang kembali, {user?.firstName || 'Trader'}! 👋
          </h1>
          <p className="text-blue-100 mb-4">
            {isNewUser 
              ? 'Mulai perjalanan trading Anda dengan strategi terbaik kami'
              : 'Lanjutkan perjalanan trading sukses Anda'
            }
          </p>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'premium' 
                ? 'bg-yellow-500 text-yellow-900' 
                : userRole === 'admin'
                ? 'bg-red-500 text-white'
                : 'bg-gray-500 text-white'
            }`}>
              {userRole === 'premium' ? 'Premium' : userRole === 'admin' ? 'Admin' : 'Free'}
            </span>
            <span className="text-blue-100 text-sm">
              Bergabung sejak {new Date(user?.createdAt).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
      
      {userRole === 'user' && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <p className="text-sm mb-2">🚀 Upgrade ke Premium untuk akses fitur lengkap!</p>
          <Link 
            href="/dashboard/upgrade" 
            className="inline-flex items-center text-sm bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Upgrade Sekarang
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  )
}

function QuickStats() {
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    activeStrategies: 0
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-500 text-sm font-medium">+12%</span>
          <span className="text-gray-500 text-sm ml-1">dari bulan lalu</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.winRate}%</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Award className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-500 text-sm font-medium">+5%</span>
          <span className="text-gray-500 text-sm ml-1">dari minggu lalu</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-gray-900">$1,234</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-500 text-sm font-medium">+18%</span>
          <span className="text-gray-500 text-sm ml-1">dari bulan lalu</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Strategies</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeStrategies}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Activity className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-gray-500 text-sm">2 running, 1 paused</span>
        </div>
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link 
          href="/dashboard/backtest"
          className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <PlayCircle className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-blue-600 font-medium">New Backtest</span>
        </Link>
        <Link 
          href="/dashboard/strategies"
          className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Zap className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-600 font-medium">Strategies</span>
        </Link>
        <Link 
          href="/dashboard/analytics"
          className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
          <span className="text-purple-600 font-medium">Analytics</span>
        </Link>
        <Link 
          href="/dashboard/settings"
          className="flex items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <Settings className="w-5 h-5 text-orange-600 mr-2" />
          <span className="text-orange-600 font-medium">Settings</span>
        </Link>
      </div>
    </div>
  )
}

function RecentTrades() {
  const sampleTrades = [
    { id: 1, pair: 'EUR/USD', type: 'Buy', entry: 1.0850, exit: 1.0890, profit: 40, date: '2024-01-15' },
    { id: 2, pair: 'GBP/USD', type: 'Sell', entry: 1.2750, exit: 1.2720, profit: 30, date: '2024-01-14' },
    { id: 3, pair: 'USD/JPY', type: 'Buy', entry: 148.50, exit: 148.20, profit: -30, date: '2024-01-14' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trades</h3>
          <Link href="/dashboard/trades" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sampleTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trade.pair}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    trade.type === 'Buy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trade.entry}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trade.exit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${
                    trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.profit > 0 ? '+' : ''}{trade.profit} pips
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(trade.date).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActiveStrategies() {
  const strategies = [
    { id: 1, name: 'Scalping MA Cross', status: 'running', profit: '+125 USD', trades: 24 },
    { id: 2, name: 'Breakout Pro', status: 'paused', profit: '+89 USD', trades: 18 },
    { id: 3, name: 'Trend Following', status: 'running', profit: '+201 USD', trades: 35 },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Active Strategies</h3>
          <Link href="/dashboard/strategies" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Manage All
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  strategy.status === 'running' 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  {strategy.status === 'running' ? (
                    <PlayCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <PauseCircle className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                  <p className="text-sm text-gray-500">{strategy.trades} trades</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">{strategy.profit}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className={
                    strategy.status === 'running' 
                      ? 'text-yellow-600 hover:text-yellow-700' 
                      : 'text-green-600 hover:text-green-700'
                  }>
                    {strategy.status === 'running' ? (
                      <PauseCircle className="w-4 h-4" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection user={user} />
        <QuickStats />
        <QuickActions />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentTrades />
          <ActiveStrategies />
        </div>
      </div>
    </div>
  )
}