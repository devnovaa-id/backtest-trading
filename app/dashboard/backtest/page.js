'use client'
import { useState, useEffect, useRef } from 'react'
import { CandlestickChart, ArrowUpRight, ArrowDownRight, Play, Pause, RefreshCw } from 'lucide-react'
import { Chart } from 'chart.js/auto'

export default function BacktestDashboard() {
  // State utama
  const [balance, setBalance] = useState(10000)
  const [equity, setEquity] = useState(10000)
  const [trades, setTrades] = useState([])
  const [positions, setPositions] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  
  // Referensi chart
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const simulationRef = useRef(null)

  // Generate data harga sederhana
  const generatePriceData = () => {
    const data = []
    let price = 1.0800
    
    for (let i = 0; i < 500; i++) {
      // Random walk dengan sedikit drift
      price += (Math.random() - 0.49) * 0.0005
      data.push({
        timestamp: new Date(Date.now() - (500 - i) * 60000).toISOString(),
        close: price,
        open: price - 0.0001,
        high: price + 0.0002,
        low: price - 0.0002
      })
    }
    
    return data
  }

  // Generate sinyal trading sederhana
  const generateSignals = (data) => {
    const signals = []
    const emaPeriod = 5
    
    for (let i = emaPeriod; i < data.length; i++) {
      // Hitung EMA sederhana
      const sum = data.slice(i - emaPeriod, i).reduce((acc, val) => acc + val.close, 0)
      const ema = sum / emaPeriod
      
      // Generate sinyal
      if (data[i].close > ema && data[i - 1].close <= ema) {
        signals.push({
          index: i,
          type: 'buy',
          price: data[i].close
        })
      } else if (data[i].close < ema && data[i - 1].close >= ema) {
        signals.push({
          index: i,
          type: 'sell',
          price: data[i].close
        })
      }
    }
    
    return signals
  }

  // Eksekusi trading
  const executeTrade = (signal, priceData) => {
    const tradeId = Date.now()
    const positionType = signal.type
    const size = 10000 // Fixed size
    
    const newPosition = {
      id: tradeId,
      type: positionType,
      entryPrice: signal.price,
      entryTime: priceData[signal.index].timestamp,
      size,
      isOpen: true
    }
    
    setPositions(prev => [...prev, newPosition])
    setTrades(prev => [...prev, {
      id: tradeId,
      type: positionType,
      entryPrice: signal.price,
      entryTime: priceData[signal.index].timestamp,
      size
    }])
    
    return newPosition
  }
  
  // Tutup posisi
  const closePosition = (position, price, time) => {
    let profit = 0
    if (position.type === 'buy') {
      profit = (price - position.entryPrice) * position.size
    } else {
      profit = (position.entryPrice - price) * position.size
    }
    
    const newBalance = balance + profit
    setBalance(newBalance)
    setEquity(newBalance)
    
    setTrades(prev => prev.map(trade => 
      trade.id === position.id 
        ? { ...trade, exitPrice: price, exitTime: time, profit } 
        : trade
    ))
    
    setPositions(prev => prev.filter(p => p.id !== position.id))
    
    return profit
  }

  // Mulai simulasi
  const startSimulation = () => {
    if (simulationRef.current) return
    
    const priceData = generatePriceData()
    const signals = generateSignals(priceData)
    let currentIndex = 0
    
    simulationRef.current = setInterval(() => {
      if (currentIndex >= priceData.length - 1) {
        stopSimulation()
        return
      }
      
      currentIndex++
      const currentPrice = priceData[currentIndex].close
      
      // Update posisi terbuka
      positions.forEach(position => {
        if (position.isOpen) {
          // Close position after 5 candles
          if (currentIndex > priceData.findIndex(p => p.timestamp === position.entryTime) + 5) {
            closePosition(position, currentPrice, priceData[currentIndex].timestamp)
          }
        }
      })
      
      // Check for new signals
      const signal = signals.find(s => s.index === currentIndex)
      if (signal) {
        executeTrade(signal, priceData)
      }
      
      updateChart(priceData, signals, currentIndex)
    }, 300)
    
    setIsRunning(true)
    updateChart(priceData, signals, 0)
  }
  
  // Hentikan simulasi
  const stopSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }
    setIsRunning(false)
  }
  
  // Reset simulasi
  const resetSimulation = () => {
    stopSimulation()
    setBalance(10000)
    setEquity(10000)
    setTrades([])
    setPositions([])
  }
  
  // Update chart
  const updateChart = (priceData, signals, currentIndex) => {
    if (!chartRef.current || !priceData) return
    
    const ctx = chartRef.current.getContext('2d')
    
    // Hapus chart sebelumnya jika ada
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    
    // Batasi data yang ditampilkan
    const startIdx = Math.max(0, currentIndex - 50)
    const visibleData = priceData.slice(startIdx, currentIndex + 10)
    
    // Buat chart baru
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: visibleData.map(p => new Date(p.timestamp).toLocaleTimeString()),
        datasets: [
          {
            label: 'Price',
            data: visibleData.map(p => p.close),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            fill: true
          },
          {
            label: 'Signals',
            data: visibleData.map((p, idx) => {
              const signal = signals?.find(s => 
                s.index === startIdx + idx && 
                s.index <= currentIndex
              )
              return signal ? signal.price : null
            }),
            pointRadius: 6,
            pointBackgroundColor: ctx => {
              const index = ctx.dataIndex
              const signal = signals?.find(s => s.index === startIdx + index)
              return signal?.type === 'buy' 
                ? 'rgba(16, 185, 129, 0.8)' 
                : 'rgba(239, 68, 68, 0.8)'
            },
            pointBorderColor: 'transparent',
            showLine: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `$${ctx.parsed.y.toFixed(5)}`
            }
          }
        },
        animation: false
      }
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Trading Backtest</h1>
        <div className="flex space-x-2">
          <button 
            className="bg-gray-200 p-2 rounded"
            onClick={resetSimulation}
          >
            <RefreshCw size={18} />
          </button>
          {isRunning ? (
            <button 
              className="bg-red-500 text-white p-2 rounded"
              onClick={stopSimulation}
            >
              <Pause size={18} />
            </button>
          ) : (
            <button 
              className="bg-green-500 text-white p-2 rounded"
              onClick={startSimulation}
            >
              <Play size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 gap-4">
        {/* Chart Area */}
        <div className="flex-1 bg-white shadow rounded-lg p-4">
          <div className="h-[400px]">
            <canvas ref={chartRef} />
          </div>
        </div>
        
        {/* Stats Panel */}
        <div className="w-80 bg-white shadow rounded-lg p-4">
          <h2 className="font-bold mb-4">Account Summary</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm text-gray-600">Balance</div>
              <div className="text-lg font-bold">${balance.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm text-gray-600">Equity</div>
              <div className="text-lg font-bold">${equity.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm text-gray-600">Trades</div>
              <div className="text-lg font-bold">{trades.length}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm text-gray-600">Positions</div>
              <div className="text-lg font-bold">{positions.length}</div>
            </div>
          </div>
          
          <h3 className="font-bold mb-2">Recent Trades</h3>
          <div className="max-h-60 overflow-y-auto">
            {trades.slice(-5).map((trade, i) => (
              <div 
                key={i} 
                className={`p-2 mb-2 rounded ${
                  trade.profit > 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex justify-between">
                  <span className={trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span className="font-bold">
                    {trade.profit ? `$${trade.profit.toFixed(2)}` : 'Open'}
                  </span>
                </div>
                <div className="text-sm">
                  {trade.entryPrice.toFixed(5)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
    }
