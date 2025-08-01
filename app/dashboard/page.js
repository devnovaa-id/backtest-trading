'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import dynamic from 'next/dynamic'
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
  Search,
  Sparkles,
  Crown,
  Bot,
  Shield,
  Target,
  Clock,
  TrendingDown,
  Bell,
  MoreVertical,
  RefreshCcw,
  ChevronRight,
  CandlestickChart,
  LineChart,
  BarChart,
  ArrowRight,
  ArrowLeft,
  Fullscreen,
  ChevronDown,
  Home,
  Wallet,
  PieChart,
  ClipboardList,
  Gauge,
  LayoutGrid,
  AlignJustify
} from 'lucide-react'

// RealTimeChart component
const RealTimeChart = dynamic(() => import('./RealTimeChart'), { 
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8 h-80 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  )
})

function WelcomeSection({ user }) {
  const userRole = user?.publicMetadata?.role || 'user'
  const isNewUser = new Date(user?.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-8 shadow-2xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  Welcome back, {user?.firstName || 'Trader'}!
                </h1>
                <p className="text-blue-100 text-lg">
                  {isNewUser 
                    ? '🚀 Start your automated trading journey with our AI-powered strategies'
                    : '📈 Continue building your trading empire with confidence'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold ${
                userRole === 'premium' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                  : userRole === 'admin'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
              }`}>
                {userRole === 'premium' && <Crown className="w-4 h-4" />}
                {userRole === 'admin' && <Shield className="w-4 h-4" />}
                <span>{userRole === 'premium' ? 'Premium Member' : userRole === 'admin' ? 'Admin Access' : 'Free Account'}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-blue-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            {userRole === 'user' && (
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">🎯 Unlock Premium Features</p>
                  <p className="text-blue-100 text-sm">Get advanced analytics, unlimited strategies, and priority support</p>
                </div>
                <Link 
                  href="/dashboard/upgrade" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
          
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-300/20 rounded-full blur-xl"></div>
    </div>
  )
}

function QuickStats() {
  const [stats, setStats] = useState({
    totalTrades: 247,
    winRate: 87.3,
    totalProfit: 12540,
    activeStrategies: 5
  })

  const statCards = [
    {
      title: 'Total Trades',
      value: stats.totalTrades.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: Award,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Total Profit',
      value: `$${stats.totalProfit.toLocaleString()}`,
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Active Strategies',
      value: stats.activeStrategies,
      change: '3 running',
      changeType: 'neutral',
      icon: Activity,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className={`relative group bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-gray-900 mb-3">{stat.value}</p>
              
              <div className="flex items-center">
                {stat.changeType === 'positive' && <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />}
                {stat.changeType === 'negative' && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
                <span className={`text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                {stat.changeType !== 'neutral' && (
                  <span className="text-gray-500 text-sm ml-1">vs last month</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function QuickActions() {
  const actions = [
    {
      title: 'New Backtest',
      subtitle: 'Test strategies',
      href: '/dashboard/backtest',
      icon: PlayCircle,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'View Strategies',
      subtitle: 'Manage bots',
      href: '/dashboard/strategies',
      icon: Zap,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Analytics',
      subtitle: 'Performance data',
      href: '/dashboard/analytics',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Settings',
      subtitle: 'Configure account',
      href: '/dashboard/settings',
      icon: Settings,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    }
  ]

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
          <p className="text-gray-600">Frequently used features at your fingertips</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={index}
            href={action.href}
            className={`group relative bg-gradient-to-br ${action.bgGradient} p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{action.title}</h4>
              <p className="text-gray-600 text-sm">{action.subtitle}</p>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200 absolute top-6 right-6" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RecentTrades() {
  const sampleTrades = [
    { id: 1, pair: 'EUR/USD', type: 'Buy', entry: 1.0850, exit: 1.0890, profit: 40, date: '2024-01-15', status: 'completed' },
    { id: 2, pair: 'GBP/USD', type: 'Sell', entry: 1.2750, exit: 1.2720, profit: 30, date: '2024-01-14', status: 'completed' },
    { id: 3, pair: 'USD/JPY', type: 'Buy', entry: 148.50, exit: 148.20, profit: -30, date: '2024-01-14', status: 'completed' },
    { id: 4, pair: 'AUD/USD', type: 'Buy', entry: 0.6650, exit: 0.6680, profit: 25, date: '2024-01-13', status: 'completed' },
  ]

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Trades</h3>
            <p className="text-gray-600">Your latest trading activity</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
            <Link 
              href="/dashboard/trades" 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Currency Pair</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Entry Price</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Exit Price</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">P&L</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sampleTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">{trade.pair.split('/')[0]}</span>
                    </div>
                    <span className="font-bold text-gray-900">{trade.pair}</span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                    trade.type === 'Buy' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                      : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                  }`}>
                    {trade.type === 'Buy' ? '↗' : '↘'} {trade.type}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{trade.entry}</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{trade.exit}</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-lg ${
                      trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.profit > 0 ? '+' : ''}{trade.profit}
                    </span>
                    <span className="text-gray-500 text-sm">pips</span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="text-gray-600 font-medium">
                    {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
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
    { id: 1, name: 'AI Scalping Pro', status: 'running', profit: '+$1,250', trades: 24, winRate: 89, icon: Bot },
    { id: 2, name: 'Breakout Hunter', status: 'paused', profit: '+$890', trades: 18, winRate: 72, icon: Target },
    { id: 3, name: 'Trend Master', status: 'running', profit: '+$2,010', trades: 35, winRate: 94, icon: TrendingUp },
    { id: 4, name: 'Risk Guardian', status: 'running', profit: '+$567', trades: 12, winRate: 83, icon: Shield },
  ]

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Active Strategies</h3>
            <p className="text-gray-600">Your automated trading bots</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <Link 
              href="/dashboard/strategies" 
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
            >
              <span>Manage All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="group relative bg-gradient-to-r from-gray-50 to-blue-50/50 hover:from-blue-50 hover:to-purple-50 rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl shadow-lg ${
                    strategy.status === 'running' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    <strategy.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{strategy.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{strategy.trades} trades</span>
                      <span>•</span>
                      <span>{strategy.winRate}% win rate</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        strategy.status === 'running' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {strategy.status === 'running' ? '🟢 Active' : '⏸ Paused'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-bold text-xl text-green-600">{strategy.profit}</p>
                    <p className="text-gray-500 text-sm">Total P&L</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${
                      strategy.status === 'running' 
                        ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    }`}>
                      {strategy.status === 'running' ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MarketInstruments({ onSymbolChange, activeSymbol }) {
  const instruments = [
    { symbol: 'EUR/USD', name: 'Euro/Dollar', change: '+0.24%' },
    { symbol: 'GBP/USD', name: 'Pound/Dollar', change: '-0.12%' },
    { symbol: 'USD/JPY', name: 'Dollar/Yen', change: '+0.18%' },
    { symbol: 'BTC/USD', name: 'Bitcoin', change: '+2.35%' },
    { symbol: 'ETH/USD', name: 'Ethereum', change: '+1.87%' },
    { symbol: 'TSLA', name: 'Tesla Inc', change: '-0.56%' },
  ]

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Market Instruments</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search instruments..."
            className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {instruments.map((instrument, index) => (
          <div 
            key={index}
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              activeSymbol === instrument.symbol
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
            onClick={() => onSymbolChange(instrument.symbol)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">{instrument.symbol}</h4>
                <p className="text-xs text-gray-500 mt-1">{instrument.name}</p>
              </div>
              <span className={`text-xs font-semibold ${
                instrument.change.startsWith('+') 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {instrument.change}
              </span>
            </div>
            <div className="mt-3 h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderPanel() {
  const [orderType, setOrderType] = useState('market')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const [isBuy, setIsBuy] = useState(true)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Place Order</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button 
          className={`py-3 rounded-lg font-medium ${
            isBuy 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setIsBuy(true)}
        >
          Buy
        </button>
        <button 
          className={`py-3 rounded-lg font-medium ${
            !isBuy 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setIsBuy(false)}
        >
          Sell
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            className={`py-2 rounded-lg text-sm font-medium ${
              orderType === 'market' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setOrderType('market')}
          >
            Market
          </button>
          <button 
            className={`py-2 rounded-lg text-sm font-medium ${
              orderType === 'limit' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setOrderType('limit')}
          >
            Limit
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <div className="relative">
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full pl-3 pr-10 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <button 
              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <button 
              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {orderType === 'limit' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Limit Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Estimated Cost</span>
          <span className="font-semibold">${(quantity * 150).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Commission</span>
          <span className="font-semibold">$1.50</span>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md">
        {isBuy ? 'Place Buy Order' : 'Place Sell Order'}
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('trading')
  const [symbol, setSymbol] = useState('EURUSD') // Changed to match RealTimeChart format
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20 flex">
      <Sidebar />
      {/* Sidebar */}
      <div className={`fixed lg:relative z-30 w-64 bg-white shadow-xl lg:shadow-none h-full transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Trading AI</h2>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', icon: Home, href: '#', active: activeTab === 'dashboard' },
              { name: 'Trading', icon: LayoutGrid, href: '#', active: activeTab === 'trading' },
              { name: 'Strategies', icon: Zap, href: '#', active: activeTab === 'strategies' },
              { name: 'Portfolio', icon: Wallet, href: '#', active: activeTab === 'portfolio' },
              { name: 'Analytics', icon: PieChart, href: '#', active: activeTab === 'analytics' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(item.name.toLowerCase())}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account
            </h3>
            <nav className="space-y-1">
              {[
                { name: 'Settings', icon: Settings, href: '#' },
                { name: 'Billing', icon: CreditCard, href: '#' },
                { name: 'Help Center', icon: Shield, href: '#' },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-20 p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <AlignJustify className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold">Trading Dashboard</h1>
          </div>
          <button className="text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WelcomeSection user={user} />
          
          {activeTab === 'trading' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* RealTimeChart with symbol selector */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Market Charts</h3>
                      <p className="text-gray-600">Real-time price movements and technical analysis</p>
                    </div>
                    <div className="flex space-x-3">
                      <div className="bg-gray-100 rounded-xl p-1 flex">
                        {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'].map((sym) => (
                          <button
                            key={sym}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              symbol === sym 
                                ? 'bg-white shadow text-blue-600' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                            onClick={() => setSymbol(sym)}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <RealTimeChart symbol={symbol} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <OrderPanel />
                  <MarketInstruments 
                    onSymbolChange={(sym) => setSymbol(sym.replace('/', ''))} // Remove slash for RealTimeChart
                    activeSymbol={symbol} 
                  />
                </div>
              </div>
              
              <div className="space-y-8">
                <QuickStats />
                <QuickActions />
              </div>
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              <QuickStats />
              <QuickActions />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <RecentTrades />
                <ActiveStrategies />
              </div>
            </>
          ) : activeTab === 'strategies' ? (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Trading Strategies</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    name: 'Scalping M1', 
                    description: 'High-frequency trades on 1-minute charts',
                    risk: 'High',
                    profit: 'Very High',
                    winRate: '68%',
                    timeframe: 'M1'
                  },
                  { 
                    name: 'Swing M15', 
                    description: 'Medium-term trades on 15-minute charts',
                    risk: 'Medium',
                    profit: 'High',
                    winRate: '75%',
                    timeframe: 'M15'
                  },
                  { 
                    name: 'Breakout M5', 
                    description: 'Captures price breakouts on 5-minute charts',
                    risk: 'Medium',
                    profit: 'High',
                    winRate: '72%',
                    timeframe: 'M5'
                  },
                ].map((strategy, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-gray-900">{strategy.name}</h4>
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {strategy.timeframe}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{strategy.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Risk</p>
                        <p className="font-semibold">{strategy.risk}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Profit</p>
                        <p className="font-semibold">{strategy.profit}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                        <p className="font-semibold">{strategy.winRate}</p>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                      Activate Strategy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'portfolio' ? (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Portfolio</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Total Value</h4>
                    <DollarSign className="text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900 mb-2">$24,568.23</p>
                    <p className="flex items-center justify-center text-green-600">
                      <ArrowUpRight className="mr-1" />
                      +$1,245.50 (5.3%) today
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Open Positions</h4>
                    <Activity className="text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">EUR/USD</span>
                        <span className="font-semibold text-green-600">+$245.50</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">TSLA</span>
                        <span className="font-semibold text-red-600">-$85.30</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">BTC/USD</span>
                        <span className="font-semibold text-green-600">+$1,085.30</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Risk Exposure</h4>
                    <Shield className="text-purple-500" />
                  </div>
                  <div className="text-center">
                    <div className="inline-block relative">
                      <div className="w-32 h-32 rounded-full border-8 border-purple-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">24%</span>
                      </div>
                      <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-purple-500 border-r-purple-500 animate-spin-slow"></div>
                    </div>
                    <p className="text-gray-600 mt-4">Low risk exposure</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Profitability</h4>
                    <BarChart3 className="text-blue-500" />
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border-8 border-blue-200 border-t-blue-500 border-r-blue-500 animate-spin-slow"></div>
                  </div>
                  <p className="text-center text-gray-600 mt-4">72% win rate over last 30 days</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Risk Analysis</h4>
                    <Shield className="text-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Max Drawdown</span>
                        <span className="font-semibold">-8.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '8.2%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Risk/Reward Ratio</span>
                        <span className="font-semibold">1:2.3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Sharpe Ratio</span>
                        <span className="font-semibold">1.8</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Asset Allocation</h4>
                    <PieChart className="text-purple-500" />
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                      <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-purple-500" style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%, 50% 100%)' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                      <span className="text-xs">Forex</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs">Crypto</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                      <span className="text-xs">Stocks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}