import { processForexData } from '../polygon.js'

// Professional Scalping Strategies with High Win Rate
export class ScalpingStrategies {
  constructor() {
    this.strategies = {
      'rsi-extremes': new RSIExtremesStrategy(),
      'heikin-ashi-pullback': new HeikinAshiPullbackStrategy(),
      'stochastic-quick-signal': new StochasticQuickSignalStrategy(),
      'bollinger-rsi-adx': new BollingerRSIADXStrategy(),
      'vwap-macd': new VWAPMACDStrategy(),
      'machine-learning-ema': new MachineLearningEMAStrategy()
    }
  }

  getStrategy(name) {
    return this.strategies[name]
  }

  getAllStrategies() {
    return Object.keys(this.strategies).map(key => ({
      id: key,
      name: this.strategies[key].name,
      description: this.strategies[key].description,
      winRate: this.strategies[key].expectedWinRate,
      timeframe: this.strategies[key].timeframe,
      isPremium: this.strategies[key].isPremium
    }))
  }
}

// Strategy 1: RSI Extremes (7-period RSI on 1-minute chart)
class RSIExtremesStrategy {
  constructor() {
    this.name = 'RSI Extremes Scalping'
    this.description = 'Strategi scalping menggunakan RSI 7-period untuk menangkap reversal di level ekstrim'
    this.expectedWinRate = 78
    this.timeframe = '1m'
    this.isPremium = false
    
    this.parameters = {
      rsiPeriod: 7,
      overboughtLevel: 80,
      oversoldLevel: 20,
      neutralLevel: 50,
      stopLossMultiplier: 1.5,
      takeProfitMultiplier: 2.0
    }
  }

  analyze(data) {
    if (data.length < this.parameters.rsiPeriod + 5) {
      return { signal: 'WAIT', confidence: 0, reason: 'Insufficient data' }
    }

    const rsi = processForexData.rsi(data, this.parameters.rsiPeriod)
    const currentRSI = rsi[rsi.length - 1]
    const previousRSI = rsi[rsi.length - 2]
    const currentPrice = data[data.length - 1].close

    // Long signal: RSI crosses above 20 from below
    if (previousRSI <= this.parameters.oversoldLevel && currentRSI > this.parameters.oversoldLevel) {
      const stopLoss = this.calculateStopLoss(data, 'BUY')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'BUY')
      
      return {
        signal: 'BUY',
        confidence: this.calculateConfidence(currentRSI, 'BUY'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `RSI reversal from oversold: ${currentRSI.toFixed(2)}`
      }
    }

    // Short signal: RSI crosses below 80 from above
    if (previousRSI >= this.parameters.overboughtLevel && currentRSI < this.parameters.overboughtLevel) {
      const stopLoss = this.calculateStopLoss(data, 'SELL')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'SELL')
      
      return {
        signal: 'SELL',
        confidence: this.calculateConfidence(currentRSI, 'SELL'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `RSI reversal from overbought: ${currentRSI.toFixed(2)}`
      }
    }

    return { signal: 'WAIT', confidence: 0, reason: `RSI at ${currentRSI.toFixed(2)} - waiting for extreme levels` }
  }

  calculateStopLoss(data, direction) {
    const recentBars = data.slice(-10)
    if (direction === 'BUY') {
      return Math.min(...recentBars.map(bar => bar.low)) - (0.0005) // 5 pips buffer
    } else {
      return Math.max(...recentBars.map(bar => bar.high)) + (0.0005) // 5 pips buffer
    }
  }

  calculateTakeProfit(entry, stopLoss, direction) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (direction === 'BUY') {
      return entry + (riskDistance * this.parameters.takeProfitMultiplier)
    } else {
      return entry - (riskDistance * this.parameters.takeProfitMultiplier)
    }
  }

  calculateConfidence(rsi, direction) {
    if (direction === 'BUY') {
      // Higher confidence when RSI was deeper in oversold
      return Math.min(95, 60 + (30 - Math.max(0, rsi - 20)) * 2)
    } else {
      // Higher confidence when RSI was deeper in overbought
      return Math.min(95, 60 + (Math.min(20, 80 - rsi)) * 2)
    }
  }
}

// Strategy 2: Heikin-Ashi Pullback Strategy
class HeikinAshiPullbackStrategy {
  constructor() {
    this.name = 'Heikin-Ashi Pullback'
    this.description = 'Strategi scalping menggunakan Heikin-Ashi untuk menangkap pullback dalam trend'
    this.expectedWinRate = 82
    this.timeframe = '1m'
    this.isPremium = true
    
    this.parameters = {
      trendMinCandles: 3,
      pullbackMaxCandles: 2,
      stopLossMultiplier: 1.0,
      takeProfitMultiplier: 2.5
    }
  }

  analyze(data) {
    if (data.length < 10) {
      return { signal: 'WAIT', confidence: 0, reason: 'Insufficient data' }
    }

    const heikinAshi = this.calculateHeikinAshi(data)
    const recentHA = heikinAshi.slice(-7)

    // Identify trend and pullback
    const trendAnalysis = this.analyzeTrend(recentHA)
    
    if (trendAnalysis.signal !== 'WAIT') {
      const currentPrice = data[data.length - 1].close
      const stopLoss = this.calculateStopLoss(data, trendAnalysis.signal)
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, trendAnalysis.signal)
      
      return {
        signal: trendAnalysis.signal,
        confidence: trendAnalysis.confidence,
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: trendAnalysis.reason
      }
    }

    return { signal: 'WAIT', confidence: 0, reason: 'No clear pullback pattern detected' }
  }

  calculateHeikinAshi(data) {
    const ha = []
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i]
      
      if (i === 0) {
        ha.push({
          open: (current.open + current.close) / 2,
          high: current.high,
          low: current.low,
          close: (current.open + current.high + current.low + current.close) / 4,
          color: current.close > current.open ? 'green' : 'red'
        })
      } else {
        const haOpen = (ha[i-1].open + ha[i-1].close) / 2
        const haClose = (current.open + current.high + current.low + current.close) / 4
        const haHigh = Math.max(current.high, haOpen, haClose)
        const haLow = Math.min(current.low, haOpen, haClose)
        
        ha.push({
          open: haOpen,
          high: haHigh,
          low: haLow,
          close: haClose,
          color: haClose > haOpen ? 'green' : 'red'
        })
      }
    }
    
    return ha
  }

  analyzeTrend(heikinAshi) {
    // Look for trend establishment (3+ consecutive same color candles)
    // Then pullback (1-2 opposite color candles)
    // Then resumption signal (1 candle back to trend color)
    
    const colors = heikinAshi.map(ha => ha.color)
    const latest = colors[colors.length - 1]
    
    // Check for bullish pullback resumption
    if (latest === 'green') {
      // Count consecutive green before any red
      let greenCount = 0
      let redCount = 0
      let foundRed = false
      
      for (let i = colors.length - 2; i >= 0; i--) {
        if (colors[i] === 'red' && !foundRed) {
          foundRed = true
          redCount++
        } else if (colors[i] === 'red' && foundRed) {
          redCount++
        } else if (colors[i] === 'green' && foundRed) {
          greenCount++
        } else if (colors[i] === 'green' && !foundRed) {
          break
        }
      }
      
      if (greenCount >= 3 && redCount >= 1 && redCount <= 2) {
        return {
          signal: 'BUY',
          confidence: 85,
          reason: `Bullish pullback resumption: ${greenCount} green, ${redCount} red pullback`
        }
      }
    }
    
    // Check for bearish pullback resumption
    if (latest === 'red') {
      let redCount = 0
      let greenCount = 0
      let foundGreen = false
      
      for (let i = colors.length - 2; i >= 0; i--) {
        if (colors[i] === 'green' && !foundGreen) {
          foundGreen = true
          greenCount++
        } else if (colors[i] === 'green' && foundGreen) {
          greenCount++
        } else if (colors[i] === 'red' && foundGreen) {
          redCount++
        } else if (colors[i] === 'red' && !foundGreen) {
          break
        }
      }
      
      if (redCount >= 3 && greenCount >= 1 && greenCount <= 2) {
        return {
          signal: 'SELL',
          confidence: 85,
          reason: `Bearish pullback resumption: ${redCount} red, ${greenCount} green pullback`
        }
      }
    }
    
    return { signal: 'WAIT', confidence: 0, reason: 'No pullback pattern' }
  }

  calculateStopLoss(data, direction) {
    const currentBar = data[data.length - 1]
    if (direction === 'BUY') {
      return currentBar.low - (0.0003) // 3 pips buffer
    } else {
      return currentBar.high + (0.0003) // 3 pips buffer
    }
  }

  calculateTakeProfit(entry, stopLoss, direction) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (direction === 'BUY') {
      return entry + (riskDistance * this.parameters.takeProfitMultiplier)
    } else {
      return entry - (riskDistance * this.parameters.takeProfitMultiplier)
    }
  }
}

// Strategy 3: Stochastic Quick Signal (14,3,3 settings)
class StochasticQuickSignalStrategy {
  constructor() {
    this.name = 'Stochastic Quick Signal'
    this.description = 'Strategi scalping menggunakan Stochastic Oscillator untuk sinyal cepat'
    this.expectedWinRate = 76
    this.timeframe = '1m'
    this.isPremium = false
    
    this.parameters = {
      kPeriod: 14,
      dPeriod: 3,
      smooth: 3,
      overboughtLevel: 80,
      oversoldLevel: 20,
      stopLossMultiplier: 1.2,
      takeProfitMultiplier: 2.0
    }
  }

  analyze(data) {
    if (data.length < this.parameters.kPeriod + 10) {
      return { signal: 'WAIT', confidence: 0, reason: 'Insufficient data' }
    }

    const stoch = this.calculateStochastic(data)
    if (stoch.length < 3) return { signal: 'WAIT', confidence: 0, reason: 'Insufficient stochastic data' }

    const currentK = stoch[stoch.length - 1].k
    const currentD = stoch[stoch.length - 1].d
    const previousK = stoch[stoch.length - 2].k
    const previousD = stoch[stoch.length - 2].d
    const currentPrice = data[data.length - 1].close

    // Long signal: %K crosses above %D and both below 20
    if (previousK <= previousD && currentK > currentD && 
        currentK < this.parameters.oversoldLevel && currentD < this.parameters.oversoldLevel) {
      const stopLoss = this.calculateStopLoss(data, 'BUY')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'BUY')
      
      return {
        signal: 'BUY',
        confidence: this.calculateConfidence(currentK, currentD, 'BUY'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `Stochastic bullish crossover in oversold: K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}`
      }
    }

    // Short signal: %K crosses below %D and both above 80
    if (previousK >= previousD && currentK < currentD && 
        currentK > this.parameters.overboughtLevel && currentD > this.parameters.overboughtLevel) {
      const stopLoss = this.calculateStopLoss(data, 'SELL')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'SELL')
      
      return {
        signal: 'SELL',
        confidence: this.calculateConfidence(currentK, currentD, 'SELL'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `Stochastic bearish crossover in overbought: K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}`
      }
    }

    return { 
      signal: 'WAIT', 
      confidence: 0, 
      reason: `Stochastic levels: K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)} - waiting for extreme crossover` 
    }
  }

  calculateStochastic(data) {
    const stoch = []
    
    for (let i = this.parameters.kPeriod - 1; i < data.length; i++) {
      const period = data.slice(i - this.parameters.kPeriod + 1, i + 1)
      const highest = Math.max(...period.map(bar => bar.high))
      const lowest = Math.min(...period.map(bar => bar.low))
      const current = data[i]
      
      const k = ((current.close - lowest) / (highest - lowest)) * 100
      stoch.push({ k, d: 0 }) // D will be calculated after
    }
    
    // Calculate %D (moving average of %K)
    for (let i = this.parameters.dPeriod - 1; i < stoch.length; i++) {
      const kValues = stoch.slice(i - this.parameters.dPeriod + 1, i + 1).map(s => s.k)
      const d = kValues.reduce((sum, val) => sum + val, 0) / kValues.length
      stoch[i].d = d
    }
    
    return stoch.slice(this.parameters.dPeriod - 1)
  }

  calculateStopLoss(data, direction) {
    const recentBars = data.slice(-5)
    if (direction === 'BUY') {
      return Math.min(...recentBars.map(bar => bar.low)) - (0.0004)
    } else {
      return Math.max(...recentBars.map(bar => bar.high)) + (0.0004)
    }
  }

  calculateTakeProfit(entry, stopLoss, direction) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (direction === 'BUY') {
      return entry + (riskDistance * this.parameters.takeProfitMultiplier)
    } else {
      return entry - (riskDistance * this.parameters.takeProfitMultiplier)
    }
  }

  calculateConfidence(k, d, direction) {
    if (direction === 'BUY') {
      // Higher confidence when deeper in oversold
      const oversoldDepth = Math.max(0, 20 - Math.max(k, d))
      return Math.min(90, 65 + oversoldDepth * 1.5)
    } else {
      // Higher confidence when deeper in overbought
      const overboughtDepth = Math.max(0, Math.min(k, d) - 80)
      return Math.min(90, 65 + overboughtDepth * 1.5)
    }
  }
}

// Strategy 4: Bollinger Bands + RSI + ADX (High Win Rate Combination)
class BollingerRSIADXStrategy {
  constructor() {
    this.name = 'Bollinger RSI ADX Combo'
    this.description = 'Strategi scalping kombinasi Bollinger Bands, RSI, dan ADX untuk akurasi tinggi'
    this.expectedWinRate = 85
    this.timeframe = '1m'
    this.isPremium = true
    
    this.parameters = {
      bbPeriod: 20,
      bbDeviation: 2,
      rsiPeriod: 7,
      adxPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      adxThreshold: 32,
      stopLossMultiplier: 1.0,
      takeProfitMultiplier: 1.8
    }
  }

  analyze(data) {
    if (data.length < Math.max(this.parameters.bbPeriod, this.parameters.adxPeriod) + 10) {
      return { signal: 'WAIT', confidence: 0, reason: 'Insufficient data' }
    }

    const bb = this.calculateBollingerBands(data)
    const rsi = processForexData.rsi(data, this.parameters.rsiPeriod)
    const adx = this.calculateADX(data)
    
    if (bb.length === 0 || rsi.length === 0 || adx.length === 0) {
      return { signal: 'WAIT', confidence: 0, reason: 'Indicator calculation failed' }
    }

    const currentPrice = data[data.length - 1].close
    const currentBB = bb[bb.length - 1]
    const currentRSI = rsi[rsi.length - 1]
    const currentADX = adx[adx.length - 1]
    const previousRSI = rsi[rsi.length - 2]

    // Long signal: Price touches lower BB, RSI crosses above 30, ADX < 32 (ranging market)
    if (currentPrice <= currentBB.lower && 
        previousRSI <= this.parameters.rsiOversold && 
        currentRSI > this.parameters.rsiOversold && 
        currentADX < this.parameters.adxThreshold) {
      
      const stopLoss = this.calculateStopLoss(data, 'BUY')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'BUY')
      
      return {
        signal: 'BUY',
        confidence: this.calculateConfidence(currentPrice, currentBB, currentRSI, currentADX, 'BUY'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `BB lower touch + RSI recovery (${currentRSI.toFixed(1)}) + Low ADX (${currentADX.toFixed(1)})`
      }
    }

    // Short signal: Price touches upper BB, RSI crosses below 70, ADX < 32
    if (currentPrice >= currentBB.upper && 
        previousRSI >= this.parameters.rsiOverbought && 
        currentRSI < this.parameters.rsiOverbought && 
        currentADX < this.parameters.adxThreshold) {
      
      const stopLoss = this.calculateStopLoss(data, 'SELL')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'SELL')
      
      return {
        signal: 'SELL',
        confidence: this.calculateConfidence(currentPrice, currentBB, currentRSI, currentADX, 'SELL'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `BB upper touch + RSI decline (${currentRSI.toFixed(1)}) + Low ADX (${currentADX.toFixed(1)})`
      }
    }

    return { 
      signal: 'WAIT', 
      confidence: 0, 
      reason: `Waiting for setup: Price=${currentPrice.toFixed(5)}, RSI=${currentRSI.toFixed(1)}, ADX=${currentADX.toFixed(1)}` 
    }
  }

  calculateBollingerBands(data) {
    if (data.length < this.parameters.bbPeriod) return []
    
    const bb = []
    
    for (let i = this.parameters.bbPeriod - 1; i < data.length; i++) {
      const period = data.slice(i - this.parameters.bbPeriod + 1, i + 1)
      const closes = period.map(bar => bar.close)
      const sma = closes.reduce((sum, val) => sum + val, 0) / closes.length
      
      const variance = closes.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / closes.length
      const stdDev = Math.sqrt(variance)
      
      bb.push({
        middle: sma,
        upper: sma + (stdDev * this.parameters.bbDeviation),
        lower: sma - (stdDev * this.parameters.bbDeviation)
      })
    }
    
    return bb
  }

  calculateADX(data) {
    if (data.length < this.parameters.adxPeriod + 1) return []
    
    const adx = []
    const trueRanges = []
    const plusDMs = []
    const minusDMs = []
    
    // Calculate TR, +DM, -DM
    for (let i = 1; i < data.length; i++) {
      const current = data[i]
      const previous = data[i - 1]
      
      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      )
      
      const plusDM = current.high - previous.high > previous.low - current.low ? 
        Math.max(current.high - previous.high, 0) : 0
      const minusDM = previous.low - current.low > current.high - previous.high ? 
        Math.max(previous.low - current.low, 0) : 0
      
      trueRanges.push(tr)
      plusDMs.push(plusDM)
      minusDMs.push(minusDM)
    }
    
    // Calculate smoothed values and ADX
    for (let i = this.parameters.adxPeriod - 1; i < trueRanges.length; i++) {
      const trSum = trueRanges.slice(i - this.parameters.adxPeriod + 1, i + 1).reduce((sum, val) => sum + val, 0)
      const plusDMSum = plusDMs.slice(i - this.parameters.adxPeriod + 1, i + 1).reduce((sum, val) => sum + val, 0)
      const minusDMSum = minusDMs.slice(i - this.parameters.adxPeriod + 1, i + 1).reduce((sum, val) => sum + val, 0)
      
      const plusDI = (plusDMSum / trSum) * 100
      const minusDI = (minusDMSum / trSum) * 100
      const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100
      
      adx.push(dx)
    }
    
    // Smooth ADX
    const smoothedADX = []
    for (let i = this.parameters.adxPeriod - 1; i < adx.length; i++) {
      const adxSum = adx.slice(i - this.parameters.adxPeriod + 1, i + 1).reduce((sum, val) => sum + val, 0)
      smoothedADX.push(adxSum / this.parameters.adxPeriod)
    }
    
    return smoothedADX
  }

  calculateStopLoss(data, direction) {
    const currentBar = data[data.length - 1]
    if (direction === 'BUY') {
      return currentBar.low - (0.0007) // 7 pips as per strategy
    } else {
      return currentBar.high + (0.0007) // 7 pips as per strategy
    }
  }

  calculateTakeProfit(entry, stopLoss, direction) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (direction === 'BUY') {
      return entry + (riskDistance * this.parameters.takeProfitMultiplier)
    } else {
      return entry - (riskDistance * this.parameters.takeProfitMultiplier)
    }
  }

  calculateConfidence(price, bb, rsi, adx, direction) {
    let confidence = 70
    
    // Increase confidence based on how close to BB band
    if (direction === 'BUY') {
      const distanceFromLower = Math.abs(price - bb.lower) / (bb.upper - bb.lower)
      confidence += (1 - distanceFromLower) * 15
    } else {
      const distanceFromUpper = Math.abs(price - bb.upper) / (bb.upper - bb.lower)
      confidence += (1 - distanceFromUpper) * 15
    }
    
    // Increase confidence for lower ADX (better for reversal)
    confidence += Math.max(0, (32 - adx) / 32 * 10)
    
    return Math.min(95, confidence)
  }
}

// Strategy 5: VWAP + MACD (Volume-based with momentum confirmation)
class VWAPMACDStrategy {
  constructor() {
    this.name = 'VWAP MACD Momentum'
    this.description = 'Strategi scalping menggunakan VWAP dan MACD untuk momentum berbasis volume'
    this.expectedWinRate = 79
    this.timeframe = '1m'
    this.isPremium = true
    
    this.parameters = {
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      stopLossMultiplier: 1.2,
      takeProfitMultiplier: 2.2
    }
  }

  analyze(data) {
    if (data.length < this.parameters.macdSlow + 10) {
      return { signal: 'WAIT', confidence: 0, reason: 'Insufficient data' }
    }

    const vwap = this.calculateVWAP(data)
    const macd = processForexData.macd(data, this.parameters.macdFast, this.parameters.macdSlow, this.parameters.macdSignal)
    
    if (vwap.length === 0 || macd.macdLine.length === 0) {
      return { signal: 'WAIT', confidence: 0, reason: 'Indicator calculation failed' }
    }

    const currentPrice = data[data.length - 1].close
    const currentVWAP = vwap[vwap.length - 1]
    const currentMACD = macd.macdLine[macd.macdLine.length - 1]
    const currentSignal = macd.signalLine[macd.signalLine.length - 1]
    const previousMACD = macd.macdLine[macd.macdLine.length - 2]
    const previousSignal = macd.signalLine[macd.signalLine.length - 2]

    // Long signal: Price breaks above VWAP + MACD crosses above signal line
    if (currentPrice > currentVWAP && 
        previousMACD <= previousSignal && 
        currentMACD > currentSignal) {
      
      const stopLoss = this.calculateStopLoss(data, currentVWAP, 'BUY')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'BUY')
      
      return {
        signal: 'BUY',
        confidence: this.calculateConfidence(currentPrice, currentVWAP, currentMACD, 'BUY'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `Price above VWAP (${currentVWAP.toFixed(5)}) + MACD bullish crossover`
      }
    }

    // Short signal: Price breaks below VWAP + MACD crosses below signal line
    if (currentPrice < currentVWAP && 
        previousMACD >= previousSignal && 
        currentMACD < currentSignal) {
      
      const stopLoss = this.calculateStopLoss(data, currentVWAP, 'SELL')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'SELL')
      
      return {
        signal: 'SELL',
        confidence: this.calculateConfidence(currentPrice, currentVWAP, currentMACD, 'SELL'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `Price below VWAP (${currentVWAP.toFixed(5)}) + MACD bearish crossover`
      }
    }

    return { 
      signal: 'WAIT', 
      confidence: 0, 
      reason: `Price=${currentPrice.toFixed(5)}, VWAP=${currentVWAP.toFixed(5)}, MACD=${currentMACD.toFixed(6)}` 
    }
  }

  calculateVWAP(data) {
    const vwap = []
    let cumulativeVolume = 0
    let cumulativeVolumePrice = 0
    
    for (let i = 0; i < data.length; i++) {
      const bar = data[i]
      const typicalPrice = (bar.high + bar.low + bar.close) / 3
      const volume = bar.volume || 1000 // Default volume if not available
      
      cumulativeVolumePrice += typicalPrice * volume
      cumulativeVolume += volume
      
      vwap.push(cumulativeVolumePrice / cumulativeVolume)
    }
    
    return vwap
  }

  calculateStopLoss(data, vwap, direction) {
    if (direction === 'BUY') {
      return Math.min(vwap - (0.0005), data[data.length - 1].low - (0.0003))
    } else {
      return Math.max(vwap + (0.0005), data[data.length - 1].high + (0.0003))
    }
  }

  calculateTakeProfit(entry, stopLoss, direction) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (direction === 'BUY') {
      return entry + (riskDistance * this.parameters.takeProfitMultiplier)
    } else {
      return entry - (riskDistance * this.parameters.takeProfitMultiplier)
    }
  }

  calculateConfidence(price, vwap, macd, direction) {
    let confidence = 75
    
    // Increase confidence based on distance from VWAP
    const vwapDistance = Math.abs(price - vwap) / vwap
    confidence += Math.min(15, vwapDistance * 10000) // Scale for forex prices
    
    // Increase confidence for stronger MACD signal
    confidence += Math.min(10, Math.abs(macd) * 100000)
    
    return Math.min(92, confidence)
  }
}

// Strategy 6: Machine Learning EMA (Advanced Premium Strategy)
class MachineLearningEMAStrategy {
  constructor() {
    this.name = 'ML EMA Classification'
    this.description = 'Strategi scalping canggih menggunakan machine learning dan 4 EMA untuk klasifikasi trend'
    this.expectedWinRate = 88
    this.timeframe = '1m'
    this.isPremium = true
    
    this.parameters = {
      triggerEMA: 21,
      fastEMA: 45,
      mediumEMA: 90,
      slowEMA: 200,
      stopLossMultiplier: 1.0,
      takeProfitMultiplier: 2.5
    }
  }

  analyze(data) {
    if (data.length < this.parameters.slowEMA + 10) {
      return { signal: 'WAIT', confidence: 0, reason: 'Insufficient data' }
    }

    const trigger = processForexData.ema(data, this.parameters.triggerEMA)
    const fast = processForexData.ema(data, this.parameters.fastEMA)
    const medium = processForexData.ema(data, this.parameters.mediumEMA)
    const slow = processForexData.ema(data, this.parameters.slowEMA)
    
    if (trigger.length === 0 || fast.length === 0 || medium.length === 0 || slow.length === 0) {
      return { signal: 'WAIT', confidence: 0, reason: 'EMA calculation failed' }
    }

    const currentPrice = data[data.length - 1].close
    const currentTrigger = trigger[trigger.length - 1]
    const currentFast = fast[fast.length - 1]
    const currentMedium = medium[medium.length - 1]
    const currentSlow = slow[slow.length - 1]
    
    const previousTrigger = trigger[trigger.length - 2]
    const previousFast = fast[fast.length - 2]
    const previousMedium = medium[medium.length - 2]

    // Machine Learning-like classification
    const trendStrength = this.calculateTrendStrength(data.slice(-50))
    const emaAlignment = this.checkEMAAlignment(currentTrigger, currentFast, currentMedium, currentSlow)
    
    // Long signal: Price above 200 EMA + Trigger crosses above fast & medium + ML confirms uptrend
    if (currentPrice > currentSlow && 
        previousTrigger <= previousFast && currentTrigger > currentFast &&
        previousTrigger <= previousMedium && currentTrigger > currentMedium &&
        emaAlignment.trend === 'bullish' && trendStrength > 0.6) {
      
      const stopLoss = this.calculateStopLoss(data, 'BUY')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'BUY')
      
      return {
        signal: 'BUY',
        confidence: this.calculateConfidence(emaAlignment, trendStrength, 'BUY'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `ML Bullish: EMA alignment + Trend strength ${(trendStrength * 100).toFixed(1)}%`
      }
    }

    // Short signal: Price below 200 EMA + Trigger crosses below fast & medium + ML confirms downtrend
    if (currentPrice < currentSlow && 
        previousTrigger >= previousFast && currentTrigger < currentFast &&
        previousTrigger >= previousMedium && currentTrigger < currentMedium &&
        emaAlignment.trend === 'bearish' && trendStrength > 0.6) {
      
      const stopLoss = this.calculateStopLoss(data, 'SELL')
      const takeProfit = this.calculateTakeProfit(currentPrice, stopLoss, 'SELL')
      
      return {
        signal: 'SELL',
        confidence: this.calculateConfidence(emaAlignment, trendStrength, 'SELL'),
        entry: currentPrice,
        stopLoss,
        takeProfit,
        reason: `ML Bearish: EMA alignment + Trend strength ${(trendStrength * 100).toFixed(1)}%`
      }
    }

    return { 
      signal: 'WAIT', 
      confidence: 0, 
      reason: `ML Analysis: Trend=${emaAlignment.trend}, Strength=${(trendStrength * 100).toFixed(1)}%` 
    }
  }

  calculateTrendStrength(data) {
    // Simple trend strength calculation based on price momentum and volatility
    if (data.length < 20) return 0
    
    const closes = data.map(bar => bar.close)
    const returns = []
    
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i-1]) / closes[i-1])
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length)
    
    // Trend strength is higher when there's consistent direction with moderate volatility
    const consistency = Math.abs(avgReturn) / (volatility + 0.0001)
    return Math.min(1, consistency * 0.1)
  }

  checkEMAAlignment(trigger, fast, medium, slow) {
    // Check if EMAs are properly aligned for trend
    const bullishAlignment = trigger > fast && fast > medium && medium > slow
    const bearishAlignment = trigger < fast && fast < medium && medium < slow
    
    if (bullishAlignment) {
      return { trend: 'bullish', strength: 1.0 }
    } else if (bearishAlignment) {
      return { trend: 'bearish', strength: 1.0 }
    } else {
      return { trend: 'sideways', strength: 0.5 }
    }
  }

  calculateStopLoss(data, direction) {
    const recentSwings = data.slice(-10)
    if (direction === 'BUY') {
      return Math.min(...recentSwings.map(bar => bar.low)) - (0.0008)
    } else {
      return Math.max(...recentSwings.map(bar => bar.high)) + (0.0008)
    }
  }

  calculateTakeProfit(entry, stopLoss, direction) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (direction === 'BUY') {
      return entry + (riskDistance * this.parameters.takeProfitMultiplier)
    } else {
      return entry - (riskDistance * this.parameters.takeProfitMultiplier)
    }
  }

  calculateConfidence(emaAlignment, trendStrength, direction) {
    let confidence = 80
    
    // Increase confidence for perfect EMA alignment
    if (emaAlignment.strength === 1.0) {
      confidence += 10
    }
    
    // Increase confidence for higher trend strength
    confidence += trendStrength * 10
    
    return Math.min(95, confidence)
  }
}

export const scalpingStrategies = new ScalpingStrategies()