-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading pairs table
CREATE TABLE trading_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT UNIQUE NOT NULL, -- e.g., 'EUR/USD', 'GBP/USD'
  base_currency TEXT NOT NULL,
  quote_currency TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  min_lot_size DECIMAL(10,5) DEFAULT 0.01,
  max_lot_size DECIMAL(10,2) DEFAULT 100.00,
  pip_size DECIMAL(10,8) DEFAULT 0.0001,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading strategies table
CREATE TABLE trading_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('scalping', 'day_trading', 'swing', 'position')),
  parameters JSONB NOT NULL DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  win_rate DECIMAL(5,2),
  profit_factor DECIMAL(8,2),
  max_drawdown DECIMAL(5,2),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backtest sessions table
CREATE TABLE backtest_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  strategy_id UUID REFERENCES trading_strategies(id) NOT NULL,
  trading_pair_id UUID REFERENCES trading_pairs(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
  final_balance DECIMAL(15,2),
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  profit_loss DECIMAL(15,2),
  profit_factor DECIMAL(8,2),
  max_drawdown DECIMAL(5,2),
  sharpe_ratio DECIMAL(8,4),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual trades from backtests
CREATE TABLE backtest_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_session_id UUID REFERENCES backtest_sessions(id) NOT NULL,
  trade_number INTEGER NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  entry_price DECIMAL(12,6) NOT NULL,
  exit_price DECIMAL(12,6),
  lot_size DECIMAL(10,5) NOT NULL,
  stop_loss DECIMAL(12,6),
  take_profit DECIMAL(12,6),
  profit_loss DECIMAL(15,2),
  pips DECIMAL(8,2),
  commission DECIMAL(10,2) DEFAULT 0,
  swap DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  exit_reason TEXT, -- 'take_profit', 'stop_loss', 'manual', 'strategy_signal'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live trading sessions (for future implementation)
CREATE TABLE live_trading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  strategy_id UUID REFERENCES trading_strategies(id) NOT NULL,
  trading_pair_id UUID REFERENCES trading_pairs(id) NOT NULL,
  name TEXT NOT NULL,
  broker_account TEXT,
  initial_balance DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2),
  is_active BOOLEAN DEFAULT false,
  risk_per_trade DECIMAL(5,2) DEFAULT 2.00, -- percentage
  max_daily_loss DECIMAL(5,2) DEFAULT 5.00, -- percentage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market data cache (for Polygon API data)
CREATE TABLE market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trading_pair_id UUID REFERENCES trading_pairs(id) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  timeframe TEXT NOT NULL, -- '1m', '5m', '15m', '1h', '4h', '1d'
  open_price DECIMAL(12,6) NOT NULL,
  high_price DECIMAL(12,6) NOT NULL,
  low_price DECIMAL(12,6) NOT NULL,
  close_price DECIMAL(12,6) NOT NULL,
  volume BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trading_pair_id, timestamp, timeframe)
);

-- User activity logs
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  features JSONB NOT NULL DEFAULT '{}',
  max_backtests INTEGER,
  max_strategies INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_backtest_sessions_user_id ON backtest_sessions(user_id);
CREATE INDEX idx_backtest_trades_session_id ON backtest_trades(backtest_session_id);
CREATE INDEX idx_market_data_pair_timestamp ON market_data(trading_pair_id, timestamp);
CREATE INDEX idx_market_data_timeframe ON market_data(timeframe);
CREATE INDEX idx_user_activity_user_id ON user_activity_logs(user_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_trading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can view own backtest sessions" ON backtest_sessions FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can create own backtest sessions" ON backtest_sessions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can update own backtest sessions" ON backtest_sessions FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Insert default trading pairs
INSERT INTO trading_pairs (symbol, base_currency, quote_currency) VALUES
('EUR/USD', 'EUR', 'USD'),
('GBP/USD', 'GBP', 'USD'),
('USD/JPY', 'USD', 'JPY'),
('USD/CHF', 'USD', 'CHF'),
('AUD/USD', 'AUD', 'USD'),
('USD/CAD', 'USD', 'CAD'),
('NZD/USD', 'NZD', 'USD'),
('EUR/GBP', 'EUR', 'GBP'),
('EUR/JPY', 'EUR', 'JPY'),
('GBP/JPY', 'GBP', 'JPY');

-- Orders table for subscription purchases
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')),
  payment_method TEXT,
  payment_details JSONB DEFAULT '{}',
  notes TEXT,
  admin_notes TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog system tables
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES blog_categories(id),
  author_id UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  parent_id UUID REFERENCES blog_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin activity logs
CREATE TABLE admin_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_admin_activities_admin_id ON admin_activities(admin_id);

-- RLS Policies for new tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Published posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Approved comments are viewable by everyone" ON blog_comments FOR SELECT USING (status = 'approved');

-- Insert default data
INSERT INTO blog_categories (name, slug, description) VALUES
('Trading Tips', 'trading-tips', 'Tips dan trik trading forex untuk pemula dan profesional'),
('Market Analysis', 'market-analysis', 'Analisis pasar forex dan prediksi pergerakan mata uang'),
('Strategy Guide', 'strategy-guide', 'Panduan lengkap strategi trading yang profitable'),
('Platform Updates', 'platform-updates', 'Update terbaru fitur dan peningkatan platform'),
('Education', 'education', 'Edukasi dasar trading forex dan manajemen risiko');

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, max_backtests, max_strategies) VALUES
('Free', 'Plan gratis dengan fitur terbatas', 0.00, 'monthly', '{"basic_backtests": true, "basic_strategies": 3}', 10, 3),
('Premium', 'Plan premium dengan fitur lengkap', 199000.00, 'monthly', '{"unlimited_backtests": true, "advanced_strategies": true, "real_time_data": true, "premium_support": true}', -1, -1),
('Premium Yearly', 'Plan premium tahunan dengan diskon', 1990000.00, 'yearly', '{"unlimited_backtests": true, "advanced_strategies": true, "real_time_data": true, "premium_support": true}', -1, -1),
('Professional', 'Plan profesional untuk trader advanced', 499000.00, 'monthly', '{"everything": true, "priority_support": true, "custom_strategies": true, "api_access": true}', -1, -1),
('Professional Yearly', 'Plan profesional tahunan dengan diskon', 4990000.00, 'yearly', '{"everything": true, "priority_support": true, "custom_strategies": true, "api_access": true}', -1, -1);