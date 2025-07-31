'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Star,
  Filter,
  Search,
  Tag,
  User,
  ArrowRight,
  Eye,
  ThumbsUp,
  Facebook,
  Twitter,
  Linkedin,
  Copy
} from 'lucide-react'

function BlogHeader() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trading Blog & Education
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Dapatkan insight terbaru tentang trading forex, analisis pasar, dan strategi profitable dari para ahli
          </p>
        </div>
      </div>
    </div>
  )
}

function BlogFilters({ activeCategory, setActiveCategory, searchTerm, setSearchTerm }) {
  const categories = [
    { id: 'all', label: 'All Posts', count: 45 },
    { id: 'trading-tips', label: 'Trading Tips', count: 12 },
    { id: 'market-analysis', label: 'Market Analysis', count: 15 },
    { id: 'strategy-guide', label: 'Strategy Guide', count: 8 },
    { id: 'education', label: 'Education', count: 10 }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturedPost({ post }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="relative h-64 md:h-80">
        <Image
          src={post.image || '/api/placeholder/800/400'}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </span>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-full ${isBookmarked ? 'bg-yellow-500 text-white' : 'bg-white/90 text-gray-700'} hover:scale-110 transition-transform`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full bg-white/90 text-gray-700 hover:scale-110 transition-transform">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {post.category}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {post.date}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {post.readTime} min read
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.author}</p>
                <p className="text-xs text-gray-500">Trading Expert</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-gray-500">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{post.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{post.views}</span>
              </div>
            </div>
            
            <Link 
              href={`/blog/${post.slug}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Read More</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogCard({ post }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <Image
          src={post.image || '/api/placeholder/400/300'}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-full ${isBookmarked ? 'bg-yellow-500 text-white' : 'bg-white/90 text-gray-700'} hover:scale-110 transition-transform`}
          >
            <Bookmark className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {post.date}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-gray-500 text-sm">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{post.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{post.views}</span>
            </div>
          </div>
          
          <Link 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>Read</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function TrendingTopics() {
  const topics = [
    { name: 'Scalping Strategy', count: 25, trending: true },
    { name: 'Market Analysis', count: 18 },
    { name: 'Risk Management', count: 15 },
    { name: 'Technical Indicators', count: 12 },
    { name: 'Forex News', count: 10 }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
        Trending Topics
      </h3>
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{topic.name}</span>
              {topic.trending && (
                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                  Hot
                </span>
              )}
            </div>
            <span className="text-gray-500 text-sm">{topic.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PopularPosts() {
  const posts = [
    { title: '5 Strategi Scalping Terbaik untuk Pemula', views: '2.1k', date: '2 days ago' },
    { title: 'Cara Membaca Candlestick dengan Tepat', views: '1.8k', date: '3 days ago' },
    { title: 'Money Management yang Efektif', views: '1.5k', date: '5 days ago' },
    { title: 'Indikator Technical Analysis Terpopuler', views: '1.2k', date: '1 week ago' }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-500" />
        Popular Posts
      </h3>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
              {post.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{post.date}</span>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{post.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BlogPage() {
  const { user } = useUser()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Sample blog posts data
  const featuredPost = {
    id: 1,
    title: 'Panduan Lengkap Trading Forex untuk Pemula: Dari Nol hingga Profit Konsisten',
    excerpt: 'Pelajari langkah demi langkah cara memulai trading forex dengan aman dan menguntungkan. Mulai dari pemahaman dasar hingga strategi advanced yang telah terbukti.',
    image: '/api/placeholder/800/400',
    author: 'Ahmad Trader',
    date: 'Jan 15, 2024',
    readTime: 8,
    category: 'Education',
    likes: 156,
    comments: 23,
    views: '2.3k',
    slug: 'panduan-lengkap-trading-forex-pemula'
  }

  const blogPosts = [
    {
      id: 2,
      title: 'Strategi Scalping MA Cross: Profit Harian 50-100 Pips',
      excerpt: 'Teknik scalping menggunakan moving average crossover yang telah terbukti menghasilkan profit konsisten...',
      image: '/api/placeholder/400/300',
      author: 'Sarah Trading',
      date: 'Jan 14, 2024',
      readTime: 5,
      category: 'Trading Tips',
      likes: 89,
      comments: 15,
      views: '1.8k',
      slug: 'strategi-scalping-ma-cross'
    },
    {
      id: 3,
      title: 'Analisis Teknikal EUR/USD Minggu Ini',
      excerpt: 'Outlook teknikal untuk pair EUR/USD berdasarkan support, resistance, dan pattern yang terbentuk...',
      image: '/api/placeholder/400/300',
      author: 'Mike Analyst',
      date: 'Jan 13, 2024',
      readTime: 6,
      category: 'Market Analysis',
      likes: 67,
      comments: 12,
      views: '1.5k',
      slug: 'analisis-teknikal-eurusd'
    },
    {
      id: 4,
      title: 'Money Management: Kunci Sukses Trading Jangka Panjang',
      excerpt: 'Pelajari teknik money management yang akan melindungi modal Anda dan memaksimalkan profit...',
      image: '/api/placeholder/400/300',
      author: 'David Risk Manager',
      date: 'Jan 12, 2024',
      readTime: 7,
      category: 'Education',
      likes: 134,
      comments: 28,
      views: '2.1k',
      slug: 'money-management-trading'
    },
    {
      id: 5,
      title: 'Setup Trading Station yang Optimal untuk Day Trading',
      excerpt: 'Panduan lengkap membangun setup trading station yang efisien untuk aktivitas day trading...',
      image: '/api/placeholder/400/300',
      author: 'Lisa Setup Expert',
      date: 'Jan 11, 2024',
      readTime: 4,
      category: 'Strategy Guide',
      likes: 45,
      comments: 8,
      views: '980',
      slug: 'setup-trading-station-optimal'
    },
    {
      id: 6,
      title: 'Psikologi Trading: Mengatasi Fear dan Greed',
      excerpt: 'Bagaimana mengendalikan emosi dalam trading dan membangun mental yang kuat untuk sukses konsisten...',
      image: '/api/placeholder/400/300',
      author: 'Dr. Psychology Trader',
      date: 'Jan 10, 2024',
      readTime: 9,
      category: 'Education',
      likes: 98,
      comments: 19,
      views: '1.7k',
      slug: 'psikologi-trading-fear-greed'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogFilters 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <FeaturedPost post={featuredPost} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Load More Articles
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <TrendingTopics />
            <PopularPosts />
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Get Trading Tips</h3>
              <p className="text-blue-100 text-sm mb-4">
                Subscribe to receive weekly trading insights and market analysis
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}