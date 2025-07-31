'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Camera,
  MapPin,
  Calendar,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'

const tabs = [
  { id: 'profile', name: 'Profil', icon: User },
  { id: 'account', name: 'Akun', icon: Shield },
  { id: 'trading', name: 'Trading', icon: TrendingUp },
  { id: 'notifications', name: 'Notifikasi', icon: Bell },
  { id: 'security', name: 'Keamanan', icon: Lock }
]

function TabButton({ tab, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <tab.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
      {tab.name}
    </button>
  )
}

function ProfileTab() {
  const { user } = useUser()
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: user?.phoneNumbers[0]?.phoneNumber || '',
    bio: '',
    location: '',
    website: '',
    company: '',
    jobTitle: '',
    birthDate: '',
    timezone: 'Asia/Jakarta'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In real app, this would update user profile via API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Profil berhasil diperbarui!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Terjadi kesalahan saat menyimpan profil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Profil</h3>
        
        {/* Profile Picture */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <img
              src={user?.imageUrl || '/api/placeholder/80/80'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Foto Profil</h4>
            <p className="text-sm text-gray-500">JPG, GIF atau PNG. Maksimal 1MB.</p>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
              Upload foto baru
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Depan
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Belakang
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              placeholder="Jakarta, Indonesia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Asia/Jakarta">WIB (GMT+7)</option>
              <option value="Asia/Makassar">WITA (GMT+8)</option>
              <option value="Asia/Jayapura">WIT (GMT+9)</option>
              <option value="America/New_York">EST (GMT-5)</option>
              <option value="Europe/London">GMT (GMT+0)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            rows={4}
            placeholder="Ceritakan sedikit tentang diri Anda..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.includes('berhasil') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.includes('berhasil') ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}

function TradingTab() {
  const [tradingSettings, setTradingSettings] = useState({
    riskPerTrade: 2,
    maxDailyLoss: 5,
    defaultLotSize: 0.1,
    autoStopLoss: true,
    autoTakeProfit: true,
    slippage: 3,
    tradingStyle: 'scalping',
    preferredPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    tradingHours: {
      start: '08:00',
      end: '17:00'
    }
  })

  const handleSave = async () => {
    // Save trading settings
    console.log('Saving trading settings:', tradingSettings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Trading</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk per Trade (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={tradingSettings.riskPerTrade}
              onChange={(e) => setTradingSettings({...tradingSettings, riskPerTrade: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Persentase modal yang dirisiko per trade</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Daily Loss (%)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.5"
              value={tradingSettings.maxDailyLoss}
              onChange={(e) => setTradingSettings({...tradingSettings, maxDailyLoss: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Maksimal kerugian harian</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Lot Size
            </label>
            <select
              value={tradingSettings.defaultLotSize}
              onChange={(e) => setTradingSettings({...tradingSettings, defaultLotSize: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0.01}>0.01 (Micro Lot)</option>
              <option value={0.1}>0.1 (Mini Lot)</option>
              <option value={1}>1.0 (Standard Lot)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trading Style
            </label>
            <select
              value={tradingSettings.tradingStyle}
              onChange={(e) => setTradingSettings({...tradingSettings, tradingStyle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scalping">Scalping</option>
              <option value="day_trading">Day Trading</option>
              <option value="swing">Swing Trading</option>
              <option value="position">Position Trading</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pengaturan Otomatis
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto Stop Loss</h4>
                <p className="text-sm text-gray-500">Otomatis set stop loss pada setiap trade</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tradingSettings.autoStopLoss}
                  onChange={(e) => setTradingSettings({...tradingSettings, autoStopLoss: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto Take Profit</h4>
                <p className="text-sm text-gray-500">Otomatis set take profit pada setiap trade</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tradingSettings.autoTakeProfit}
                  onChange={(e) => setTradingSettings({...tradingSettings, autoTakeProfit: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email: {
      tradingSignals: true,
      backtestComplete: true,
      accountUpdates: true,
      newsletter: false
    },
    push: {
      tradingSignals: true,
      priceAlerts: true,
      systemNotifications: true
    },
    sms: {
      criticalAlerts: false,
      accountSecurity: true
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferensi Notifikasi</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Notifications
            </h4>
            <div className="space-y-3 pl-7">
              {Object.entries(notifications.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {key === 'tradingSignals' && 'Trading Signals'}
                      {key === 'backtestComplete' && 'Backtest Complete'}
                      {key === 'accountUpdates' && 'Account Updates'}
                      {key === 'newsletter' && 'Newsletter'}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {key === 'tradingSignals' && 'Notifikasi sinyal trading baru'}
                      {key === 'backtestComplete' && 'Notifikasi saat backtest selesai'}
                      {key === 'accountUpdates' && 'Update akun dan pembayaran'}
                      {key === 'newsletter' && 'Newsletter mingguan dan tips trading'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        email: { ...notifications.email, [key]: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Push Notifications
            </h4>
            <div className="space-y-3 pl-7">
              {Object.entries(notifications.push).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {key === 'tradingSignals' && 'Trading Signals'}
                      {key === 'priceAlerts' && 'Price Alerts'}
                      {key === 'systemNotifications' && 'System Notifications'}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {key === 'tradingSignals' && 'Push notification untuk sinyal trading'}
                      {key === 'priceAlerts' && 'Alert pergerakan harga penting'}
                      {key === 'systemNotifications' && 'Notifikasi sistem dan maintenance'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        push: { ...notifications.push, [key]: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Simpan Preferensi
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />
      case 'trading':
        return <TradingTab />
      case 'notifications':
        return <NotificationsTab />
      default:
        return <ProfileTab />
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="w-7 h-7 mr-3" />
          Pengaturan Akun
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola profil, preferensi trading, dan pengaturan keamanan Anda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}