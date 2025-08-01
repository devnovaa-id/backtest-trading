'use client'
import { useState, useEffect, useRef } from 'react'
import { 
  CandlestickChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Gauge,
  Search
} from 'lucide-react'
import { Chart } from 'chart.js/auto'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

export default function RealTimeChart() {
  const chartRef = useRef(null)
  const [symbol, setSymbol] = useState('EURUSD')
  const [timeframe, setTimeframe] = useState('M5')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [price, setPrice] = useState(null)
  const [change, setChange] = useState(null)
  const [chartType, setChartType] = useState('candlestick')
  const [isRealTime, setIsRealTime] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [historicalData, setHistoricalData] = useState([])
  const chartInstance = useRef(null)
  const API_KEY = "E3DE0rZ6jci1CfulOXOWkoaWqqxIjXlq" // Gunakan API key Anda

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

  // Format tanggal untuk API Polygon (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]
  }

  // Fetch data historis dari Polygon API
  const fetchHistoricalData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const multiplier = getMultiplier(timeframe)
      const timespan = timeframe === 'D1' ? 'day' : 'minute'
      const formattedSymbol = formatSymbol(symbol)
      
      const fromDate = formatDateForAPI(startDate)
      const toDate = formatDateForAPI(endDate)
      
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${API_KEY}`
      )
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch market data (status: ${res.status})`)
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
      }))
      
      // Hitung perubahan harga
      const first = chartData[0].close
      const last = chartData[chartData.length - 1].close
      const priceChange = ((last - first) / first) * 100
      
      setPrice(last.toFixed(5))
      setChange(priceChange.toFixed(2))
      setLastUpdate(new Date().toLocaleTimeString())
      setHistoricalData(chartData)
      
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
    const chartData = historicalData.length > 0 ? historicalData : await fetchHistoricalData()
    
    if (!chartData || chartData.length === 0) return
    
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
              maxTicksLimit: 20
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
              },
              title: function(context) {
                const date = new Date(context[0].raw.x)
                return date.toLocaleString()
              }
            }
          }
        }
      }
    })
  }

  // Handler untuk mengganti symbol
  const handleSymbolChange = (e) => {
    setSymbol(e.target.value.toUpperCase())
  }

  // Handler untuk memperbarui chart saat parameter berubah
  const handleUpdateChart = () => {
    initChart()
  }

  // Inisialisasi chart saat komponen dimount
  useEffect(() => {
    initChart()
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [symbol, timeframe, chartType, startDate, endDate])

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Historical Market Data</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={symbol}
                onChange={handleSymbolChange}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium w-24 text-center"
              />
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
                chartType === 'candlestick' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setChartType('candlestick')}
            >
              <CandlestickChart size={16} />
            </button>
            <button 
              className={`p-2 rounded-lg ${
                chartType === 'line' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setChartType('line')}
            >
              <LineChart size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center">
          <Calendar className="text-gray-500 mr-2" size={18} />
          <span className="text-sm text-gray-600 mr-2">From:</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            maxDate={new Date()}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          />
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">To:</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={new Date()}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          />
        </div>
        
        <button
          onClick={handleUpdateChart}
          className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Apply Dates
        </button>
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">Data Points:</span>
          <span className="font-medium">{historicalData.length}</span>
        </div>
      </div>
      
      <div className="relative h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading market data...</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="text-gray-400 mb-4 text-4xl">📉</div>
            <p className="text-gray-600 mb-2">Failed to load market data</p>
            <p className="text-gray-500 text-sm max-w-md">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={fetchHistoricalData}
            >
              Try Again
            </button>
          </div>
        )}
        
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            <Gauge className="w-4 h-4 mr-1" />
            Timeframe: {timeframe}
          </div>
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Symbol: {symbol}
          </div>
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
            Range: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Data from Polygon.io
        </div>
      </div>
    </div>
  )
}
