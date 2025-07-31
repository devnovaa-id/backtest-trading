import { polygonClient } from '../polygon.js'
import { scalpingStrategies } from '../strategies/scalpingStrategies.js'
import { supabase } from '../supabase.js'

export class BacktestEngine {
  constructor() {
    this.isRunning = false
    this.currentSession = null
    this.trades = []
    this.balance = 10000
    this.initialBalance = 10000
    this.maxDrawdown = 0
    this.peakBalance = 10000
    this.commission = 0.0002 // 2 pips commission per trade
  }

  async runBacktest(config) {
    try {
      this.validateConfig(config)
      this.initializeSession(config)
      
      // Get historical data from Polygon
      const data = await this.getHistoricalData(config)
      if (!data || data.length === 0) {
        throw new Error('No historical data available')
      }

      // Run backtest simulation
      const results = await this.simulate(data, config)
      
      // Save results to database
      await this.saveResults(results)
      
      return results
    } catch (error) {
      console.error('Backtest error:', error)
      throw error
    }
  }

  validateConfig(config) {
    const required = ['strategyId', 'symbol', 'startDate', 'endDate', 'initialBalance', 'timeframe']
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    if (new Date(config.startDate) >= new Date(config.endDate)) {
      throw new Error('Start date must be before end date')
    }

    if (config.initialBalance <= 0) {
      throw new Error('Initial balance must be positive')
    }
  }

  initializeSession(config) {
    this.currentSession = {
      id: `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      strategyId: config.strategyId,
      symbol: config.symbol,
      startDate: config.startDate,
      endDate: config.endDate,
      timeframe: config.timeframe,
      initialBalance: config.initialBalance,
      riskPerTrade: config.riskPerTrade || 2, // 2% risk per trade
      maxDailyLoss: config.maxDailyLoss || 5, // 5% max daily loss
      createdAt: new Date()
    }

    this.balance = config.initialBalance
    this.initialBalance = config.initialBalance
    this.peakBalance = config.initialBalance
    this.maxDrawdown = 0
    this.trades = []
    this.isRunning = true
  }

  async getHistoricalData(config) {
    try {
      const { symbol, startDate, endDate, timeframe } = config
      
      // Convert timeframe to Polygon format
      const [multiplier, timespan] = this.parseTimeframe(timeframe)
      
      console.log(`Fetching data for ${symbol} from ${startDate} to ${endDate}`)
      
      const data = await polygonClient.getBacktestData(
        symbol,
        startDate,
        endDate,
        `${multiplier}/${timespan}`
      )

      if (!data || data.length === 0) {
        throw new Error(`No data available for ${symbol} in the specified date range`)
      }

      console.log(`Retrieved ${data.length} data points`)
      return data
    } catch (error) {
      console.error('Error fetching historical data:', error)
      throw error
    }
  }

  parseTimeframe(timeframe) {
    const timeframeMap = {
      '1m': [1, 'minute'],
      '5m': [5, 'minute'],
      '15m': [15, 'minute'],
      '30m': [30, 'minute'],
      '1h': [1, 'hour'],
      '4h': [4, 'hour'],
      '1d': [1, 'day']
    }

    if (!timeframeMap[timeframe]) {
      throw new Error(`Unsupported timeframe: ${timeframe}`)
    }

    return timeframeMap[timeframe]
  }

  async simulate(data, config) {
    const strategy = scalpingStrategies.getStrategy(config.strategyId)
    if (!strategy) {
      throw new Error(`Strategy not found: ${config.strategyId}`)
    }

    console.log(`Starting backtest with ${strategy.name}`)
    
    let currentTrade = null
    let dailyPnL = 0
    let lastTradeDate = null
    let consecutiveLosses = 0
    let maxConsecutiveLosses = 0
    
    // Risk management parameters
    const riskPerTrade = config.riskPerTrade / 100
    const maxDailyLoss = config.maxDailyLoss / 100
    
    for (let i = 200; i < data.length; i++) { // Start after 200 bars for indicators
      const currentBar = data[i]
      const historicalData = data.slice(0, i + 1)
      const currentDate = new Date(currentBar.timestamp).toDateString()
      
      // Reset daily P&L if new day
      if (lastTradeDate && lastTradeDate !== currentDate) {
        dailyPnL = 0
      }
      lastTradeDate = currentDate
      
      // Check daily loss limit
      if (Math.abs(dailyPnL) >= this.balance * maxDailyLoss) {
        continue // Skip trading for the rest of the day
      }

      // Close existing trade if conditions are met
      if (currentTrade) {
        const closeResult = this.checkTradeExit(currentTrade, currentBar, strategy)
        if (closeResult.shouldClose) {
          const trade = this.closeTrade(currentTrade, currentBar, closeResult.reason)
          this.trades.push(trade)
          
          dailyPnL += trade.pnl
          
          if (trade.pnl < 0) {
            consecutiveLosses++
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses)
          } else {
            consecutiveLosses = 0
          }
          
          currentTrade = null
        }
      }

      // Look for new trade opportunities
      if (!currentTrade && consecutiveLosses < 3) { // Stop after 3 consecutive losses
        try {
          const signal = strategy.analyze(historicalData)
          
          if (signal.signal !== 'WAIT' && signal.confidence >= 70) {
            const positionSize = this.calculatePositionSize(
              signal.entry,
              signal.stopLoss,
              riskPerTrade
            )
            
            if (positionSize > 0) {
              currentTrade = this.openTrade(signal, currentBar, positionSize)
            }
          }
        } catch (error) {
          console.warn(`Strategy analysis error at bar ${i}:`, error.message)
        }
      }

      // Update drawdown
      this.updateDrawdown()
    }

    // Close any remaining trade
    if (currentTrade) {
      const trade = this.closeTrade(currentTrade, data[data.length - 1], 'Session end')
      this.trades.push(trade)
    }

    return this.calculateResults()
  }

  calculatePositionSize(entry, stopLoss, riskPerTrade) {
    const riskAmount = this.balance * riskPerTrade
    const riskDistance = Math.abs(entry - stopLoss)
    
    if (riskDistance === 0) return 0
    
    // For forex, position size in lots (1 lot = 100,000 units)
    const positionSize = riskAmount / (riskDistance * 100000)
    
    // Minimum 0.01 lots, maximum 10 lots
    return Math.max(0.01, Math.min(10, positionSize))
  }

  openTrade(signal, bar, positionSize) {
    const trade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      direction: signal.signal,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      positionSize,
      entryTime: bar.timestamp,
      confidence: signal.confidence,
      reason: signal.reason,
      status: 'OPEN'
    }

    console.log(`Opening ${trade.direction} trade at ${trade.entry} (SL: ${trade.stopLoss}, TP: ${trade.takeProfit})`)
    return trade
  }

  checkTradeExit(trade, bar, strategy) {
    // Check stop loss
    if (trade.direction === 'BUY' && bar.low <= trade.stopLoss) {
      return { shouldClose: true, reason: 'Stop Loss', price: trade.stopLoss }
    }
    if (trade.direction === 'SELL' && bar.high >= trade.stopLoss) {
      return { shouldClose: true, reason: 'Stop Loss', price: trade.stopLoss }
    }

    // Check take profit
    if (trade.direction === 'BUY' && bar.high >= trade.takeProfit) {
      return { shouldClose: true, reason: 'Take Profit', price: trade.takeProfit }
    }
    if (trade.direction === 'SELL' && bar.low <= trade.takeProfit) {
      return { shouldClose: true, reason: 'Take Profit', price: trade.takeProfit }
    }

    // Check for strategy-specific exit conditions
    // This could be enhanced with trailing stops, time-based exits, etc.
    
    return { shouldClose: false }
  }

  closeTrade(trade, bar, reason, price = null) {
    const exitPrice = price || bar.close
    const pips = this.calculatePips(trade.entry, exitPrice, trade.direction)
    const grossPnL = pips * trade.positionSize * 10 // $10 per pip per lot
    const commission = this.commission * trade.positionSize * 100000 // Commission per unit
    const netPnL = grossPnL - commission

    this.balance += netPnL

    const closedTrade = {
      ...trade,
      exit: exitPrice,
      exitTime: bar.timestamp,
      exitReason: reason,
      pips,
      grossPnL,
      commission,
      pnl: netPnL,
      status: 'CLOSED',
      duration: bar.timestamp - trade.entryTime
    }

    console.log(`Closing ${trade.direction} trade: ${pips.toFixed(1)} pips, P&L: $${netPnL.toFixed(2)}`)
    return closedTrade
  }

  calculatePips(entry, exit, direction) {
    const difference = direction === 'BUY' ? exit - entry : entry - exit
    return difference * 10000 // Convert to pips (for 4-decimal currencies)
  }

  updateDrawdown() {
    if (this.balance > this.peakBalance) {
      this.peakBalance = this.balance
    }
    
    const currentDrawdown = (this.peakBalance - this.balance) / this.peakBalance
    this.maxDrawdown = Math.max(this.maxDrawdown, currentDrawdown)
  }

  calculateResults() {
    const winningTrades = this.trades.filter(t => t.pnl > 0)
    const losingTrades = this.trades.filter(t => t.pnl < 0)
    const totalTrades = this.trades.length

    if (totalTrades === 0) {
      return {
        sessionId: this.currentSession.id,
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        finalBalance: this.initialBalance,
        maxDrawdown: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        trades: []
      }
    }

    const totalPnL = this.trades.reduce((sum, trade) => sum + trade.pnl, 0)
    const winRate = (winningTrades.length / totalTrades) * 100
    
    const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 1

    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0

    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0

    // Calculate Sharpe Ratio (simplified)
    const returns = this.trades.map(t => t.pnl / this.initialBalance)
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length)
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // Annualized

    const results = {
      sessionId: this.currentSession.id,
      strategy: this.currentSession.strategyId,
      symbol: this.currentSession.symbol,
      timeframe: this.currentSession.timeframe,
      startDate: this.currentSession.startDate,
      endDate: this.currentSession.endDate,
      initialBalance: this.initialBalance,
      finalBalance: this.balance,
      totalPnL,
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      profitFactor,
      maxDrawdown: this.maxDrawdown * 100, // Convert to percentage
      sharpeRatio,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      avgTradeDuration: this.trades.reduce((sum, t) => sum + t.duration, 0) / totalTrades,
      totalPips: this.trades.reduce((sum, t) => sum + t.pips, 0),
      trades: this.trades,
      createdAt: new Date(),
      status: 'completed'
    }

    console.log('Backtest Results:')
    console.log(`Total Trades: ${totalTrades}`)
    console.log(`Win Rate: ${winRate.toFixed(2)}%`)
    console.log(`Total P&L: $${totalPnL.toFixed(2)}`)
    console.log(`Profit Factor: ${profitFactor.toFixed(2)}`)
    console.log(`Max Drawdown: ${(this.maxDrawdown * 100).toFixed(2)}%`)
    console.log(`Sharpe Ratio: ${sharpeRatio.toFixed(2)}`)

    return results
  }

  async saveResults(results) {
    try {
      // Save backtest session
      const { data: session, error: sessionError } = await supabase
        .from('backtest_sessions')
        .insert({
          id: results.sessionId,
          user_id: results.userId, // This should be passed from the frontend
          strategy_id: results.strategy,
          trading_pair_id: results.tradingPairId, // This should be resolved from symbol
          name: `${results.strategy} - ${results.symbol}`,
          description: `Backtest from ${results.startDate} to ${results.endDate}`,
          start_date: results.startDate,
          end_date: results.endDate,
          initial_balance: results.initialBalance,
          final_balance: results.finalBalance,
          total_trades: results.totalTrades,
          winning_trades: results.winningTrades,
          losing_trades: results.losingTrades,
          win_rate: results.winRate,
          profit_loss: results.totalPnL,
          profit_factor: results.profitFactor,
          max_drawdown: results.maxDrawdown,
          sharpe_ratio: results.sharpeRatio,
          status: 'completed',
          results: JSON.stringify(results)
        })
        .select()

      if (sessionError) {
        console.error('Error saving backtest session:', sessionError)
        return
      }

      // Save individual trades
      if (results.trades.length > 0) {
        const tradesData = results.trades.map((trade, index) => ({
          backtest_session_id: results.sessionId,
          trade_number: index + 1,
          entry_time: new Date(trade.entryTime),
          exit_time: new Date(trade.exitTime),
          trade_type: trade.direction.toLowerCase(),
          entry_price: trade.entry,
          exit_price: trade.exit,
          lot_size: trade.positionSize,
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          profit_loss: trade.pnl,
          pips: trade.pips,
          commission: trade.commission,
          status: 'closed',
          exit_reason: trade.exitReason
        }))

        const { error: tradesError } = await supabase
          .from('backtest_trades')
          .insert(tradesData)

        if (tradesError) {
          console.error('Error saving backtest trades:', tradesError)
        }
      }

      console.log('Backtest results saved successfully')
    } catch (error) {
      console.error('Error saving backtest results:', error)
    }
  }

  // Real-time backtest monitoring
  getProgress() {
    return {
      isRunning: this.isRunning,
      currentBalance: this.balance,
      totalTrades: this.trades.length,
      currentDrawdown: this.maxDrawdown * 100,
      sessionId: this.currentSession?.id
    }
  }

  stop() {
    this.isRunning = false
    console.log('Backtest stopped by user')
  }
}

// Portfolio analysis utilities
export class PortfolioAnalyzer {
  static calculateMetrics(trades) {
    if (!trades || trades.length === 0) {
      return null
    }

    const winningTrades = trades.filter(t => t.profit_loss > 0)
    const losingTrades = trades.filter(t => t.profit_loss < 0)
    
    const totalPnL = trades.reduce((sum, t) => sum + t.profit_loss, 0)
    const winRate = (winningTrades.length / trades.length) * 100
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit_loss, 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit_loss, 0))
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalPnL,
      grossProfit,
      grossLoss,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 1,
      avgWin: winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? grossLoss / losingTrades.length : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit_loss)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit_loss)) : 0,
      totalPips: trades.reduce((sum, t) => sum + t.pips, 0)
    }
  }

  static generateEquityCurve(trades, initialBalance = 10000) {
    const curve = [{ timestamp: new Date(), balance: initialBalance }]
    let runningBalance = initialBalance

    trades.forEach(trade => {
      runningBalance += trade.profit_loss
      curve.push({
        timestamp: new Date(trade.exit_time),
        balance: runningBalance,
        trade: trade
      })
    })

    return curve
  }

  static calculateDrawdown(equityCurve) {
    let peak = equityCurve[0].balance
    let maxDrawdown = 0
    const drawdownCurve = []

    equityCurve.forEach(point => {
      if (point.balance > peak) {
        peak = point.balance
      }
      
      const drawdown = (peak - point.balance) / peak * 100
      maxDrawdown = Math.max(maxDrawdown, drawdown)
      
      drawdownCurve.push({
        timestamp: point.timestamp,
        drawdown,
        peak
      })
    })

    return { maxDrawdown, drawdownCurve }
  }
}

export const backtestEngine = new BacktestEngine()