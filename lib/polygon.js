import axios from 'axios'

const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const BASE_URL = 'https://api.polygon.io'

class PolygonClient {
  constructor() {
    this.apiKey = POLYGON_API_KEY
    this.baseURL = BASE_URL
  }

  // Get real-time forex data
  async getForexTicker(from, to) {
    try {
      const response = await axios.get(`${this.baseURL}/v1/last/currencies/${from}/${to}`, {
        params: {
          apikey: this.apiKey
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching forex ticker:', error)
      throw error
    }
  }

  // Get historical forex data (aggregates/bars)
  async getForexAggregates(ticker, multiplier, timespan, from, to, options = {}) {
    try {
      const params = {
        apikey: this.apiKey,
        adjusted: options.adjusted || true,
        sort: options.sort || 'asc',
        limit: options.limit || 5000
      }

      const response = await axios.get(
        `${this.baseURL}/v2/aggs/ticker/C:${ticker}/${multiplier}/${timespan}/${from}/${to}`,
        { params }
      )
      
      return response.data
    } catch (error) {
      console.error('Error fetching forex aggregates:', error)
      throw error
    }
  }

  // Get forex market status
  async getForexMarketStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/v1/marketstatus/currencies`, {
        params: {
          apikey: this.apiKey
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching market status:', error)
      throw error
    }
  }

  // Get previous close for forex pair
  async getForexPreviousClose(ticker) {
    try {
      const response = await axios.get(`${this.baseURL}/v2/aggs/ticker/C:${ticker}/prev`, {
        params: {
          apikey: this.apiKey,
          adjusted: true
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching previous close:', error)
      throw error
    }
  }

  // Get grouped daily data for all forex pairs
  async getForexGroupedDaily(date) {
    try {
      const response = await axios.get(`${this.baseURL}/v2/aggs/grouped/locale/global/market/fx/${date}`, {
        params: {
          apikey: this.apiKey,
          adjusted: true
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching grouped daily data:', error)
      throw error
    }
  }

  // Convert forex symbol to Polygon format (EUR/USD -> EURUSD)
  formatForexSymbol(symbol) {
    return symbol.replace('/', '')
  }

  // Convert Polygon format back to standard (EURUSD -> EUR/USD)
  parseForexSymbol(symbol) {
    if (symbol.length === 6) {
      return `${symbol.slice(0, 3)}/${symbol.slice(3)}`
    }
    return symbol
  }

  // Get real-time quotes for multiple pairs
  async getMultipleForexQuotes(symbols) {
    const promises = symbols.map(symbol => 
      this.getForexTicker(symbol.slice(0, 3), symbol.slice(4))
    )
    
    try {
      const results = await Promise.allSettled(promises)
      return results.map((result, index) => ({
        symbol: symbols[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }))
    } catch (error) {
      console.error('Error fetching multiple quotes:', error)
      throw error
    }
  }

  // Get historical data for backtesting
  async getBacktestData(symbol, startDate, endDate, timeframe = '1/minute') {
    const [multiplier, timespan] = timeframe.split('/')
    const formattedSymbol = this.formatForexSymbol(symbol)
    
    try {
      const data = await this.getForexAggregates(
        formattedSymbol,
        parseInt(multiplier),
        timespan,
        startDate,
        endDate,
        { limit: 50000 }
      )

      // Transform data to OHLCV format
      if (data.results) {
        return data.results.map(bar => ({
          timestamp: new Date(bar.t),
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v || 0
        }))
      }

      return []
    } catch (error) {
      console.error('Error fetching backtest data:', error)
      throw error
    }
  }
}

export const polygonClient = new PolygonClient()

// Helper functions for data processing
export const processForexData = {
  // Calculate simple moving average
  sma: (data, period) => {
    const result = []
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0)
      result.push(sum / period)
    }
    return result
  },

  // Calculate exponential moving average
  ema: (data, period) => {
    const multiplier = 2 / (period + 1)
    const result = [data[0].close]
    
    for (let i = 1; i < data.length; i++) {
      const ema = (data[i].close * multiplier) + (result[i - 1] * (1 - multiplier))
      result.push(ema)
    }
    return result
  },

  // Calculate RSI
  rsi: (data, period = 14) => {
    const changes = []
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i].close - data[i - 1].close)
    }

    const gains = changes.map(change => change > 0 ? change : 0)
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0)

    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

    const rsiValues = []
    
    for (let i = period; i < changes.length; i++) {
      const rs = avgGain / avgLoss
      const rsi = 100 - (100 / (1 + rs))
      rsiValues.push(rsi)

      avgGain = (avgGain * (period - 1) + gains[i]) / period
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    }

    return rsiValues
  },

  // Calculate MACD
  macd: (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const fastEMA = processForexData.ema(data, fastPeriod)
    const slowEMA = processForexData.ema(data, slowPeriod)
    
    const macdLine = []
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i])
    }

    const signalLine = processForexData.ema(
      macdLine.map(val => ({ close: val })), 
      signalPeriod
    )

    const histogram = []
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      histogram.push(macdLine[i] - signalLine[i])
    }

    return { macdLine, signalLine, histogram }
  }
}