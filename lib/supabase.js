import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client for browser-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations with full access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database helper functions
export const dbHelpers = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getUserByClerkId(clerkId) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateUser(clerkId, updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('clerk_id', clerkId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Blog operations
  async getBlogPosts(filters = {}) {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name, slug),
        users(username, full_name),
        blog_likes(count),
        blog_comments(count)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getBlogPost(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name, slug),
        users(username, full_name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) throw error
    
    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id)

    return data
  },

  async getBlogComments(postId) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        users(username, full_name),
        comment_likes(count)
      `)
      .eq('post_id', postId)
      .eq('status', 'approved')
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Get replies for each comment
    for (let comment of data) {
      const { data: replies, error: repliesError } = await supabase
        .from('blog_comments')
        .select(`
          *,
          users(username, full_name),
          comment_likes(count)
        `)
        .eq('parent_id', comment.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (!repliesError) {
        comment.replies = replies
      }
    }

    return data
  },

  async createBlogComment(commentData) {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert([{
        ...commentData,
        status: 'pending' // Comments need moderation
      }])
      .select()

    if (error) throw error
    return data[0]
  },

  async likeBlogPost(userId, postId) {
    const { data, error } = await supabase
      .from('blog_likes')
      .upsert([{ user_id: userId, post_id: postId }], { onConflict: 'user_id,post_id' })
      .select()

    if (error) throw error
    return data[0]
  },

  async unlikeBlogPost(userId, postId) {
    const { error } = await supabase
      .from('blog_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)

    if (error) throw error
    return true
  },

  async bookmarkBlogPost(userId, postId) {
    const { data, error } = await supabase
      .from('blog_bookmarks')
      .upsert([{ user_id: userId, post_id: postId }], { onConflict: 'user_id,post_id' })
      .select()

    if (error) throw error
    return data[0]
  },

  async unbookmarkBlogPost(userId, postId) {
    const { error } = await supabase
      .from('blog_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)

    if (error) throw error
    return true
  },

  async likeComment(userId, commentId) {
    const { data, error } = await supabase
      .from('comment_likes')
      .upsert([{ user_id: userId, comment_id: commentId }], { onConflict: 'user_id,comment_id' })
      .select()

    if (error) throw error
    return data[0]
  },

  async unlikeComment(userId, commentId) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId)

    if (error) throw error
    return true
  },

  async getUserBlogInteractions(userId, postId) {
    const [likesResult, bookmarkResult] = await Promise.all([
      supabase
        .from('blog_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single(),
      supabase
        .from('blog_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single()
    ])

    return {
      isLiked: !likesResult.error,
      isBookmarked: !bookmarkResult.error
    }
  },

  // Trading operations
  async getBacktestSessions(userId, filters = {}) {
    let query = supabase
      .from('backtest_sessions')
      .select(`
        *,
        trading_strategies(name, description),
        trading_pairs(symbol)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async createBacktestSession(sessionData) {
    const { data, error } = await supabase
      .from('backtest_sessions')
      .insert([sessionData])
      .select()

    if (error) throw error
    return data[0]
  },

  async getTradingStrategies(filters = {}) {
    let query = supabase
      .from('trading_strategies')
      .select('*')
      .eq('is_active', true)

    if (filters.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium)
    }

    if (filters.strategyType) {
      query = query.eq('strategy_type', filters.strategyType)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Orders operations
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()

    if (error) throw error
    return data[0]
  },

  async getUserOrders(userId, filters = {}) {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Admin operations
  async getAllUsers(filters = {}) {
    let query = supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getAllBlogPosts(filters = {}) {
    let query = supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name, slug),
        users(username, full_name)
      `)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getAllOrders(filters = {}) {
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        users(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,plan_name.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async updateOrderStatus(orderId, status, adminId, adminNotes = null) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        processed_by: adminId,
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    if (error) throw error
    return data[0]
  },

  async logAdminActivity(activityData) {
    const { data, error } = await supabaseAdmin
      .from('admin_activities')
      .insert([activityData])
      .select()

    if (error) throw error
    return data[0]
  },

  // Statistics for admin dashboard
  async getAdminStats() {
    const [usersResult, ordersResult, postsResult, commentsResult] = await Promise.all([
      supabaseAdmin.from('users').select('id, created_at, role'),
      supabaseAdmin.from('orders').select('id, status, amount'),
      supabaseAdmin.from('blog_posts').select('id, status'),
      supabaseAdmin.from('blog_comments').select('id, status')
    ])

    const users = usersResult.data || []
    const orders = ordersResult.data || []
    const posts = postsResult.data || []
    const comments = commentsResult.data || []

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.role !== 'user').length,
      totalRevenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.amount), 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      blogPosts: posts.filter(p => p.status === 'published').length,
      pendingComments: comments.filter(c => c.status === 'pending').length
    }
  }
}

export default supabase