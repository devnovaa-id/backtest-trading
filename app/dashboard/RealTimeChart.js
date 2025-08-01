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
  RefreshCw
} from 'lucide-react'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// Import plugin untuk chart candlestick
const { CandlestickController, CandlestickElement } = require('chartjs-chart-financial');
Chart.register(CandlestickController, CandlestickElement);

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
  const API_KEY = "E3DE0rZ6jci1CfulOXOWkoaWqqxIjXlq" // Ganti dengan API key Anda

  // Fungsi untuk mendapatkan multiplier berdasarkan timeframe
  const getMultiplier = (tf) => {
    switch(tf) {
      case 'M1': return 1
      case 'M5': return 5
      case 'M15': return 15
      case 'H1': return 60
      case 'H4': return 240
      case 'D1': return 1440
      case 'W1': return 10080
      case 'MN1': return 43200
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
      const timespan = timeframe === 'D1' || timeframe === 'W1' || timeframe === 'MN1' ? 'day' : 'minute'
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
        x: new Date(bar.t).getTime(), // Konversi ke timestamp
        o: bar.o,
        h: bar.h,
        l: bar.l,
        c: bar.c,
        s: [bar.o, bar.h, bar.l, bar.c] // Format khusus untuk chart candlestick
      }))
      
      // Hitung perubahan harga
      const first = chartData[0].c
      const last = chartData[chartData.length - 1].c
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

  // Inisialisasi chart dengan tampilan ala MT5
  const initChart = async () => {
    if (!chartRef.current) return
    
    // Hapus chart sebelumnya jika ada
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    
    const ctx = chartRef.current.getContext('2d')
    const chartData = historicalData.length > 0 ? historicalData : await fetchHistoricalData()
    
    if (!chartData || chartData.length === 0) return
    
    // Konfigurasi dataset untuk candlestick ala MT5
    const datasets = [{
      label: `${symbol} Price`,
      data: chartData,
      type: 'candlestick',
      borderColor: '#000',
      borderWidth: 1,
      color: {
        up: '#26a69a', // Warna bullish (hijau)
        down: '#ef5350', // Warna bearish (merah)
        unchanged: '#999',
      },
      // Skema warna ala MT5
      rising: {
        fill: true,
        lineColor: '#089981', // Border bullish
        backgroundColor: 'rgba(8, 153, 129, 0.2)', // Background bullish
      },
      falling: {
        fill: true,
        lineColor: '#f23645', // Border bearish
        backgroundColor: 'rgba(242, 54, 69, 0.2)', // Background bearish
      },
    }]
    
    // Buat chart baru dengan tampilan ala MT5
    chartInstance.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: timeframe === 'D1' || timeframe === 'W1' || timeframe === 'MN1' ? 'day' : 'minute',
              displayFormats: {
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'dd MMM',
                week: 'dd MMM',
                month: 'MMM yyyy'
              }
            },
            grid: {
              color: '#e0e0e0',
              borderColor: '#e0e0e0',
            },
            ticks: {
              color: '#666',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 20
            }
          },
          y: {
            position: 'right',
            grid: {
              color: '#e0e0e0',
              borderColor: '#e0e0e0',
            },
            ticks: {
              color: '#666',
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
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            borderColor: '#555',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
            titleColor: '#fff',
            bodyColor: '#fff',
            bodySpacing: 4,
            callbacks: {
              label: function(context) {
                const point = context.raw
                return [
                  `Open: ${point.o.toFixed(5)}`,
                  `High: ${point.h.toFixed(5)}`,
                  `Low: ${point.l.toFixed(5)}`,
                  `Close: ${point.c.toFixed(5)}`
                ]
              },
              title: function(context) {
                const date = new Date(context[0].raw.x)
                return date.toLocaleString()
              }
            }
          }
        },
        // Tampilan grid ala MT5
        elements: {
          candlestick: {
            borderColor: '#000',
            borderWidth: 1,
          }
        },
        // Background chart
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
      }
    })
  }

  // Handler untuk mengganti symbol
  const handleSymbolChange = (e) => {
    setSymbol(e.target.value.toUpperCase())
  }

  // Handler untuk memperbarui chart
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
  }, [symbol, timeframe, startDate, endDate])

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">MT5-style Candlestick Chart</h3>
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
          <div className="bg-gray-100 rounded-xl p-1 flex flex-wrap">
            {['M1', 'M5', 'M15', 'H1', 'H4', 'D1', 'W1', 'MN1'].map((tf) => (
              <button
                key={tf}
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
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
          className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
        >
          <RefreshCw className="mr-1 w-4 h-4" />
          Load Data
        </button>
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">Bars:</span>
          <span className="font-medium">{historicalData.length}</span>
        </div>
      </div>
      
      <div className="relative h-[500px] border border-gray-300 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 z-10 flex items-center justify-center flex-col">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            <span className="mt-3 text-gray-600">Loading candlestick data...</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white/90 z-10">
            <div className="text-gray-400 mb-4 text-4xl">📉</div>
            <p className="text-gray-600 mb-2 font-medium">Failed to load market data</p>
            <p className="text-gray-500 text-sm max-w-md">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              onClick={fetchHistoricalData}
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Reload Data
            </button>
          </div>
        )}
        
        <canvas 
          ref={chartRef} 
          className="w-full h-full bg-white"
          style={{ 
            background: '#ffffff',
            borderLeft: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0'
          }}
        />
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 items-center">
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
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-[#089981] mr-1"></div>
            <span className="text-xs">Bullish</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#f23645] mr-1"></div>
            <span className="text-xs">Bearish</span>
          </div>
        </div>
      </div>
    </div>
  )
}
