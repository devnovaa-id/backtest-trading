import { UserButton } from '@clerk/nextjs'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export const metadata = {
  title: 'Admin Dashboard - ForexBot Pro',
  description: 'Dashboard admin untuk mengelola platform ForexBot Pro',
}

export default async function AdminLayout({ children }) {
  const { userId, sessionClaims } = await auth()
  
  // Check if user is admin
  const userRole = sessionClaims?.metadata?.role
  if (!userId || userRole !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <AdminHeader />
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}