import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ plan, price, features, isPopular = false, buttonText }) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 shadow-lg ${isPopular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            Paling Populer
          </span>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/bulan</span>
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <SignUpButton mode="modal">
          <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            isPopular 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}>
            {buttonText}
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">ForexBot Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <button className="text-gray-700 hover:text-blue-600 font-medium">
                  Masuk
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Daftar Gratis
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Trading Bot Forex
            <span className="text-blue-600 block">Terdepan di Indonesia</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform backtest trading forex dengan strategi scalping profesional, 
            data real-time dari Polygon, dan AI yang telah terbukti menghasilkan profit konsisten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                Mulai Trading Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </SignUpButton>
            <Link href="#features">
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors">
                Pelajari Lebih Lanjut
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih ForexBot Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform trading bot forex paling canggih dengan teknologi AI dan data real-time
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="Strategi Scalping Profesional"
              description="Bot dengan strategi scalping yang telah dioptimalkan oleh trader profesional dengan winrate tinggi"
            />
            <FeatureCard
              icon={BarChart3}
              title="Data Real-time Polygon"
              description="Akses data forex real-time berkualitas tinggi dari Polygon API untuk analisis yang akurat"
            />
            <FeatureCard
              icon={Shield}
              title="Backtest Engine Canggih"
              description="Engine backtest yang powerful untuk menguji strategi dengan data historis yang komprehensif"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Analisis Teknikal Lengkap"
              description="Indikator teknikal lengkap seperti RSI, MACD, Moving Average, dan masih banyak lagi"
            />
            <FeatureCard
              icon={Users}
              title="Dashboard Profesional"
              description="Interface yang intuitif dan dashboard lengkap untuk monitoring performa trading Anda"
            />
            <FeatureCard
              icon={Award}
              title="Risk Management"
              description="Sistem manajemen risiko otomatis untuk melindungi modal dan memaksimalkan profit"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">85%+</div>
              <div className="text-blue-100">Win Rate Rata-rata</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Trader Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <div className="text-blue-100">Volume Trading</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Tepat
            </h2>
            <p className="text-xl text-gray-600">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan trading Anda
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              plan="Gratis"
              price="0"
              features={[
                "10 backtest per bulan",
                "3 strategi dasar",
                "Data historis 1 tahun",
                "Support email"
              ]}
              buttonText="Mulai Gratis"
            />
            <PricingCard
              plan="Premium"
              price="29"
              features={[
                "Unlimited backtest",
                "Semua strategi premium",
                "Data real-time",
                "Analisis mendalam",
                "Priority support"
              ]}
              isPopular={true}
              buttonText="Upgrade ke Premium"
            />
            <PricingCard
              plan="Enterprise"
              price="99"
              features={[
                "Semua fitur Premium",
                "Custom strategies",
                "API access",
                "Dedicated support",
                "White-label solution"
              ]}
              buttonText="Hubungi Sales"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Trader Kami?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "ForexBot Pro mengubah cara saya trading. Profit konsisten dengan risiko terkontrol."
              </p>
              <div className="font-semibold text-gray-900">Ahmad Wijaya</div>
              <div className="text-gray-600">Professional Trader</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Strategi scalping-nya luar biasa. Win rate saya naik dari 60% jadi 85%."
              </p>
              <div className="font-semibold text-gray-900">Sari Indrawati</div>
              <div className="text-gray-600">Forex Enthusiast</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Dashboard yang user-friendly dan data real-time yang akurat. Recommended!"
              </p>
              <div className="font-semibold text-gray-900">Budi Santoso</div>
              <div className="text-gray-600">Day Trader</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Memulai Trading yang Menguntungkan?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabung dengan ribuan trader yang sudah merasakan profit konsisten dengan ForexBot Pro
          </p>
          <SignUpButton mode="modal">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Daftar Sekarang - Gratis!
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-2xl font-bold">ForexBot Pro</span>
              </div>
              <p className="text-gray-400">
                Platform trading bot forex terdepan dengan teknologi AI dan strategi profesional.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Trading Bot</li>
                <li>Backtest Engine</li>
                <li>Strategi Premium</li>
                <li>API Access</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Tutorial</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Risk Disclosure</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ForexBot Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
