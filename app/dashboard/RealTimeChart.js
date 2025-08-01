'use client'
import { useState, useEffect, useRef } from 'react'
import { 
  CandlestickChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PauseCircle,
  PlayCircle,
  Gauge,
  Search
} from 'lucide-react'
import { Chart } from 'chart.js/auto'

export default function RealTimeChart({ initialSymbol = 'EURUSD' }) {
  const chartRef = useRef(null)
  const [symbol, setSymbol] = useState(initialSymbol)
  const [timeframe, setTimeframe] = useState('M5')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [price, setPrice] = useState(null)
  const [change, setChange] = useState(null)
  const [chartType, setChartType] = useState('candlestick')
  const [isRealTime, setIsRealTime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [tickers, setTickers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showTickerSearch, setShowTickerSearch] = useState(false)
  const chartInstance = useRef(null)

  // Fungsi untuk mendapatkan multiplier berdasarkan timeframe
  const getMultiplier = (tf) => {
    switch(tf) {
      case 'M1': return 1
      case 'M5': return 5
      case 'M15': return 15
      case 'H1': return 60
      case 'D1': return 1440
      default: return 5
    }
  }

  // Format symbol untuk Polygon API
  const formatSymbol = (sym) => {
    if (/^[A-Z]{6}$/.test(sym)) {
      return `C:${sym}`;
    }
    return sym;
  };

  // Format waktu untuk label chart
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    switch(timeframe) {
      case 'M1': 
      case 'M5': 
      case 'M15': 
      case 'H1': 
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case 'D1': 
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      default: 
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Fetch tickers dari Polygon API
  const fetchTickers = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
      if (!API_KEY) {
        throw new Error('Polygon API key is not configured');
      }

      const res = await fetch(
        `https://api.polygon.io/v3/reference/tickers?market=stocks,forex,crypto&active=true&limit=1000&apiKey=${API_KEY}`
      )
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch tickers (status: ${res.status})`);
      }
      
      const data = await res.json()
      
      if (data.status === "ERROR" || !data.results || data.results.length === 0) {
        throw new Error(data.error || 'No tickers available')
      }
      
      // Format tickers untuk dropdown
      const formattedTickers = data.results.map(ticker => ({
        symbol: ticker.ticker,
        name: ticker.name,
        market: ticker.market,
        currency: ticker.currency_name || 'USD'
      }))
      
      setTickers(formattedTickers)
      
    } catch (err) {
      console.error('Error fetching tickers:', err)
      setError(err.message)
    }
  }

  // Fetch data chart dari Polygon API
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
      if (!API_KEY) {
        throw new Error('Polygon API key is not configured');
      }

      const multiplier = getMultiplier(timeframe)
      const timespan = timeframe === 'D1' ? 'day' : 'minute'
      const formattedSymbol = formatSymbol(symbol);
      
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/range/${multiplier}/${timespan}/now?adjusted=true&sort=desc&limit=100&apiKey=${API_KEY}`
      )
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch market data (status: ${res.status})`);
      }
      
      const data = await res.json()
      
      if (data.status === "ERROR" || !data.results || data.results.length === 0) {
        throw new Error(data.error || 'No market data available')
      }
      
      // Format data untuk chart
      const chartData = data.results.map(bar => ({
        timestamp: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      })).reverse()
      
      // Hitung perubahan harga
      const first = chartData[0].close
      const last = chartData[chartData.length - 1].close
      const priceChange = ((last - first) / first) * 100
      
      setPrice(last.toFixed(5))
      setChange(priceChange.toFixed(2))
      setLastUpdate(new Date().toLocaleTimeString())
      
      return chartData
      
    } catch (err) {
      setError(err.message)
      console.error('Error fetching market data:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Inisialisasi chart
  const initChart = async () => {
    if (!chartRef.current) return
    
    // Hapus chart sebelumnya jika ada
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    
    const ctx = chartRef.current.getContext('2d')
    const chartData = await fetchData()
    
    if (!chartData) return
    
    // Konfigurasi dataset berdasarkan tipe chart
    const datasets = []
    
    if (chartType === 'candlestick') {
      datasets.push({
        type: 'candlestick',
        label: `${symbol} Price`,
        data: chartData.map(bar => ({
          x: bar.timestamp,
          o: bar.open,
          h: bar.high,
          l: bar.low,
          c: bar.close
        })),
        color: {
          up: '#26a69a',
          down: '#ef5350',
          unchanged: '#999',
        },
      })
    } else {
      datasets.push({
        type: 'line',
        label: `${symbol} Price`,
        data: chartData.map(bar => ({
          x: bar.timestamp,
          y: bar.close
        })),
        borderColor: '#3a6ff8',
        backgroundColor: 'rgba(58, 111, 248, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        fill: false,
      })
    }
    
    // Buat chart baru
    chartInstance.current = new Chart(ctx, {
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: timeframe === 'D1' ? 'day' : 'minute',
              displayFormats: {
                minute: 'HH:mm',
                day: 'MMM d'
              }
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            }
          },
          y: {
            position: 'right',
            ticks: {
              callback: function(value) {
                return value.toFixed(5)
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                if (chartType === 'candlestick') {
                  const point = context.raw
                  return [
                    `Open: ${point.o.toFixed(5)}`,
                    `High: ${point.h.toFixed(5)}`,
                    `Low: ${point.l.toFixed(5)}`,
                    `Close: ${point.c.toFixed(5)}`
                  ]
                } else {
                  return `Price: ${context.parsed.y.toFixed(5)}`
                }
              }
            }
          }
        }
      }
    })
  }

  // Pembaruan data real-time
  const updateChart = async () => {
    if (!chartInstance.current) return
    
    try {
      const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
      if (!API_KEY) return;

      const multiplier = getMultiplier(timeframe)
      const timespan = timeframe === 'D1' ? 'day' : 'minute'
      const formattedSymbol = formatSymbol(symbol);
      
      // Ambil data terbaru
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/range/${multiplier}/${timespan}/now?adjusted=true&sort=desc&limit=1&apiKey=${API_KEY}`
      )
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch real-time data (status: ${res.status})`);
      }
      
      const data = await res.json()
      
      if (data.status === "ERROR" || !data.results || data.results.length === 0) return
      
      const bar = data.results[0]
      const newPrice = bar.c
      
      // Update harga
      setPrice(newPrice.toFixed(5))
      setLastUpdate(new Date().toLocaleTimeString())
      
      // Update chart
      const chartData = chartInstance.current.data.datasets[0].data
      
      if (chartType === 'candlestick') {
        chartData.push({
          x: bar.t,
          o: bar.o,
          h: bar.h,
          l: bar.l,
          c: bar.c
        })
      } else {
        chartData.push({
          x: bar.t,
          y: bar.c
        })
      }
      
      // Hapus data terlama jika sudah mencapai 100 data point
      if (chartData.length > 100) {
        chartData.shift()
      }
      
      chartInstance.current.update()
      
    } catch (err) {
      console.error('Error updating chart:', err)
      setError(err.message)
    }
  }

  // Handler untuk mengganti symbol
  const handleSymbolChange = (newSymbol) => {
    setSymbol(newSymbol)
    setShowTickerSearch(false)
  }

  // Inisialisasi chart saat komponen dimount
  useEffect(() => {
    initChart()
    fetchTickers()
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [symbol, timeframe, chartType])

  // Setup interval untuk real-time updates
  useEffect(() => {
    let intervalId
    
    if (isRealTime) {
      updateChart()
      intervalId = setInterval(updateChart, 15000) // Update setiap 15 detik
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isRealTime, symbol, timeframe, chartType])

  // Handler untuk mengganti tipe chart
  const handleChartTypeChange = (type) => {
    setChartType(type)
  }

  // Filter tickers berdasarkan pencarian
  const filteredTickers = tickers.filter(ticker => 
    ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticker.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-Time Chart</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div 
                className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium flex items-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setShowTickerSearch(!showTickerSearch)}
              >
                {symbol}
                <Search className="ml-2 w-4 h-4" />
              </div>
              
              {showTickerSearch && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-96 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                  <div className="p-3 border-b">
                    <input
                      type="text"
                      placeholder="Search symbol or name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {filteredTickers.length > 0 ? (
                      filteredTickers.map(ticker => (
                        <div 
                          key={ticker.symbol}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSymbolChange(ticker.symbol)}
                        >
                          <div>
                            <div className="font-medium">{ticker.symbol}</div>
                            <div className="text-sm text-gray-500 truncate">{ticker.name}</div>
                          </div>
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {ticker.market}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        No tickers found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {price && change && (
              <div className="flex items-center">
                <span className="text-xl font-bold mr-2">{price}</span>
                <span className={`flex items-center ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(change) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(parseFloat(change))}%
                </span>
              </div>
            )}
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {lastUpdate || 'Loading...'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 rounded-xl p-1 flex">
            {['M1', 'M5', 'M15', 'H1', 'D1'].map((tf) => (
              <button
                key={tf}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  timeframe === tf 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-100 rounded-xl p-1 flex">
            <button 
              className={`p-2 rounded-lg ${
                isRealTime 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setIsRealTime(!isRealTime)}
              title={isRealTime ? 'Pause real-time' : 'Resume real-time'}
            >
              {isRealTime ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
            </button>
            <button 
              className={`p-2 rounded-lg ${
                chartType === 'candlestick' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleChartTypeChange('candlestick')}
            >
              <CandlestickChart size={16} />
            </button>
            <button 
              className={`p-2 rounded-lg ${
                chartType === 'line' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleChartTypeChange('line')}
            >
              <LineChart size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative h-80">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="text-gray-400 mb-4 text-4xl">📉</div>
            <p className="text-gray-600 mb-2">Failed to load market data</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={initChart}
            >
              Try Again
            </button>
          </div>
        )}
        
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
            <Gauge className="w-4 h-4 mr-1" />
            Real-time: {isRealTime ? 'ON' : 'OFF'}
          </div>
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Interval: {timeframe}
          </div>
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Symbol: {symbol}
          </div>
        </div>
      </div>
    </div>
  )
                                                           }
