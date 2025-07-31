'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Menu, Wifi, WifiOff, TrendingUp, TrendingDown } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function Header() {
  const { user } = useUser()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [marketStatus, setMarketStatus] = useState('open') // open, closed, pre-market
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Backtest Selesai',
      message: 'RSI Extremes strategy menyelesaikan backtest dengan win rate 82%',
      time: '5 menit lalu',
      type: 'success'
    },
    {
      id: 2,
      title: 'Signal Trading',
      message: 'EUR/USD menunjukkan sinyal BUY dengan confidence 85%',
      time: '10 menit lalu',
      type: 'info'
    }
  ])

  // Market data mock - in real app this would come from API
  const [marketData, setMarketData] = useState([
    { pair: 'EUR/USD', price: 1.0845, change: +0.0012, changePercent: +0.11 },
    { pair: 'GBP/USD', price: 1.2634, change: -0.0021, changePercent: -0.17 },
    { pair: 'USD/JPY', price: 149.85, change: +0.45, changePercent: +0.30 },
    { pair: 'AUD/USD', price: 0.6523, change: +0.0008, changePercent: +0.12 }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Check market status based on current time
    const now = new Date()
    const hour = now.getUTCHours()
    
    // Forex market is open 24/5, closed on weekends
    const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6
    if (isWeekend) {
      setMarketStatus('closed')
    } else {
      setMarketStatus('open')
    }
  }, [currentTime])

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </button>

            {/* Page Title */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Selamat datang kembali, {user?.firstName || 'Trader'}
              </p>
            </div>
          </div>

          {/* Center Section - Market Ticker */}
          <div className="hidden md:flex items-center space-x-6 bg-gray-50 rounded-lg px-4 py-2">
            {marketData.slice(0, 3).map((item) => (
              <div key={item.pair} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{item.pair}</span>
                <span className="text-sm font-mono text-gray-900">{item.price}</span>
                <span className={`flex items-center text-xs font-medium ${
                  item.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                </span>
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Market Status */}
            <div className="flex items-center space-x-2">
              {marketStatus === 'open' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${
                marketStatus === 'open' ? 'text-green-600' : 'text-red-600'
              }`}>
                {marketStatus === 'open' ? 'Market Buka' : 'Market Tutup'}
              </span>
            </div>

            {/* Search */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pair, strategi..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* Time & Date */}
            <div className="hidden lg:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Market Ticker */}
        <div className="md:hidden mt-4 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {marketData.map((item) => (
              <div key={item.pair} className="flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-xs font-medium text-gray-700">{item.pair}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm font-mono text-gray-900">{item.price}</span>
                  <span className={`text-xs font-medium ${
                    item.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Saldo:</span>
              <span className="font-semibold text-gray-900">$12,450.00</span>
              <span className="text-green-600 font-medium">+5.2%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Equity:</span>
              <span className="font-semibold text-gray-900">$12,890.00</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Margin:</span>
              <span className="font-semibold text-gray-900">$2,340.00</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Win Rate:</span>
              <span className="font-semibold text-green-600">78.5%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Active Trades:</span>
              <span className="font-semibold text-blue-600">3</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}