'use client'

import { useState } from 'react'
import { Check, Crown, Zap, Shield, TrendingUp, Users, Headphones, Star } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const plans = {
  monthly: [
    {
      id: 'free',
      name: 'Gratis',
      price: 0,
      originalPrice: 0,
      period: 'Selamanya',
      description: 'Untuk pemula yang ingin mencoba',
      features: [
        '10 backtest per bulan',
        '3 strategi dasar',
        'Data historis 1 tahun',
        'Support email',
        'Dashboard dasar',
        'Komunitas forum'
      ],
      limitations: [
        'Tidak ada data real-time',
        'Strategi terbatas',
        'Support lambat'
      ],
      color: 'gray',
      buttonText: 'Paket Aktif',
      disabled: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 199000,
      originalPrice: 299000,
      period: 'per bulan',
      description: 'Untuk trader serius',
      features: [
        'Unlimited backtest',
        'Semua 6 strategi premium',
        'Data real-time Polygon',
        'Advanced analytics',
        'Risk management tools',
        'Priority support',
        'Trading signals',
        'Mobile notifications',
        'Export data',
        'Custom indicators'
      ],
      popular: true,
      color: 'blue',
      buttonText: 'Pilih Premium',
      savings: 'Hemat 33%'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 499000,
      originalPrice: 699000,
      period: 'per bulan',
      description: 'Untuk trader profesional',
      features: [
        'Semua fitur Premium',
        'Custom strategies builder',
        'API access',
        'White-label solution',
        'Dedicated account manager',
        '1-on-1 trading consultation',
        'Advanced backtesting',
        'Portfolio management',
        'Multi-account support',
        'Custom reports'
      ],
      color: 'purple',
      buttonText: 'Pilih Professional',
      savings: 'Hemat 29%'
    }
  ],
  yearly: [
    {
      id: 'free',
      name: 'Gratis',
      price: 0,
      originalPrice: 0,
      period: 'Selamanya',
      description: 'Untuk pemula yang ingin mencoba',
      features: [
        '10 backtest per bulan',
        '3 strategi dasar',
        'Data historis 1 tahun',
        'Support email',
        'Dashboard dasar',
        'Komunitas forum'
      ],
      limitations: [
        'Tidak ada data real-time',
        'Strategi terbatas',
        'Support lambat'
      ],
      color: 'gray',
      buttonText: 'Paket Aktif',
      disabled: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1990000,
      originalPrice: 3588000,
      period: 'per tahun',
      description: 'Untuk trader serius',
      features: [
        'Unlimited backtest',
        'Semua 6 strategi premium',
        'Data real-time Polygon',
        'Advanced analytics',
        'Risk management tools',
        'Priority support',
        'Trading signals',
        'Mobile notifications',
        'Export data',
        'Custom indicators'
      ],
      popular: true,
      color: 'blue',
      buttonText: 'Pilih Premium',
      savings: 'Hemat 45% (2 bulan gratis!)',
      yearlyDiscount: true
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 4990000,
      originalPrice: 8388000,
      period: 'per tahun',
      description: 'Untuk trader profesional',
      features: [
        'Semua fitur Premium',
        'Custom strategies builder',
        'API access',
        'White-label solution',
        'Dedicated account manager',
        '1-on-1 trading consultation',
        'Advanced backtesting',
        'Portfolio management',
        'Multi-account support',
        'Custom reports'
      ],
      color: 'purple',
      buttonText: 'Pilih Professional',
      savings: 'Hemat 40% (3 bulan gratis!)',
      yearlyDiscount: true
    }
  ]
}

const testimonials = [
  {
    name: 'Ahmad Rizki',
    role: 'Day Trader',
    image: '/api/placeholder/40/40',
    content: 'Sejak menggunakan ForexBot Pro Premium, profit saya meningkat 300%. Strategi ML EMA benar-benar luar biasa!',
    rating: 5
  },
  {
    name: 'Sari Dewi',
    role: 'Swing Trader',
    image: '/api/placeholder/40/40',
    content: 'Data real-time dari Polygon sangat akurat. Backtest engine-nya membantu saya mengoptimalkan strategi dengan sempurna.',
    rating: 5
  },
  {
    name: 'Budi Santoso',
    role: 'Professional Trader',
    image: '/api/placeholder/40/40',
    content: 'Paket Professional worth every penny. API access dan custom strategies builder menghemat waktu saya berjam-jam.',
    rating: 5
  }
]

function PricingCard({ plan, billingCycle, onSelect, isLoading }) {
  const getColorClasses = (color, isPopular = false) => {
    const colors = {
      gray: {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        button: 'bg-gray-300 text-gray-500 cursor-not-allowed'
      },
      blue: {
        border: isPopular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      purple: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        button: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
      }
    }
    return colors[color] || colors.gray
  }

  const colorClasses = getColorClasses(plan.color, plan.popular)

  return (
    <div className={`relative rounded-2xl p-8 ${colorClasses.border} border-2 ${plan.popular ? 'scale-105 shadow-xl' : 'shadow-lg'} bg-white`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
            <Crown className="w-4 h-4 mr-1" />
            Paling Populer
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl font-bold text-gray-900">
              Rp {plan.price.toLocaleString('id-ID')}
            </span>
            {plan.price > 0 && (
              <span className="text-gray-500 ml-2">/{billingCycle === 'monthly' ? 'bulan' : 'tahun'}</span>
            )}
          </div>
          
          {plan.originalPrice > plan.price && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg text-gray-400 line-through">
                Rp {plan.originalPrice.toLocaleString('id-ID')}
              </span>
              {plan.savings && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {plan.savings}
                </span>
              )}
            </div>
          )}
        </div>

        <ul className="space-y-3 mb-8 text-left">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
          {plan.limitations && plan.limitations.map((limitation, index) => (
            <li key={`limit-${index}`} className="flex items-start opacity-60">
              <span className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-400">×</span>
              <span className="text-gray-500 text-sm">{limitation}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelect(plan)}
          disabled={plan.disabled || isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${colorClasses.button} ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Memproses...' : plan.buttonText}
        </button>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState('yearly')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  const handlePlanSelect = async (plan) => {
    if (plan.disabled || plan.price === 0) return

    setIsLoading(true)
    
    try {
      // Create order in database
      const orderData = {
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        billing_cycle: billingCycle,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      // In real app, this would be an API call to create order
      console.log('Creating order:', orderData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to order history
      router.push('/dashboard/orders')
      
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Upgrade ke <span className="text-blue-600">Premium</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Dapatkan akses penuh ke semua strategi trading profesional, data real-time, dan fitur advanced untuk memaksimalkan profit Anda
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tahunan
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Hemat 40%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans[billingCycle].map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              onSelect={handlePlanSelect}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Mengapa Memilih ForexBot Pro?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Win Rate 78-88%</h3>
              <p className="text-gray-600">Strategi teruji dengan performa tinggi</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Real-time</h3>
              <p className="text-gray-600">Polygon API untuk akurasi maksimal</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600">Sistem otomatis melindungi modal</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Support 24/7</h3>
              <p className="text-gray-600">Tim expert siap membantu Anda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Apa Kata Trader Kami?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pertanyaan yang Sering Diajukan
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bagaimana cara pembayaran?
              </h3>
              <p className="text-gray-600">
                Setelah memilih paket, Anda akan diarahkan ke halaman riwayat order. Tim kami akan menghubungi Anda dalam 1x24 jam untuk proses pembayaran dan aktivasi akun.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Apakah ada garansi uang kembali?
              </h3>
              <p className="text-gray-600">
                Ya! Kami memberikan garansi 30 hari uang kembali jika Anda tidak puas dengan layanan kami.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bisakah upgrade atau downgrade paket?
              </h3>
              <p className="text-gray-600">
                Tentu saja! Anda dapat mengubah paket kapan saja melalui dashboard atau menghubungi support kami.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Apakah strategi trading benar-benar profitable?
              </h3>
              <p className="text-gray-600">
                Semua strategi telah dibacktest dengan data historis dan menunjukkan win rate 78-88%. Namun, trading selalu memiliki risiko dan performa masa lalu tidak menjamin hasil di masa depan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Meningkatkan Profit Trading Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabung dengan ribuan trader yang sudah merasakan kesuksesan dengan ForexBot Pro
          </p>
          <button
            onClick={() => document.querySelector('.pricing-cards').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Pilih Paket Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}