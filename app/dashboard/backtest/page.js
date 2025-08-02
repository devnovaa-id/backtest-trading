'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  CandlestickChart, LineChart, ArrowUpRight, ArrowDownRight,
  Clock, Gauge, Wallet, BarChart, TrendingUp, TrendingDown,
  Settings, Play, Pause, RefreshCw, Calendar, Lock, Zap, Download,
  BookOpen, BarChart2, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

// Konstanta untuk simulasi pasar realistik
const SECONDS_IN_DAY = 86400
const BASE_PRICE = 1.0800
const BASE_SPREAD = 0.0001 // 1 pip
const VOLATILITY_BASELINE = 0.0005

// Regime parameters
const REGIME_PARAMS = {
  trend_up: { drift: 0.0002, volatility: 0.0004 },
  trend_down: { drift: -0.0002, volatility: 0.0004 },
  sideways: { drift: 0, volatility: 0.0002 },
  high_vol: { drift: 0, volatility: 0.0008 },
  low_vol: { drift: 0, volatility: 0.0001 }
}

// Transition probabilities between regimes
const REGIME_TRANSITIONS = {
  trend_up:    [0.70, 0.05, 0.10, 0.10, 0.05],
  trend_down:  [0.05, 0.70, 0.10, 0.10, 0.05],
  sideways:    [0.05, 0.05, 0.80, 0.05, 0.05],
  high_vol:    [0.15, 0.15, 0.20, 0.40, 0.10],
  low_vol:     [0.05, 0.05, 0.80, 0.05, 0.05]
}

const REGIME_KEYS = Object.keys(REGIME_PARAMS)

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
    totalTrades: 0, winRate: 0, profitFactor: 0, 
    maxDrawdown: 0, avgProfit: 0, avgLoss: 0
  })
  
  // State untuk pengaturan bot
  const [botSettings, setBotSettings] = useState({
    symbol: 'EURUSD',
    timeframe: 'M1',
    strategy: 'SMC/ICT Hybrid',
    riskPerTrade: 1,
    stopLoss: 20,
    takeProfit: 40,
    useTrailingStop: true,
    trailingStopDistance: 10,
    lotSize: 0.1,
    isRunning: false,
    includeSlippage: true,
    smcEnabled: true,
    ictEnabled: true,
    crtEnabled: true
  })
  
  // State untuk data multi-timeframe
  const [timeframeData, setTimeframeData] = useState({
    tick: [], m1: [], m5: [], m15: [], signals: []
  })
  
  // State untuk simulasi
  const [simulationStatus, setSimulationStatus] = useState('stopped')
  const [currentTime, setCurrentTime] = useState('')
  const [progress, setProgress] = useState(0)
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [marketStructure, setMarketStructure] = useState({
    fairValueGap: [],
    orderBlocks: [],
    liquidityZones: [],
    breakerBlocks: []
  })
  
  // State untuk optimasi loading
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isGeneratingData, setIsGeneratingData] = useState(false)
  
  // Referensi untuk chart dan simulasi
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const simulationRef = useRef(null)
  
  // Format tanggal untuk tampilan
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]
  }

  // Generator data per tick yang sangat realistis
  const generateTickData = useCallback(() => {
    setIsGeneratingData(true)
    setGenerationProgress(0)
    
    const startTime = new Date(startDate).getTime()
    const endTime = new Date(endDate).getTime()
    const durationSeconds = Math.floor((endTime - startTime) / 1000)
    
    // Batasi jumlah data untuk pengembangan
    const maxSeconds = process.env.NODE_ENV === 'development' 
      ? Math.min(durationSeconds, 60 * 60 * 24) // 1 hari untuk development
      : durationSeconds
    
    const tickData = []
    let currentPrice = BASE_PRICE
    let currentRegime = 'sideways'
    let regimeDuration = 0
    let volatilityMemory = 0.5 // Untuk volatility clustering
    let spreadMultiplier = 1
    
    // Inisialisasi variabel untuk indikator
    let ema3 = BASE_PRICE
    let ema8 = BASE_PRICE
    let atr = 0
    const atrPeriod = 14
    const atrValues = []
    
    // Variabel untuk news shock
    let newsShockActive = false
    let newsShockEndTime = 0
    let shockSize = 0
    
    // Variabel untuk gap
    let gapActive = false
    let gapEndTime = 0
    
    // Variabel untuk struktur pasar
    let swingHighs = []
    let swingLows = []
    let lastSwingHigh = BASE_PRICE + 0.0010
    let lastSwingLow = BASE_PRICE - 0.0010
    
    // Blok pembuatan data untuk optimasi
    const blockSize = 1000
    let lastProgressReport = 0
    
    for (let i = 0; i < maxSeconds; i++) {
      const timestamp = new Date(startTime + i * 1000).toISOString()
      
      // 1. Regime switching dengan durasi minimal
      regimeDuration++
      if (regimeDuration > 300 && Math.random() < 0.01) {
        const rand = Math.random()
        let cumProb = 0
        for (let j = 0; j < REGIME_KEYS.length; j++) {
          cumProb += REGIME_TRANSITIONS[currentRegime][j]
          if (rand < cumProb) {
            currentRegime = REGIME_KEYS[j]
            regimeDuration = 0
            break
          }
        }
      }
      
      const { drift, volatility } = REGIME_PARAMS[currentRegime]
      
      // 2. Volatility clustering (GARCH-like)
      const effectiveVolatility = volatility * (0.8 + 0.4 * volatilityMemory)
      volatilityMemory = 0.8 * volatilityMemory + 0.2 * Math.random()
      
      // 3. Spike/news shock (0.01% chance per second ~ 6-7 kali per hari)
      let isSpike = false
      let isGap = false
      if (!newsShockActive && Math.random() < 0.0001) {
        newsShockActive = true
        shockSize = (2 + 3 * Math.random()) * effectiveVolatility
        newsShockEndTime = i + 30 + Math.floor(Math.random() * 90) // 30-120 detik
        spreadMultiplier = 5 + 5 * Math.random()
        isSpike = true
      }
      
      // 4. Gap events (0.005% chance per second ~ 3-4 kali per hari)
      if (!gapActive && Math.random() < 0.00005) {
        gapActive = true
        gapEndTime = i + 1 + Math.floor(Math.random() * 4) // 1-5 detik gap
        isGap = true
      }
      
      // 5. Handle active news shock
      if (newsShockActive) {
        // Apply shock at the beginning
        if (isSpike) {
          currentPrice += Math.sign(Math.random() - 0.5) * shockSize
        }
        
        // End news shock after duration
        if (i >= newsShockEndTime) {
          newsShockActive = false
          spreadMultiplier = 1
        }
      }
      
      // 6. Skip ticks during gap
      if (gapActive) {
        if (i >= gapEndTime) {
          gapActive = false
        } else {
          continue
        }
      }
      
      // 7. Price movement model (GBM)
      const driftComponent = drift / SECONDS_IN_DAY
      const shockComponent = isSpike ? (Math.sign(Math.random() - 0.5) * shockSize) : 0
      const randomComponent = effectiveVolatility * (Math.random() - 0.5) * 2
      const priceChange = driftComponent + randomComponent + shockComponent
      
      // 8. Mean reversion noise
      const meanReversion = 0.1 * (BASE_PRICE - currentPrice) / SECONDS_IN_DAY
      currentPrice += priceChange + meanReversion
      
      // 9. Spread modeling (volatility-sensitive)
      const spread = BASE_SPREAD * spreadMultiplier * 
                    (1 + 2 * (effectiveVolatility / VOLATILITY_BASELINE))
      
      // 10. Volume proxy (volatility-correlated)
      const volumeProxy = 1000 + 
                          Math.floor(5000 * (effectiveVolatility / VOLATILITY_BASELINE)) + 
                          Math.floor(2000 * Math.random())
      
      // 11. Tick direction
      let tickDirection = 'none'
      if (tickData.length > 0) {
        const prevPrice = tickData[tickData.length - 1].mid
        if (currentPrice > prevPrice) tickDirection = 'up'
        else if (currentPrice < prevPrice) tickDirection = 'down'
      }
      
      // 12. OHLC values for this second
      const open = tickData.length > 0 ? tickData[tickData.length - 1].close : currentPrice
      const high = Math.max(open, currentPrice * (1 + 0.0001 * Math.random()))
      const low = Math.min(open, currentPrice * (1 - 0.0001 * Math.random()))
      const close = currentPrice
      
      // 13. Slippage modeling (for execution)
      const slippage = botSettings.includeSlippage ? 
        (spread / 2) * (0.5 + Math.random()) * (tickDirection === 'up' ? 1 : -1) : 0
      const slippageAdjustedPrice = currentPrice + slippage
      
      // 14. Indicator precomputation
      // EMA calculation
      const emaAlpha3 = 2 / (3 + 1)
      ema3 = (close * emaAlpha3) + (ema3 * (1 - emaAlpha3))
      
      const emaAlpha8 = 2 / (8 + 1)
      ema8 = (close * emaAlpha8) + (ema8 * (1 - emaAlpha8))
      
      // ATR calculation
      let trueRange = high - low
      if (tickData.length > 0) {
        const prevClose = tickData[tickData.length - 1].close
        trueRange = Math.max(
          high - low,
          Math.abs(high - prevClose),
          Math.abs(low - prevClose)
        )
      }
      
      atrValues.push(trueRange)
      if (atrValues.length > atrPeriod) atrValues.shift()
      
      const atr = atrValues.length === atrPeriod ? 
        atrValues.reduce((sum, val) => sum + val, 0) / atrPeriod : 0
      
      // 15. Confidence factor (reduced during shocks/gaps)
      const confidence = newsShockActive ? 0.5 : (isGap ? 0.7 : 1)
      
      // Create tick object
      const tick = {
        timestamp,
        mid: currentPrice,
        open,
        high,
        low,
        close,
        bid: currentPrice - spread / 2,
        ask: currentPrice + spread / 2,
        spread,
        tick_direction: tickDirection,
        volume_proxy: volumeProxy,
        regime: currentRegime,
        is_spike: isSpike,
        is_gap: isGap,
        news_shock: newsShockActive,
        slippage_adjusted_price: slippageAdjustedPrice,
        ema_fast: ema3,
        ema_slow: ema8,
        atr,
        confidence
      }
      
      tickData.push(tick)
      
      // Update progress secara berkala (setiap 1%)
      if (i % Math.floor(maxSeconds / 100) === 0) {
        const progress = Math.floor((i / maxSeconds) * 100)
        if (progress > lastProgressReport) {
          setGenerationProgress(progress)
          lastProgressReport = progress
        }
      }
    }
    
    setIsGeneratingData(false)
    return tickData
  }, [startDate, endDate, botSettings.includeSlippage])

  // Agregasi ke timeframe lebih tinggi
  const aggregateTimeframe = (tickData, seconds) => {
    const aggregated = []
    const ticksPerCandle = seconds
    
    for (let i = 0; i < tickData.length; i += ticksPerCandle) {
      const group = tickData.slice(i, i + ticksPerCandle)
      if (group.length === 0) continue
      
      const open = group[0].open
      const close = group[group.length - 1].close
      const high = Math.max(...group.map(t => t.high))
      const low = Math.min(...group.map(t => t.low))
      const volume = group.reduce((sum, t) => sum + t.volume_proxy, 0)
      const timestamp = group[0].timestamp
      
      // Flags aggregation
      const is_spike = group.some(t => t.is_spike)
      const is_gap = group.some(t => t.is_gap)
      const news_shock = group.some(t => t.news_shock)
      const confidence = group.reduce((sum, t) => sum + t.confidence, 0) / group.length
      
      aggregated.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
        is_spike,
        is_gap,
        news_shock,
        confidence,
        // Preserve last tick's indicators
        ema_fast: group[group.length - 1].ema_fast,
        ema_slow: group[group.length - 1].ema_slow,
        atr: group[group.length - 1].atr
      })
    }
    
    return aggregated
  }
  
  // Identifikasi struktur pasar (SMC/ICT)
  const identifyMarketStructure = (data) => {
    const fairValueGaps = []
    const orderBlocks = []
    const liquidityZones = []
    const breakerBlocks = []
    
    // Swing points untuk identifikasi struktur
    const swingHighs = []
    const swingLows = []
    
    // Identifikasi swing points
    for (let i = 5; i < data.length - 5; i++) {
      const current = data[i]
      let isSwingHigh = true
      let isSwingLow = true
      
      // Periksa 5 bar sebelum dan sesudah
      for (let j = 1; j <= 5; j++) {
        if (data[i - j].high > current.high || data[i + j].high > current.high) {
          isSwingHigh = false
        }
        if (data[i - j].low < current.low || data[i + j].low < current.low) {
          isSwingLow = false
        }
      }
      
      if (isSwingHigh) swingHighs.push({ ...current, type: 'high' })
      if (isSwingLow) swingLows.push({ ...current, type: 'low' })
    }
    
    // Identifikasi Fair Value Gaps (ICT)
    for (let i = 1; i < data.length - 1; i++) {
      const prev = data[i - 1]
      const current = data[i]
      const next = data[i + 1]
      
      // Bullish FVG: candle sebelumnya low > candle berikutnya high
      if (prev.low > next.high) {
        fairValueGaps.push({
          type: 'bullish',
          high: prev.low,
          low: next.high,
          timestamp: current.timestamp
        })
      }
      
      // Bearish FVG: candle sebelumnya high < candle berikutnya low
      if (prev.high < next.low) {
        fairValueGaps.push({
          type: 'bearish',
          high: next.low,
          low: prev.high,
          timestamp: current.timestamp
        })
      }
    }
    
    // Identifikasi Order Blocks (SMC)
    for (let i = 3; i < data.length; i++) {
      const current = data[i]
      const prev1 = data[i - 1]
      const prev2 = data[i - 2]
      const prev3 = data[i - 3]
      
      // Bullish Order Block: 3 candle turun diikuti candle naik
      if (prev3.close > prev3.open && 
          prev2.close < prev2.open && 
          prev1.close < prev1.open && 
          current.close > current.open) {
        orderBlocks.push({
          type: 'bullish',
          high: Math.max(prev3.high, prev2.high, prev1.high),
          low: Math.min(prev3.low, prev2.low, prev1.low),
          timestamp: current.timestamp
        })
      }
      
      // Bearish Order Block: 3 candle naik diikuti candle turun
      if (prev3.close < prev3.open && 
          prev2.close > prev2.open && 
          prev1.close > prev1.open && 
          current.close < current.open) {
        orderBlocks.push({
          type: 'bearish',
          high: Math.max(prev3.high, prev2.high, prev1.high),
          low: Math.min(prev3.low, prev2.low, prev1.low),
          timestamp: current.timestamp
        })
      }
    }
    
    // Identifikasi Liquidity Zones (SMC)
    swingHighs.forEach(swing => {
      liquidityZones.push({
        type: 'liquidity',
        price: swing.high,
        direction: 'above',
        timestamp: swing.timestamp
      })
    })
    
    swingLows.forEach(swing => {
      liquidityZones.push({
        type: 'liquidity',
        price: swing.low,
        direction: 'below',
        timestamp: swing.timestamp
      })
    })
    
    // Identifikasi Breaker Blocks (ICT)
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]
      const current = data[i]
      
      // Bullish Breaker Block: candle sebelumnya turun, candle saat ini naik dan menembus high sebelumnya
      if (prev.close < prev.open && 
          current.close > current.open && 
          current.high > prev.high) {
        breakerBlocks.push({
          type: 'bullish',
          high: prev.high,
          low: prev.low,
          timestamp: current.timestamp
        })
      }
      
      // Bearish Breaker Block: candle sebelumnya naik, candle saat ini turun dan menembus low sebelumnya
      if (prev.close > prev.open && 
          current.close < current.open && 
          current.low < prev.low) {
        breakerBlocks.push({
          type: 'bearish',
          high: prev.high,
          low: prev.low,
          timestamp: current.timestamp
        })
      }
    }
    
    return {
      fairValueGaps,
      orderBlocks,
      liquidityZones,
      breakerBlocks,
      swingHighs,
      swingLows
    }
  }

  // Generate sinyal trading berdasarkan SMC/ICT
  const generateSMCSignals = (tickData, m1Data, m5Data, m15Data) => {
    const signals = Array(tickData.length).fill(null)
    
    // Identifikasi struktur pasar pada data M15
    const m15Structure = identifyMarketStructure(m15Data)
    
    // Mapping index tick ke M1, M5, M15
    const m1IndexMap = Array(tickData.length).fill(0)
    const m5IndexMap = Array(tickData.length).fill(0)
    const m15IndexMap = Array(tickData.length).fill(0)
    
    let m1Idx = 0
    let m5Idx = 0
    let m15Idx = 0
    
    for (let i = 0; i < tickData.length; i++) {
      if (i > 0 && i % 60 === 0) m1Idx = Math.min(m1Idx + 1, m1Data.length - 1)
      if (i > 0 && i % 300 === 0) m5Idx = Math.min(m5Idx + 1, m5Data.length - 1)
      if (i > 0 && i % 900 === 0) m15Idx = Math.min(m15Idx + 1, m15Data.length - 1)
      
      m1IndexMap[i] = m1Idx
      m5IndexMap[i] = m5Idx
      m15IndexMap[i] = m15Idx
    }
    
    // Generate sinyal berdasarkan SMC/ICT
    for (let i = 300; i < tickData.length; i++) {
      const m1Idx = m1IndexMap[i]
      const m5Idx = m5IndexMap[i]
      const m15Idx = m15IndexMap[i]
      
      // Dapatkan data terbaru
      const currentTick = tickData[i]
      const currentM1 = m1Data[m1Idx]
      const currentM5 = m5Data[m5Idx]
      const currentM15 = m15Data[m15Idx]
      
      // Skip jika ada gap atau shock
      if (currentTick.is_gap || currentTick.news_shock) continue
      
      // Konfirmasi tren dari M15
      const isUptrend = currentM15.ema_fast > currentM15.ema_slow
      const isDowntrend = currentM15.ema_fast < currentM15.ema_slow
      
      // 1. Cek apakah harga di area Fair Value Gap (ICT)
      const inBullishFVG = m15Structure.fairValueGaps.some(fvg => 
        fvg.type === 'bullish' && 
        currentTick.mid >= fvg.low && 
        currentTick.mid <= fvg.high
      )
      
      const inBearishFVG = m15Structure.fairValueGaps.some(fvg => 
        fvg.type === 'bearish' && 
        currentTick.mid >= fvg.low && 
        currentTick.mid <= fvg.high
      )
      
      // 2. Cek apakah harga di area Order Block (SMC)
      const inBullishOB = m15Structure.orderBlocks.some(ob => 
        ob.type === 'bullish' && 
        currentTick.mid >= ob.low && 
        currentTick.mid <= ob.high
      )
      
      const inBearishOB = m15Structure.orderBlocks.some(ob => 
        ob.type === 'bearish' && 
        currentTick.mid >= ob.low && 
        currentTick.mid <= ob.high
      )
      
      // 3. Cek apakah harga mendekati Liquidity Zone (SMC)
      const nearLiquidity = m15Structure.liquidityZones.some(lz => 
        Math.abs(currentTick.mid - lz.price) < 0.0005
      )
      
      // 4. Cek momentum dengan tick direction dan volume
      const isBullishMomentum = currentTick.tick_direction === 'up' && currentTick.volume_proxy > 1500
      const isBearishMomentum = currentTick.tick_direction === 'down' && currentTick.volume_proxy > 1500
      
      // 5. Entry Rules berdasarkan SMC/ICT
      // Long Entry: Bullish FVG/OB + Uptrend + Bullish Momentum
      if (botSettings.smcEnabled && (inBullishFVG || inBullishOB) && isUptrend && isBullishMomentum) {
        const entryPrice = botSettings.includeSlippage ? 
          currentTick.slippage_adjusted_price : currentTick.mid
        
        // Hitung stop loss dan take profit berdasarkan ATR
        const atr = currentM1.atr || 0.0005
        const stopLoss = entryPrice - atr * 1.5
        const takeProfit = entryPrice + atr * 2
        
        signals[i] = { 
          type: 'buy', 
          time: currentTick.timestamp, 
          price: entryPrice,
          stopLoss,
          takeProfit,
          confidence: currentM15.confidence,
          reason: inBullishFVG ? 'Bullish FVG' : 'Bullish Order Block'
        }
      }
      
      // Short Entry: Bearish FVG/OB + Downtrend + Bearish Momentum
      if (botSettings.smcEnabled && (inBearishFVG || inBearishOB) && isDowntrend && isBearishMomentum) {
        const entryPrice = botSettings.includeSlippage ? 
          currentTick.slippage_adjusted_price : currentTick.mid
        
        const atr = currentM1.atr || 0.0005
        const stopLoss = entryPrice + atr * 1.5
        const takeProfit = entryPrice - atr * 2
        
        signals[i] = { 
          type: 'sell', 
          time: currentTick.timestamp, 
          price: entryPrice,
          stopLoss,
          takeProfit,
          confidence: currentM15.confidence,
          reason: inBearishFVG ? 'Bearish FVG' : 'Bearish Order Block'
        }
      }
      
      // 6. Entry Rules berdasarkan Liquidity Grab (SMC)
      // Long Entry: Mendekati liquidity below + Reversal pattern
      if (botSettings.smcEnabled && nearLiquidity && isBullishMomentum) {
        const liquidityZone = m15Structure.liquidityZones.find(lz => 
          Math.abs(currentTick.mid - lz.price) < 0.0005 && 
          lz.direction === 'below'
        )
        
        if (liquidityZone) {
          const entryPrice = botSettings.includeSlippage ? 
            currentTick.slippage_adjusted_price : currentTick.mid
          
          const atr = currentM1.atr || 0.0005
          const stopLoss = entryPrice - atr * 1.5
          const takeProfit = entryPrice + atr * 3
          
          signals[i] = { 
            type: 'buy', 
            time: currentTick.timestamp, 
            price: entryPrice,
            stopLoss,
            takeProfit,
            confidence: currentM15.confidence,
            reason: 'Liquidity Grab (Below)'
          }
        }
      }
      
      // Short Entry: Mendekati liquidity above + Reversal pattern
      if (botSettings.smcEnabled && nearLiquidity && isBearishMomentum) {
        const liquidityZone = m15Structure.liquidityZones.find(lz => 
          Math.abs(currentTick.mid - lz.price) < 0.0005 && 
          lz.direction === 'above'
        )
        
        if (liquidityZone) {
          const entryPrice = botSettings.includeSlippage ? 
            currentTick.slippage_adjusted_price : currentTick.mid
          
          const atr = currentM1.atr || 0.0005
          const stopLoss = entryPrice + atr * 1.5
          const takeProfit = entryPrice - atr * 3
          
          signals[i] = { 
            type: 'sell', 
            time: currentTick.timestamp, 
            price: entryPrice,
            stopLoss,
            takeProfit,
            confidence: currentM15.confidence,
            reason: 'Liquidity Grab (Above)'
          }
        }
      }
    }
    
    return signals
  }

  // Load mock data
  const loadMockData = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Generate tick data
      const tickData = generateTickData()
      
      // Build higher timeframes
      const m1Data = aggregateTimeframe(tickData, 60)
      const m5Data = aggregateTimeframe(m1Data, 5)
      const m15Data = aggregateTimeframe(m5Data, 3)
      
      // Identify market structure
      const marketStructure = identifyMarketStructure(m15Data)
      setMarketStructure(marketStructure)
      
      // Generate trading signals
      const signals = generateSMCSignals(tickData, m1Data, m5Data, m15Data)
      
      setTimeframeData({ 
        tick: tickData, 
        m1: m1Data, 
        m5: m5Data, 
        m15: m15Data, 
        signals 
      })
      
      setCurrentTime(tickData[0]?.timestamp || '')
      return true
    } catch (error) {
      console.error('Error generating mock data:', error)
      setError('Failed to generate market data')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [generateTickData, botSettings.includeSlippage, botSettings.smcEnabled])

  // Eksekusi trading
  const executeTrade = (signal, price, time) => {
    if (!isPremium) {
      alert('Premium feature required. Upgrade your account to access trading functionality.')
      return null
    }
    
    const tradeId = Date.now()
    const positionType = signal.type
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
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      currentPrice: price,
      profit: 0,
      isOpen: true,
      signalReason: signal.reason
    }
    
    setPositions(prev => [...prev, newPosition])
    
    // Catat trade
    setTrades(prev => [...prev, {
      id: tradeId,
      type: positionType,
      symbol: botSettings.symbol,
      entryPrice: price,
      entryTime: time,
      size: positionSize,
      reason: signal.reason
    }])
    
    return newPosition
  }
  
  // Tutup posisi
  const closePosition = (position, price, time, reason) => {
    // Hitung profit
    let profitAmount = 0
    if (position.type === 'buy') {
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
        ? { ...trade, exitPrice: price, exitTime: time, profit: profitAmount, exitReason: reason } 
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
      if (position.type === 'buy') {
        currentProfit = (price - position.entryPrice) * position.size
      } else {
        currentProfit = (position.entryPrice - price) * position.size
      }
      
      // Periksa apakah stop loss atau take profit terpicu
      let closeReason = null
      if (position.type === 'buy') {
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
        
        if (position.type === 'buy') {
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
      if (p.type === 'buy') {
        return p.currentPrice <= p.stopLoss || p.currentPrice >= p.takeProfit
      } else {
        return p.currentPrice >= p.stopLoss || p.currentPrice <= p.takeProfit
      }
    })
    
    positionsToClose.forEach(position => {
      let reason = ''
      if (position.type === 'buy') {
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
      
    const avgProfit = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length 
      : 0
      
    const avgLoss = losingTrades.length > 0 
      ? losingTrades.reduce((sum, t) => sum + Math.abs(t.profit), 0) / losingTrades.length 
      : 0
      
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
      maxDrawdown,
      avgProfit,
      avgLoss
    })
  }
  
  // Mulai simulasi
  const startSimulation = async () => {
    if (simulationStatus === 'completed') {
      resetSimulation()
    }
    
    // Pastikan data sudah dimuat
    if (timeframeData.tick.length === 0) {
      try {
        await loadMockData()
      } catch (error) {
        console.error('Failed to load data:', error)
        return
      }
    }
    
    setSimulationStatus('running')
    let currentIndex = timeframeData.tick.findIndex(p => p.timestamp === currentTime) || 0
    
    simulationRef.current = setInterval(() => {
      if (currentIndex >= timeframeData.tick.length - 1) {
        stopSimulation()
        setSimulationStatus('completed')
        return
      }
      
      currentIndex++
      const priceData = timeframeData.tick[currentIndex]
      setCurrentTime(priceData.timestamp)
      setProgress((currentIndex / (timeframeData.tick.length - 1)) * 100)
      
      // Update open positions
      updateOpenPositions(priceData.mid, priceData.timestamp)
      
      // Check for new signals
      const signal = timeframeData.signals[currentIndex]
      if (signal) {
        executeTrade(signal, signal.price, signal.time)
      }
      
      // Update stats periodically
      if (currentIndex % 10 === 0) {
        calculateTradeStats()
        updateChart(currentIndex)
      }
    }, 100) // Fixed speed for realistic experience
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
      maxDrawdown: 0,
      avgProfit: 0,
      avgLoss: 0
    })
    
    if (timeframeData.tick.length > 0) {
      setCurrentTime(timeframeData.tick[0].timestamp)
    }
    setProgress(0)
    setSimulationStatus('stopped')
  }
  
  // Handler untuk perubahan pengaturan
  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...botSettings,
      [setting]: value
    }
    setBotSettings(newSettings)
    localStorage.setItem('botSettings', JSON.stringify(newSettings))
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
  
  // Simpan state ke local storage
  const saveStateToLocalStorage = () => {
    const state = {
      balance,
      equity,
      profit,
      trades,
      positions,
      tradeStats,
      timeframeData,
      simulationStatus,
      currentTime,
      progress,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      botSettings,
      marketStructure
    }
    localStorage.setItem('backtestState', JSON.stringify(state))
  }
  
  // Load state dari local storage
  const loadStateFromLocalStorage = () => {
    const savedState = localStorage.getItem('backtestState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        
        setBalance(state.balance)
        setEquity(state.equity)
        setProfit(state.profit)
        setTrades(state.trades)
        setPositions(state.positions)
        setTradeStats(state.tradeStats)
        setTimeframeData(state.timeframeData)
        setSimulationStatus(state.simulationStatus)
        setCurrentTime(state.currentTime)
        setProgress(state.progress)
        setStartDate(new Date(state.startDate))
        setEndDate(new Date(state.endDate))
        setBotSettings(state.botSettings)
        setMarketStructure(state.marketStructure || {
          fairValueGap: [],
          orderBlocks: [],
          liquidityZones: [],
          breakerBlocks: []
        })
        
        return true
      } catch (e) {
        console.error('Failed to load state from localStorage', e)
      }
    }
    return false
  }
  
  // Simpan data ke file
  const exportData = () => {
    const data = {
      botSettings,
      trades,
      positions,
      tradeStats,
      marketStructure
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "backtest_data.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }
  
  // Inisialisasi dan update chart
  const updateChart = (currentIndex = 0) => {
    if (!chartRef.current) return
    
    const ctx = chartRef.current.getContext('2d')
    
    // Hapus chart sebelumnya jika ada
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    
    // Batasi data yang ditampilkan (gunakan data M1)
    const startIdx = Math.max(0, currentIndex - 100)
    const endIdx = Math.min(timeframeData.m1.length, Math.floor(currentIndex / 60) + 20)
    const visiblePrices = timeframeData.m1.slice(startIdx, endIdx)
    
    // Hitung EMA untuk tampilan chart
    const emaFast = visiblePrices.map(p => p.ema_fast)
    const emaSlow = visiblePrices.map(p => p.ema_slow)
    
    // Buat chart baru
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: visiblePrices.map(p => new Date(p.timestamp)),
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
            label: 'EMA 3',
            data: emaFast,
            borderColor: '#ef4444',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
          },
          {
            label: 'EMA 8',
            data: emaSlow,
            borderColor: '#10b981',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
          },
          {
            label: 'Signals',
            data: visiblePrices.map((p, idx) => {
              const signalIndex = startIdx + idx
              if (timeframeData.signals[signalIndex * 60]) {
                return timeframeData.signals[signalIndex * 60].price
              }
              return null
            }),
            pointRadius: 6,
            pointBackgroundColor: ctx => {
              const index = ctx.dataIndex
              const signalIndex = startIdx + index
              if (timeframeData.signals[signalIndex * 60]) {
                return timeframeData.signals[signalIndex * 60].type === 'buy' 
                  ? 'rgba(16, 185, 129, 0.8)' 
                  : 'rgba(239, 68, 68, 0.8)'
              }
              return 'rgba(0,0,0,0)'
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
          x: {
            type: 'time',
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(5)}`
              },
              title: function(tooltipItems) {
                return new Date(tooltipItems[0].label).toLocaleString()
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        animation: {
          duration: 0
        }
      }
    })
  }
  
  // Render equity curve chart
  const renderEquityCurve = () => {
    if (!trades.length) return null
    
    const equityPoints = [10000]
    let currentEquity = 10000
    
    trades.filter(t => t.exitPrice).forEach(trade => {
      currentEquity += trade.profit
      equityPoints.push(currentEquity)
    })
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-3">Equity Curve</h3>
        <div className="h-64">
          <canvas ref={el => {
            if (el) {
              const ctx = el.getContext('2d')
              new Chart(ctx, {
                type: 'line',
                data: {
                  labels: Array(equityPoints.length).fill(''),
                  datasets: [{
                    label: 'Equity',
                    data: equityPoints,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                    fill: true
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      display: false
                    },
                    y: {
                      beginAtZero: false
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }
              })
            }
          }} />
        </div>
      </div>
    )
  }
  
  // Render market structure visualization
  const renderMarketStructure = () => {
    if (!marketStructure.fairValueGaps.length) return null
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-3">Market Structure</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Bullish FVG: {marketStructure.fairValueGaps.filter(fvg => fvg.type === 'bullish').length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Bearish FVG: {marketStructure.fairValueGaps.filter(fvg => fvg.type === 'bearish').length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Order Blocks: {marketStructure.orderBlocks.length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Liquidity Zones: {marketStructure.liquidityZones.length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-3">Recent Signals</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trades.slice(-5).map((trade, index) => (
              <div key={index} className={`p-2 rounded ${trade.profit > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between">
                  <span className={`font-medium ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span className={`font-bold ${trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${formatNumber(trade.profit || 0)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{trade.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Inisialisasi data
  useEffect(() => {
    const initData = async () => {
      const loaded = loadStateFromLocalStorage()
      if (!loaded) {
        await loadMockData()
      }
    }
    
    initData()
    
    // Auto-save every 30 seconds
    const saveInterval = setInterval(saveStateToLocalStorage, 30000)
    
    return () => {
      clearInterval(saveInterval)
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
    }
  }, [loadMockData])
  
  // Simpan state saat perubahan
  useEffect(() => {
    saveStateToLocalStorage()
  }, [balance, equity, profit, trades, positions, tradeStats, 
      timeframeData, simulationStatus, currentTime, progress, botSettings, marketStructure])
  
  // Update chart saat data tersedia
  useEffect(() => {
    if (timeframeData.m1.length > 0) {
      updateChart()
    }
  }, [timeframeData])
  
  // Tampilkan pesan jika bukan pengguna premium
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Lock className="text-yellow-600" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            Advanced backtesting with Smart Money Concepts is available exclusively to our Premium members.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <Zap className="text-yellow-500 mr-2" />
              <span className="font-medium">Premium features include:</span>
            </div>
            <ul className="mt-2 text-left list-disc pl-6 text-gray-700">
              <li>Smart Money Concepts (SMC) integration</li>
              <li>Inner Circle Trader (ICT) strategies</li>
              <li>Advanced market structure analysis</li>
              <li>Realistic slippage modeling</li>
              <li>Detailed performance analytics</li>
            </ul>
          </div>
          <a 
            href="/dashboard/upgrade"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            Upgrade to Premium
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BarChart2 className="mr-2 text-blue-600" size={24} />
            Advanced Backtesting Dashboard
            <span className="ml-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
              SMC/ICT Pro
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Realistic trading simulation with Smart Money Concepts and Market Structure analysis
          </p>
        </div>
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
            title="Reset Simulation"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition-colors"
            onClick={exportData}
            title="Export Data"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chart and Controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart Controls */}
          <div className="bg-white p-4 border-b flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
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
                <button
                  className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  onClick={() => {
                    const now = new Date();
                    setEndDate(now);
                    setStartDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)); // 1 hari
                  }}
                >
                  1 Day
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-1 flex">
                {['M1'].map((tf) => (
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
            </div>
            
            <div className="flex space-x-2">
              {simulationStatus === 'running' ? (
                <button 
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors shadow-md"
                  onClick={stopSimulation}
                >
                  <Pause className="mr-1" size={16} />
                  Pause
                </button>
              ) : (
                <button 
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors shadow-md"
                  onClick={startSimulation}
                  disabled={simulationStatus === 'completed'}
                >
                  <Play className="mr-1" size={16} />
                  {simulationStatus === 'completed' ? 'Completed' : 'Start'}
                </button>
              )}
              
              <button 
                className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                <BarChart2 className="mr-1" size={16} />
                {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Chart Area */}
          <div className="bg-white p-4 flex-1 overflow-hidden">
            <div className="border rounded-lg h-full flex flex-col shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <CandlestickChart className="mr-2 text-blue-600" size={20} />
                  {botSettings.symbol} - {botSettings.timeframe} Chart
                  <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">
                    {botSettings.strategy}
                  </span>
                </h2>
                <div className="text-sm text-gray-500">
                  {progress.toFixed(1)}% complete
                </div>
              </div>
              <div className="flex-1 p-4 relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center p-4">
                    {isGeneratingData ? (
                      <>
                        <div className="text-blue-600 mb-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Market Data</h3>
                        <p className="text-gray-600 mb-4 text-center max-w-md">
                          Simulating realistic market conditions... This may take a moment.
                        </p>
                        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">{generationProgress}% complete</p>
                        <p className="text-xs text-gray-400 mt-4">
                          Tip: For faster testing during development, use shorter date ranges
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading market data...</span>
                      </>
                    )}
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center p-4">
                    <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Data Error</h3>
                    <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
                    <button
                      onClick={loadMockData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reload Data
                    </button>
                  </div>
                )}
                
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Stats and Settings */}
        <div className="w-96 flex flex-col border-l bg-white">
          {/* Account Summary */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wallet className="mr-2 text-blue-600" size={20} />
              Account Summary
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="text-gray-600 text-sm">Balance</div>
                <div className="text-xl font-bold">${formatNumber(balance)}</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="text-gray-600 text-sm">Equity</div>
                <div className={`text-xl font-bold ${
                  equity > balance ? 'text-green-600' : equity < balance ? 'text-red-600' : ''
                }`}>
                  ${formatNumber(equity)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="text-gray-600 text-sm">Profit</div>
                <div className={`text-xl font-bold ${
                  profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : ''
                }`}>
                  ${formatNumber(profit)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="text-gray-600 text-sm">Open Trades</div>
                <div className="text-xl font-bold">{positions.length}</div>
              </div>
            </div>
          </div>
          
          {/* Trading Stats */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart className="mr-2 text-blue-600" size={20} />
              Trading Statistics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="text-gray-600 text-sm">Total Trades</div>
                <div className="text-xl font-bold">{tradeStats.totalTrades}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="text-gray-600 text-sm">Win Rate</div>
                <div className="text-xl font-bold">{tradeStats.winRate.toFixed(1)}%</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="text-gray-600 text-sm">Profit Factor</div>
                <div className="text-xl font-bold">{tradeStats.profitFactor.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                <div className="text-gray-600 text-sm">Max Drawdown</div>
                <div className="text-xl font-bold">{tradeStats.maxDrawdown.toFixed(2)}%</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
                <div className="text-gray-600 text-sm">Avg. Profit</div>
                <div className="text-xl font-bold text-green-600">${formatNumber(tradeStats.avgProfit)}</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3 border border-rose-200">
                <div className="text-gray-600 text-sm">Avg. Loss</div>
                <div className="text-xl font-bold text-red-600">${formatNumber(tradeStats.avgLoss)}</div>
              </div>
            </div>
          </div>
          
          {/* Bot Settings */}
          <div className="p-4 flex-1 overflow-auto">
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
                
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-3 flex items-center">
                    <BookOpen className="mr-2 text-blue-600" size={16} />
                    Strategy Settings
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={botSettings.smcEnabled}
                        onChange={(e) => handleSettingChange('smcEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Enable Smart Money Concepts
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={botSettings.ictEnabled}
                        onChange={(e) => handleSettingChange('ictEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Enable ICT Strategies
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={botSettings.includeSlippage}
                        onChange={(e) => handleSettingChange('includeSlippage', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Include Slippage
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trade History and Analysis */}
        <div className="bg-white border-t">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold flex items-center">
                <RefreshCw className="mr-2 text-blue-600" size={20} />
                Trade History & Market Analysis
              </h2>
              <div className="text-sm text-gray-500">
                {trades.filter(t => t.exitPrice).length} closed trades
              </div>
            </div>
            
            {showAnalysis && (
              <>
                {renderMarketStructure()}
                {renderEquityCurve()}
              </>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trades.filter(t => t.exitPrice).map((trade, index) => (
                    <tr key={trade.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm">{formatTime(trade.entryTime)}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{trade.entryPrice.toFixed(5)}</td>
                      <td className="px-4 py-2 text-sm">{trade.exitPrice.toFixed(5)}</td>
                      <td className={`px-4 py-2 text-sm font-medium ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${formatNumber(trade.profit)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {botSettings.strategy}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className="text-xs text-gray-600">
                          {trade.reason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {trades.filter(t => t.exitPrice).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-8">
                    <BarChart className="mx-auto text-gray-400" size={40} />
                    <h3 className="mt-4 text-lg font-medium text-gray-700">No trades yet</h3>
                    <p className="text-gray-500 mt-2">Start the simulation to generate trade history</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
                    }
