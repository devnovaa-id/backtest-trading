import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Masuk ke ForexBot Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Platform trading bot forex terdepan
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              card: 'shadow-xl',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600'
            }
          }}
        />
      </div>
    </div>
  )
}