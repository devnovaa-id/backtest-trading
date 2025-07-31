import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { TrendingUp, Shield, Zap, BarChart3, Sparkles, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-md mx-auto text-center text-white">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black">ForexBot Pro</h1>
              <p className="text-blue-100 text-sm font-medium">AI Trading Platform</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-8">Welcome Back to the Future of Trading</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Advanced Analytics</h3>
                  <p className="text-blue-100 text-sm">Real-time market insights</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Lightning Fast Execution</h3>
                  <p className="text-blue-100 text-sm">Automated trading bots</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Risk Management</h3>
                  <p className="text-blue-100 text-sm">Intelligent portfolio protection</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">Trusted by 10,000+ Traders</span>
              </div>
              <p className="text-blue-100 text-sm">Join the community of successful traders using AI-powered strategies</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black text-gray-900">ForexBot Pro</h1>
              <p className="text-gray-500 text-sm font-medium">AI Trading Platform</p>
            </div>
          </div>

          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-lg">
              Sign in to access your trading dashboard and continue your journey to financial success
            </p>
          </div>

          {/* Sign In Component */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl normal-case text-base',
                  formButtonSecondary: 'border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 normal-case text-base',
                  card: 'shadow-none border-none bg-transparent p-0',
                  headerTitle: 'text-2xl font-bold text-gray-900',
                  headerSubtitle: 'text-gray-600 mt-2',
                  socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-xl py-3 font-medium',
                  formFieldInput: 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl py-3 px-4 transition-all duration-200',
                  formFieldLabel: 'text-gray-700 font-medium mb-2',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-500 font-medium',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
                  formHeaderTitle: 'hidden',
                  formHeaderSubtitle: 'hidden'
                }
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">Trusted</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Professional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}