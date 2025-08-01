// app/dashboard/backtest.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  CandlestickChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Gauge,
  Wallet,
  BarChart,
  TrendingUp,
  TrendingDown,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  Lock,
  Zap
} from 'lucide-react'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

// API Key Polygon.io - Ganti dengan API key Anda
const POLYGON_API_KEY = "E3DE0rZ6jci1CfulOXOWkoaWqqxIjXlq"

export default function BacktestDashboard() {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role || 'user'
  const isPremium = userRole === 'premium' || userRole === 'admin'
  
  // State untuk data trading
  const [balance, setBalance] = useState(10000)
  const [equity, setEquity] = useState(10000)
  const [profit, setProfit] = useState(0)
  const [trades, setTrades] = useState([])
  const [positions, setPositions] = useState([])
  const [tradeStats, setTradeStats] = useState({
    totalTrades: 0,
    winRate: 0,
    profitFactor: 0,
    maxDrawdown: 0
  })
  
  // State untuk pengaturan bot
  const [botSettings, setBotSettings] = useState({
    symbol: 'EURUSD',
    timeframe: 'M15',
    strategy: 'SMA Crossover',
    riskPerTrade: 1,
    stopLoss: 20,
    takeProfit: 40,
    useTrailingStop: true,
    trailingStopDistance: 10,
    lotSize: 0.1,
    isRunning: false
  })
  
  // State untuk data chart
  const [chartData, setChartData] = useState({
    prices: [],
    smaFast: [],
    smaSlow: [],
    signals: []
  })
  
  // State untuk simulasi
  const [simulationStatus, setSimulationStatus] = useState('stopped')
  const [currentTime, setCurrentTime] = useState('')
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Referensi untuk chart dan simulasi
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const simulationRef = useRef(null)
  
  // Format tanggal untuk API Polygon (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]
  }
  
  // Ambil data historis dari Polygon.io
  const fetchHistoricalData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const multiplier = botSettings.timeframe === 'M1' ? 1 : 
                        botSettings.timeframe === 'M5' ? 5 : 15
      const timespan = 'minute'
      const fromDate = formatDateForAPI(startDate)
      const toDate = formatDateForAPI(endDate)
      
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/C:${botSettings.symbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${POLYGON_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error('No market data available')
      }
      
      // Proses data untuk chart
      const prices = data.results.map(bar => ({
        time: new Date(bar.t).toISOString(),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c
      }))
      
      // Hitung SMA (Simple Moving Average)
      const smaFast = calculateSMA(prices, 5)
      const smaSlow = calculateSMA(prices, 20)
      
      // Generate sinyal trading
      const signals = generateSignals(prices, smaFast, smaSlow)
      
      setChartData({ prices, smaFast, smaSlow, signals })
      setCurrentTime(prices[0]?.time || '')
      
      return { prices, smaFast, smaSlow, signals }
    } catch (error) {
      console.error('Error fetching historical data:', error)
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Hitung Simple Moving Average
  const calculateSMA = (data, period) => {
    return data.map((price, index) => {
      if (index < period - 1) return null
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, item) => acc + item.close, 0)
      return sum / period
    })
  }
  
  // Generate sinyal trading berdasarkan SMA crossover
  const generateSignals = (prices, smaFast, smaSlow) => {
    return prices.map((price, index) => {
      if (index < 20 || !smaFast[index] || !smaSlow[index]) return null
      
      // Deteksi crossover
      const fastAboveSlow = smaFast[index] > smaSlow[index]
      const fastBelowSlow = smaFast[index] < smaSlow[index]
      const prevFastAboveSlow = smaFast[index - 1] > smaSlow[index - 1]
      const prevFastBelowSlow = smaFast[index - 1] < smaSlow[index - 1]
      
      if (fastAboveSlow && !prevFastAboveSlow) {
        return { type: 'buy', time: price.time, price: price.close }
      } else if (fastBelowSlow && !prevFastBelowSlow) {
        return { type: 'sell', time: price.time, price: price.close }
      }
      return null
    })
  }
  
  // Inisialisasi data
  useEffect(() => {
    const initData = async () => {
      try {
        await fetchHistoricalData()
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }
    
    initData()
  }, [botSettings.symbol, botSettings.timeframe, startDate, endDate])
  
  // Eksekusi trading
  const executeTrade = (signal, price, time) => {
    if (!isPremium) {
      alert('Premium feature required. Upgrade your account to access trading functionality.')
      return null
    }
    
    const tradeId = Date.now()
    const positionType = signal === 'buy' ? 'long' : 'short'
    const tradeAmount = botSettings.lotSize * 100000
    const riskAmount = (balance * botSettings.riskPerTrade) / 100
    
    // Hitung ukuran posisi berdasarkan risiko
    const positionSize = Math.min(tradeAmount, riskAmount * 100)
    
    // Buat posisi baru
    const newPosition = {
      id: tradeId,
      type: positionType,
      symbol: botSettings.symbol,
      entryPrice: price,
      entryTime: time,
      size: positionSize,
      stopLoss: positionType === 'long' 
        ? price - (botSettings.stopLoss / 10000) 
        : price + (botSettings.stopLoss / 10000),
      takeProfit: positionType === 'long' 
        ? price + (botSettings.takeProfit / 10000) 
        : price - (botSettings.takeProfit / 10000),
      currentPrice: price,
      profit: 0,
      isOpen: true
    }
    
    setPositions(prev => [...prev, newPosition])
    
    // Catat trade
    setTrades(prev => [...prev, {
      id: tradeId,
      type: positionType,
      symbol: botSettings.symbol,
      entryPrice: price,
      entryTime: time,
      size: positionSize
    }])
    
    return newPosition
  }
  
  // Tutup posisi
  const closePosition = (position, price, time, reason) => {
    // Hitung profit
    let profitAmount = 0
    if (position.type === 'long') {
      profitAmount = (price - position.entryPrice) * position.size
    } else {
      profitAmount = (position.entryPrice - price) * position.size
    }
    
    // Update balance dan equity
    const newBalance = balance + profitAmount
    const newEquity = equity + profitAmount
    setBalance(newBalance)
    setEquity(newEquity)
    setProfit(prev => prev + profitAmount)
    
    // Update trade dengan informasi keluar
    setTrades(prev => prev.map(trade => 
      trade.id === position.id 
        ? { ...trade, exitPrice: price, exitTime: time, profit: profitAmount, reason } 
        : trade
    ))
    
    // Hapus posisi
    setPositions(prev => prev.filter(p => p.id !== position.id))
    
    return profitAmount
  }
  
  // Update posisi terbuka
  const updateOpenPositions = (price, time) => {
    let totalProfit = 0
    
    const updatedPositions = positions.map(position => {
      // Hitung profit saat ini
      let currentProfit = 0
      if (position.type === 'long') {
        currentProfit = (price - position.entryPrice) * position.size
      } else {
        currentProfit = (position.entryPrice - price) * position.size
      }
      
      // Periksa apakah stop loss atau take profit terpicu
      let closeReason = null
      if (position.type === 'long') {
        if (price <= position.stopLoss) closeReason = 'stop-loss'
        if (price >= position.takeProfit) closeReason = 'take-profit'
      } else {
        if (price >= position.stopLoss) closeReason = 'stop-loss'
        if (price <= position.takeProfit) closeReason = 'take-profit'
      }
      
      // Update trailing stop jika diaktifkan
      let newStopLoss = position.stopLoss
      if (botSettings.useTrailingStop) {
        const trailingDistance = botSettings.trailingStopDistance / 10000
        
        if (position.type === 'long') {
          const newTrailingStop = price - trailingDistance
          if (newTrailingStop > position.stopLoss) {
            newStopLoss = newTrailingStop
          }
        } else {
          const newTrailingStop = price + trailingDistance
          if (newTrailingStop < position.stopLoss) {
            newStopLoss = newTrailingStop
          }
        }
      }
      
      return {
        ...position,
        currentPrice: price,
        profit: currentProfit,
        stopLoss: newStopLoss
      }
    })
    
    // Tutup posisi yang memenuhi kondisi
    const positionsToClose = updatedPositions.filter(p => {
      if (p.type === 'long') {
        return p.currentPrice <= p.stopLoss || p.currentPrice >= p.takeProfit
      } else {
        return p.currentPrice >= p.stopLoss || p.currentPrice <= p.takeProfit
      }
    })
    
    positionsToClose.forEach(position => {
      let reason = ''
      if (position.type === 'long') {
        reason = position.currentPrice <= position.stopLoss 
          ? 'stop-loss' 
          : 'take-profit'
      } else {
        reason = position.currentPrice >= position.stopLoss 
          ? 'stop-loss' 
          : 'take-profit'
      }
      
      const profit = closePosition(position, position.currentPrice, time, reason)
      totalProfit += profit
    })
    
    // Update posisi yang masih terbuka
    const stillOpenPositions = updatedPositions.filter(p => 
      !positionsToClose.some(closed => closed.id === p.id)
    )
    
    setPositions(stillOpenPositions)
    
    // Update equity dengan profit dari posisi terbuka
    const openProfit = stillOpenPositions.reduce((sum, p) => sum + p.profit, 0)
    setEquity(balance + openProfit)
    
    return totalProfit
  }
  
  // Hitung statistik trading
  const calculateTradeStats = () => {
    const closedTrades = trades.filter(t => t.exitPrice !== undefined)
    const winningTrades = closedTrades.filter(t => t.profit > 0)
    const losingTrades = closedTrades.filter(t => t.profit <= 0)
    
    const totalProfit = closedTrades.reduce((sum, t) => sum + t.profit, 0)
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0))
    
    const winRate = closedTrades.length > 0 
      ? (winningTrades.length / closedTrades.length) * 100 
      : 0
      
    const profitFactor = totalLoss > 0 
      ? totalProfit / totalLoss 
      : totalProfit > 0 ? 100 : 0
      
    // Hitung drawdown
    let maxEquity = 10000
    let maxDrawdown = 0
    let currentDrawdown = 0
    
    // Simulasi equity curve untuk mencari drawdown maksimal
    const equityPoints = [10000]
    closedTrades.forEach(trade => {
      const lastEquity = equityPoints[equityPoints.length - 1]
      equityPoints.push(lastEquity + trade.profit)
    })
    
    equityPoints.forEach(equity => {
      if (equity > maxEquity) {
        maxEquity = equity
      }
      
      currentDrawdown = ((maxEquity - equity) / maxEquity) * 100
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown
      }
    })
    
    setTradeStats({
      totalTrades: closedTrades.length,
      winRate,
      profitFactor,
      maxDrawdown
    })
  }
  
  // Mulai simulasi
  const startSimulation = async () => {
    if (simulationStatus === 'completed') {
      // Reset simulasi jika sudah selesai
      resetSimulation()
    }
    
    // Pastikan data sudah dimuat
    if (chartData.prices.length === 0) {
      try {
        await fetchHistoricalData()
      } catch (error) {
        console.error('Failed to fetch data:', error)
        return
      }
    }
    
    setSimulationStatus('running')
    let currentIndex = chartData.prices.findIndex(p => p.time === currentTime) || 0
    
    simulationRef.current = setInterval(() => {
      if (currentIndex >= chartData.prices.length - 1) {
        stopSimulation()
        setSimulationStatus('completed')
        return
      }
      
      currentIndex++
      const priceData = chartData.prices[currentIndex]
      setCurrentTime(priceData.time)
      setProgress((currentIndex / (chartData.prices.length - 1)) * 100)
      
      // Update open positions
      updateOpenPositions(priceData.close, priceData.time)
      
      // Check for new signals
      const signal = chartData.signals[currentIndex]
      if (signal) {
        executeTrade(signal.type, signal.price, signal.time)
      }
      
      // Update stats periodically
      if (currentIndex % 10 === 0) {
        calculateTradeStats()
        updateChart(currentIndex)
      }
    }, 1000 / simulationSpeed)
  }
  
  // Hentikan simulasi
  const stopSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }
    setSimulationStatus('paused')
    calculateTradeStats()
  }
  
  // Reset simulasi
  const resetSimulation = () => {
    stopSimulation()
    
    // Reset semua state terkait trading
    setBalance(10000)
    setEquity(10000)
    setProfit(0)
    setTrades([])
    setPositions([])
    setTradeStats({
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0
    })
    
    if (chartData.prices.length > 0) {
      setCurrentTime(chartData.prices[0].time)
    }
    setProgress(0)
    setSimulationStatus('stopped')
  }
  
  // Handler untuk perubahan pengaturan
  const handleSettingChange = (setting, value) => {
    setBotSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }
  
  // Format angka untuk tampilan
  const formatNumber = (num, decimals = 2) => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  
  // Format waktu
  const formatTime = (timeString) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Inisialisasi dan update chart
  const updateChart = (currentIndex = 0) => {
    if (!chartRef.current) return
    
    const ctx = chartRef.current.getContext('2d')
    
    // Hapus chart sebelumnya jika ada
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    
    // Batasi data yang ditampilkan
    const startIdx = Math.max(0, currentIndex - 100)
    const endIdx = Math.min(chartData.prices.length, currentIndex + 20)
    const visiblePrices = chartData.prices.slice(startIdx, endIdx)
    const visibleSmaFast = chartData.smaFast.slice(startIdx, endIdx)
    const visibleSmaSlow = chartData.smaSlow.slice(startIdx, endIdx)
    
    // Buat chart baru
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: visiblePrices.map(p => new Date(p.time)),
        datasets: [
          {
            label: 'Price',
            data: visiblePrices.map(p => p.close),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            fill: true
          },
          {
            label: 'SMA Fast (5)',
            data: visibleSmaFast,
            borderColor: '#ef4444',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.1
          },
          {
            label: 'SMA Slow (20)',
            data: visibleSmaSlow,
            borderColor: '#10b981',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm'
              }
            }
          },
          y: {
            beginAtZero: false
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(5)}`
              }
            }
          }
        }
      }
    })
  }
  
  // Inisialisasi chart saat data tersedia
  useEffect(() => {
    if (chartData.prices.length > 0) {
      updateChart()
    }
  }, [chartData])
  
  // Tampilkan pesan jika bukan pengguna premium
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <Lock className="text-yellow-500" size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            Backtesting is available exclusively to our Premium members. Upgrade your account to access 
            advanced trading tools and market analysis features.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <Zap className="text-yellow-500 mr-2" />
              <span className="font-medium">Premium features include:</span>
            </div>
            <ul className="mt-2 text-left list-disc pl-6 text-gray-700">
              <li>Advanced backtesting with historical data</li>
              <li>Real-time trading simulation</li>
              <li>Multiple strategy testing</li>
              <li>Detailed performance analytics</li>
            </ul>
          </div>
          <a 
            href="/dashboard/upgrade"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            Upgrade to Premium
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BarChart className="mr-2 text-blue-600" size={24} />
            Backtesting Dashboard
            <span className="ml-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Premium
            </span>
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <Clock className="text-blue-600 mr-2" size={16} />
              <span className="text-sm font-medium">
                {currentTime ? new Date(currentTime).toLocaleString() : 'Loading...'}
              </span>
            </div>
            <button 
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
              onClick={resetSimulation}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chart and Controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart Controls */}
          <div className="bg-white p-4 border-b flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                {['M1', 'M5', 'M15'].map((tf) => (
                  <button
                    key={tf}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      botSettings.timeframe === tf 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleSettingChange('timeframe', tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center">
                <Calendar className="text-gray-500 mr-2" size={18} />
                <input
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                <span className="mx-2 text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Speed:</span>
                <select 
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                  <option value="5">5x</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                {simulationStatus === 'running' ? (
                  <button 
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={stopSimulation}
                  >
                    <Pause className="mr-1" size={16} />
                    Pause
                  </button>
                ) : (
                  <button 
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={startSimulation}
                    disabled={simulationStatus === 'completed'}
                  >
                    <Play className="mr-1" size={16} />
                    {simulationStatus === 'completed' ? 'Completed' : 'Start'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Chart Area */}
          <div className="bg-white p-4 flex-1 overflow-hidden">
            <div className="border rounded-lg h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center">
                  <CandlestickChart className="mr-2 text-blue-600" size={20} />
                  {botSettings.symbol} - {botSettings.timeframe} Chart
                  <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">
                    {botSettings.strategy}
                  </span>
                </h2>
              </div>
              <div className="flex-1 p-4 relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading market data...</span>
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center p-4">
                    <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Data Error</h3>
                    <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
                    <button
                      onClick={fetchHistoricalData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}
                
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Stats and Settings */}
        <div className="w-96 flex flex-col border-l">
          {/* Account Summary */}
          <div className="bg-white p-4 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wallet className="mr-2 text-blue-600" size={20} />
              Account Summary
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Balance</div>
                <div className="text-xl font-bold">${formatNumber(balance)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Equity</div>
                <div className={`text-xl font-bold ${
                  equity > balance ? 'text-green-600' : equity < balance ? 'text-red-600' : ''
                }`}>
                  ${formatNumber(equity)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Profit</div>
                <div className={`text-xl font-bold ${
                  profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : ''
                }`}>
                  ${formatNumber(profit)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Open Trades</div>
                <div className="text-xl font-bold">{positions.length}</div>
              </div>
            </div>
          </div>
          
          {/* Trading Stats */}
          <div className="bg-white p-4 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart className="mr-2 text-blue-600" size={20} />
              Trading Statistics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Total Trades</div>
                <div className="text-xl font-bold">{tradeStats.totalTrades}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Win Rate</div>
                <div className="text-xl font-bold">{tradeStats.winRate.toFixed(1)}%</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Profit Factor</div>
                <div className="text-xl font-bold">{tradeStats.profitFactor.toFixed(2)}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="text-gray-600 text-sm">Max Drawdown</div>
                <div className="text-xl font-bold">{tradeStats.maxDrawdown.toFixed(2)}%</div>
              </div>
            </div>
          </div>
          
          {/* Bot Settings */}
          <div className="bg-white p-4 flex-1 overflow-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2 text-blue-600" size={20} />
              Trading Bot Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk per Trade (%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={botSettings.riskPerTrade}
                  onChange={(e) => handleSettingChange('riskPerTrade', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-600">
                  {botSettings.riskPerTrade}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stop Loss (pips)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    value={botSettings.stopLoss}
                    onChange={(e) => handleSettingChange('stopLoss', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Take Profit (pips)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    step="5"
                    value={botSettings.takeProfit}
                    onChange={(e) => handleSettingChange('takeProfit', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={botSettings.useTrailingStop}
                  onChange={(e) => handleSettingChange('useTrailingStop', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Use Trailing Stop
                </label>
              </div>
              
              {botSettings.useTrailingStop && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trailing Stop Distance (pips)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="1"
                    value={botSettings.trailingStopDistance}
                    onChange={(e) => handleSettingChange('trailingStopDistance', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lot Size
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="10"
                  step="0.01"
                  value={botSettings.lotSize}
                  onChange={(e) => handleSettingChange('lotSize', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trade History */}
      <div className="bg-white border-t">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <RefreshCw className="mr-2 text-blue-600" size={20} />
            Trade History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trades.filter(t => t.exitPrice).map((trade, index) => (
                  <tr key={trade.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm">{formatTime(trade.entryTime)}</td>
                    <td className="px-4 py-2 text-sm font-medium">{trade.symbol}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trade.type === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">{trade.size.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">{trade.entryPrice.toFixed(5)}</td>
                    <td className="px-4 py-2 text-sm">{trade.exitPrice.toFixed(5)}</td>
                    <td className={`px-4 py-2 text-sm font-medium ${
                      trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${formatNumber(trade.profit)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trade.reason === 'take-profit' ? 'bg-green-100 text-green-800' : 
                        trade.reason === 'stop-loss' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trade.reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {trades.filter(t => t.exitPrice).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No trade history available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
            }
