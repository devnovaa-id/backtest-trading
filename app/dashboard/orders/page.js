'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Calendar,
  Download,
  MessageCircle,
  Phone,
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'

// Mock orders data - in real app this would come from API
const mockOrders = [
  {
    id: 'ORD-2024-001',
    planName: 'Premium',
    amount: 1990000,
    billingCycle: 'yearly',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    paymentMethod: null,
    notes: 'Menunggu konfirmasi pembayaran dari admin',
    adminContact: {
      name: 'Customer Service',
      phone: '+62-812-3456-7890',
      email: 'support@forexbotpro.com',
      whatsapp: '+62-812-3456-7890'
    }
  },
  {
    id: 'ORD-2024-002',
    planName: 'Professional',
    amount: 4990000,
    billingCycle: 'yearly',
    status: 'completed',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-11T09:15:00Z',
    paymentMethod: 'Bank Transfer',
    notes: 'Pembayaran berhasil dikonfirmasi. Akun telah diupgrade.',
    adminContact: null,
    activatedAt: '2024-01-11T09:15:00Z'
  },
  {
    id: 'ORD-2024-003',
    planName: 'Premium',
    amount: 199000,
    billingCycle: 'monthly',
    status: 'cancelled',
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-09T10:00:00Z',
    paymentMethod: null,
    notes: 'Order dibatalkan atas permintaan customer',
    adminContact: null
  }
]

const statusConfig = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Order Anda sedang menunggu konfirmasi pembayaran dari tim kami'
  },
  processing: {
    label: 'Sedang Diproses',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
    description: 'Pembayaran sedang diverifikasi oleh tim kami'
  },
  completed: {
    label: 'Berhasil',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Pembayaran berhasil dan akun telah diupgrade'
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Order telah dibatalkan'
  },
  failed: {
    label: 'Gagal',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Pembayaran gagal atau ditolak'
  }
}

function OrderCard({ order }) {
  const [showDetails, setShowDetails] = useState(false)
  const statusInfo = statusConfig[order.status]
  const StatusIcon = statusInfo.icon

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Disalin ke clipboard!')
  }

  const openWhatsApp = (phone, orderId) => {
    const message = `Halo, saya ingin menanyakan status order ${orderId}. Terima kasih.`
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.id}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.label}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Paket</p>
            <p className="font-semibold text-gray-900">{order.planName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Periode</p>
            <p className="font-semibold text-gray-900">
              {order.billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-semibold text-gray-900 text-lg">
              {formatCurrency(order.amount)}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">{statusInfo.description}</p>
          {order.notes && (
            <p className="text-sm text-gray-600 mt-2 italic">
              Catatan: {order.notes}
            </p>
          )}
        </div>

        {order.status === 'pending' && order.adminContact && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Hubungi Tim Kami
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">{order.adminContact.phone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(order.adminContact.phone)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">{order.adminContact.email}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(order.adminContact.email)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => openWhatsApp(order.adminContact.whatsapp, order.id)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={() => window.location.href = `mailto:${order.adminContact.email}?subject=Order ${order.id}&body=Halo, saya ingin menanyakan status order ${order.id}.`}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
            </div>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Akun Berhasil Diupgrade!</h4>
                <p className="text-sm text-green-700">
                  Aktivasi: {formatDate(order.activatedAt)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
          </button>
          
          {order.status === 'completed' && (
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-1" />
              Download Invoice
            </button>
          )}
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-mono text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Status Terakhir</p>
                <p className="text-gray-900">{formatDate(order.updatedAt)}</p>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="text-gray-600">Metode Pembayaran</p>
                  <p className="text-gray-900">{order.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    // In real app, fetch orders from API
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const completedOrders = orders.filter(order => order.status === 'completed')
  const otherOrders = orders.filter(order => !['pending', 'completed'].includes(order.status))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Order</h1>
        <p className="text-gray-600 mt-1">
          Pantau status pembayaran dan aktivasi paket langganan Anda
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Menunggu Pembayaran</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Berhasil</p>
              <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Order</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            Order Menunggu Pembayaran
          </h2>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* All Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Semua Order
        </h2>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Order
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki order apapun. Mulai dengan memilih paket yang sesuai.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/upgrade'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Pilih Paket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Butuh Bantuan?
        </h3>
        <p className="text-blue-800 mb-4">
          Tim customer service kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami jika ada pertanyaan tentang order atau pembayaran.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp Support
          </button>
          <button
            onClick={() => window.location.href = 'mailto:support@forexbotpro.com'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Support
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/docs'}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Dokumentasi
          </button>
        </div>
      </div>
    </div>
  )
}