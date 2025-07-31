import { UserButton } from '@clerk/nextjs'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export const metadata = {
  title: 'Dashboard - ForexBot Pro',
  description: 'Dashboard trading bot forex profesional',
}

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}