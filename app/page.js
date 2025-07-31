'use client';

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Bot,
  Target,
  Cpu,
  Globe,
  PieChart,
  Activity,
  Play,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function FeatureCard({ icon: Icon, title, description, gradient = "from-blue-50 to-indigo-50" }) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-blue-100 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ plan, price, features, isPopular = false, buttonText, description }) {
  return (
    <div className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border ${
      isPopular 
        ? 'border-blue-200 ring-4 ring-blue-100 scale-105 bg-gradient-to-br from-white to-blue-50' 
        : 'border-gray-200 hover:border-blue-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Paling Populer
          </span>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="mb-8">
          <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${price}</span>
          <span className="text-gray-600 text-lg">/bulan</span>
        </div>
        <ul className="space-y-4 mb-8 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
          isPopular
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-lg'
        }`}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, content, avatar, rating = 5 }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic leading-relaxed">"{content}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isSignedIn, user } = useUser();

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bot",
      description: "Bot trading otomatis dengan algoritma AI canggih yang dapat menganalisis pasar 24/7 dan mengeksekusi trade dengan presisi tinggi.",
      gradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: BarChart3,
      title: "Advanced Backtesting",
      description: "Engine backtesting profesional dengan data historis lengkap untuk menguji strategi trading sebelum implementasi live.",
      gradient: "from-purple-50 to-pink-50"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Sistem manajemen risiko terintegrasi dengan stop loss otomatis, position sizing, dan portfolio protection.",
      gradient: "from-green-50 to-emerald-50"
    },
    {
      icon: Target,
      title: "Smart Strategy Builder",
      description: "Builder strategi visual yang memungkinkan Anda membuat dan mengoptimalkan strategi trading tanpa coding.",
      gradient: "from-orange-50 to-red-50"
    },
    {
      icon: Activity,
      title: "Real-time Analytics",
      description: "Dashboard analytics real-time dengan metrik performa lengkap, profit tracking, dan insights mendalam.",
      gradient: "from-indigo-50 to-blue-50"
    },
    {
      icon: Globe,
      title: "Multi-Market Support",
      description: "Support untuk berbagai instrumen trading termasuk Forex, Crypto, Commodities, dan Indices.",
      gradient: "from-teal-50 to-cyan-50"
    }
  ];

  const pricingPlans = [
    {
      plan: "Starter",
      price: "29",
      description: "Ideal untuk trader pemula yang ingin mulai automated trading",
      features: [
        "1 Trading Bot Aktif",
        "Basic Backtesting",
        "5 Strategy Templates",
        "Email Support",
        "Real-time Market Data",
        "Basic Risk Management"
      ],
      buttonText: "Mulai Gratis"
    },
    {
      plan: "Professional",
      price: "99",
      description: "Untuk trader berpengalaman yang serius dengan trading otomatis",
      features: [
        "5 Trading Bot Aktif",
        "Advanced Backtesting",
        "Unlimited Strategies",
        "Priority Support",
        "Advanced Analytics",
        "Custom Indicators",
        "Portfolio Management",
        "API Access"
      ],
      isPopular: true,
      buttonText: "Upgrade Sekarang"
    },
    {
      plan: "Enterprise",
      price: "299",
      description: "Solusi lengkap untuk institutional traders dan fund managers",
      features: [
        "Unlimited Trading Bots",
        "Professional Backtesting Suite",
        "Custom Strategy Development",
        "Dedicated Account Manager",
        "White-label Solution",
        "Advanced Risk Controls",
        "Multi-account Management",
        "Custom Integrations"
      ],
      buttonText: "Hubungi Sales"
    }
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Professional Trader",
      content: "ForexBot Pro telah mengubah cara saya trading. Profit konsisten 15% per bulan dengan risiko yang terukur.",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Investment Manager",
      content: "Platform terbaik untuk backtesting. Fitur analytics yang mendalam membantu optimasi strategi dengan data-driven approach.",
      rating: 5
    },
    {
      name: "Ahmad Rahman",
      role: "Crypto Investor",
      content: "Automation yang luar biasa! Bot berjalan 24/7 tanpa emosi, hasil jauh lebih konsisten daripada manual trading.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">AI-Powered Trading Revolution</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ForexBot Pro
              </span>
              <br />
              <span className="text-gray-800">Trading Automation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Platform trading bot forex professional dengan teknologi AI dan backtesting engine yang powerful. 
              Raih profit konsisten dengan automasi trading yang terbukti efektif.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {isSignedIn ? (
                <Link 
                  href="/dashboard"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Buka Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Mulai Gratis Sekarang
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md">
                      Masuk ke Akun
                    </button>
                  </SignInButton>
                </>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">$50M+</div>
                <div className="text-gray-600 font-medium">Volume Traded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">95%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Market Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Fitur <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Revolusioner</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform all-in-one dengan teknologi terdepan untuk mengoptimalkan performa trading Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Pilih <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Paket</span> Anda
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mulai dengan paket yang sesuai kebutuhan dan upgrade kapan saja
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Apa Kata <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Trader</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ribuan trader telah merasakan keunggulan platform kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Siap Memulai Journey Trading Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Bergabung dengan ribuan trader sukses dan rasakan perbedaan automated trading dengan ForexBot Pro
          </p>
          
          {!isSignedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton mode="modal">
                <button className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Daftar Gratis Sekarang
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <button className="text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                Lihat Demo
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
