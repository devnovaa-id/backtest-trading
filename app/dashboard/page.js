'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  Zap,
  Clock,
  Target,
  Award,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

// Mock data - in real app this would come from API
const equityData = [
  { date: '2024-01-01', balance: 10000 },
  { date: '2024-01-02', balance: 10150 },
  { date: '2024-01-03', balance: 10080 },
  { date: '2024-01-04', balance: 10320 },
  { date: '2024-01-05', balance: 10290 },
  { date: '2024-01-06', balance: 10450 },
  { date: '2024-01-07', balance: 10380 },
  { date: '2024-01-08', balance: 10520 },
  { date: '2024-01-09', balance: 10680 },
  { date: '2024-01-10', balance: 10750 }
]

const strategyPerformance = [
  { name: 'RSI Extremes', value: 35, color: '#3B82F6' },
  { name: 'Heikin-Ashi Pullback', value: 25, color: '#10B981' },
  { name: 'Stochastic Signal', value: 20, color: '#F59E0B' },
  { name: 'Bollinger RSI ADX', value: 20, color: '#EF4444' }
]

const recentTrades = [
  {
    id: 1,
    pair: 'EUR/USD',
    type: 'BUY',
    entry: 1.0845,
    exit: 1.0867,
    pips: 22,
    profit: 220,
    time: '10:30',
    strategy: 'RSI Extremes'
  },
  {
    id: 2,
    pair: 'GBP/USD',
    type: 'SELL',
    entry: 1.2634,
    exit: 1.2615,
    pips: 19,
    profit: 190,
    time: '09:45',
    strategy: 'Bollinger RSI ADX'
  },
  {
    id: 3,
    pair: 'USD/JPY',
    type: 'BUY',
    entry: 149.85,
    exit: 149.62,
    pips: -23,
    profit: -230,
    time: '08:20',
    strategy: 'Stochastic Signal'
  }
]

function StatCard({ title, value, change, changePercent, icon: Icon, trend }) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change} ({isPositive ? '+' : ''}{changePercent}%)
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
          <Icon className={`h-6 w-6 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
    </div>
  )
}

function TradeRow({ trade }) {
  const isProfit = trade.profit > 0

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">{trade.pair}</span>
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trade.type}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {trade.entry} → {trade.exit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
          {trade.pips > 0 ? '+' : ''}{trade.pips} pips
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
          ${trade.profit > 0 ? '+' : ''}{trade.profit}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.time}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.strategy}
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Trading</h1>
            <p className="text-blue-100 mt-1">
              Pantau performa trading bot Anda secara real-time
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">$12,450</div>
            <div className="text-blue-100">Total Balance</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Profit"
          value="$2,450"
          change={245}
          changePercent={5.2}
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Win Rate"
          value="78.5%"
          change={2.3}
          changePercent={3.0}
          icon={Target}
          trend="up"
        />
        <StatCard
          title="Total Trades"
          value="156"
          change={12}
          changePercent={8.3}
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Active Bots"
          value="3"
          change={0}
          changePercent={0}
          icon={Zap}
          trend="neutral"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Equity Curve</h3>
            <div className="flex space-x-2">
              {['1d', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === range
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performa Strategi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={strategyPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {strategyPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {strategyPerformance.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: strategy.color }}
                  />
                  <span className="text-sm text-gray-600">{strategy.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{strategy.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trading Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry → Exit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTrades.map((trade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Lihat Semua Trading →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">Mulai Backtest</h4>
              <p className="text-sm text-gray-500">Uji strategi dengan data historis</p>
            </div>
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Buat Backtest Baru
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">Aktifkan Bot</h4>
              <p className="text-sm text-gray-500">Mulai trading otomatis</p>
            </div>
          </div>
          <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Setup Trading Bot
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">Upgrade Premium</h4>
              <p className="text-sm text-gray-500">Akses strategi advanced</p>
            </div>
          </div>
          <button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
            Upgrade Sekarang
          </button>
        </div>
      </div>

      {/* Market Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Market</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">EUR/USD</div>
              <div className="text-lg font-bold text-gray-900">1.0845</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">+0.11%</div>
              <div className="text-xs text-gray-500">+0.0012</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">GBP/USD</div>
              <div className="text-lg font-bold text-gray-900">1.2634</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-red-600">-0.17%</div>
              <div className="text-xs text-gray-500">-0.0021</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">USD/JPY</div>
              <div className="text-lg font-bold text-gray-900">149.85</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">+0.30%</div>
              <div className="text-xs text-gray-500">+0.45</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">AUD/USD</div>
              <div className="text-lg font-bold text-gray-900">0.6523</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">+0.12%</div>
              <div className="text-xs text-gray-500">+0.0008</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}