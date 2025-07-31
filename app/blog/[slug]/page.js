'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Calendar, 
  Clock, 
  User, 
  Eye,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Send,
  ThumbsUp,
  Reply,
  Flag,
  Edit,
  Trash2
} from 'lucide-react'

function BlogPostHeader({ post, isLiked, onLike, isBookmarked, onBookmark }) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${post.title} - ${post.excerpt}`

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setShowShareMenu(false)
    // Show success toast
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="relative h-64 md:h-96">
        <Image
          src={post.image || '/api/placeholder/1200/600'}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Link
            href="/blog"
            className="flex items-center space-x-2 text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
        
        <div className="absolute top-6 right-6 flex space-x-2">
          <button
            onClick={onBookmark}
            className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
              isBookmarked 
                ? 'bg-yellow-500 text-white' 
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-3 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[200px]">
                {shareOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.name}</span>
                    </a>
                  )
                })}
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <div className="flex items-center text-white text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {post.date}
            </div>
            <div className="flex items-center text-white text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {post.readTime} min read
            </div>
            <div className="flex items-center text-white text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {post.views}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-white font-medium">{post.author}</p>
                <p className="text-white/80 text-sm">Trading Expert</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-black/20 text-white hover:bg-black/30'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-white">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogPostContent({ content }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  )
}

function CommentForm({ postId, onCommentSubmit, replyToComment = null, onCancel = null }) {
  const { user } = useUser()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await onCommentSubmit({
        content: comment,
        post_id: postId,
        parent_id: replyToComment?.id || null,
        user_id: user.id
      })
      setComment('')
      if (onCancel) onCancel()
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
    setIsSubmitting(false)
  }

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800 mb-3">Please sign in to leave a comment</p>
        <Link href="/sign-in" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {replyToComment && (
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">
            Replying to <span className="font-medium">{replyToComment.author}</span>
          </p>
          <p className="text-sm text-gray-800 mt-1 line-clamp-2">
            {replyToComment.content}
          </p>
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">
            {user.firstName?.charAt(0) || 'U'}
          </span>
        </div>
        
        <div className="flex-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={replyToComment ? 'Write a reply...' : 'Share your thoughts...'}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500">
              Commenting as {user.fullName || 'User'}
            </p>
            
            <div className="flex items-center space-x-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

function CommentItem({ comment, onReply, onLike, currentUserId }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(comment.id)
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{comment.author}</h4>
            <span className="text-sm text-gray-500">{comment.date}</span>
          </div>
          
          <p className="text-gray-700 mb-3">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
            
            {currentUserId === comment.userId && (
              <div className="flex items-center space-x-2">
                <button className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500 transition-colors">
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>
      
      {showReplyForm && (
        <div className="mt-4 ml-13">
          <CommentForm
            postId={comment.postId}
            replyToComment={comment}
            onCommentSubmit={onReply}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-13 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentsSection({ postId, comments, onCommentSubmit }) {
  const { user } = useUser()
  
  const handleReply = async (commentData) => {
    await onCommentSubmit(commentData)
  }

  const handleLike = (commentId) => {
    // Handle comment like
    console.log('Like comment:', commentId)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>
      
      <div className="mb-8">
        <CommentForm postId={postId} onCommentSubmit={onCommentSubmit} />
      </div>
      
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              currentUserId={user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}

export default function BlogPostPage({ params }) {
  const { user } = useUser()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  
  // Sample blog post data - replace with actual API call
  const post = {
    id: 1,
    title: 'Panduan Lengkap Trading Forex untuk Pemula: Dari Nol hingga Profit Konsisten',
    excerpt: 'Pelajari langkah demi langkah cara memulai trading forex dengan aman dan menguntungkan.',
    content: `
      <h2>Mengapa Trading Forex?</h2>
      <p>Trading forex menawarkan peluang profit yang sangat menarik dengan likuiditas tinggi dan akses 24/5. Namun, kesuksesan dalam trading membutuhkan pemahaman yang mendalam tentang pasar dan strategi yang tepat.</p>
      
      <h3>Langkah Pertama: Memahami Dasar-Dasar</h3>
      <p>Sebelum memulai trading, penting untuk memahami:</p>
      <ul>
        <li>Konsep mata uang pair</li>
        <li>Spread dan pip</li>
        <li>Leverage dan margin</li>
        <li>Analisis teknikal dan fundamental</li>
      </ul>
      
      <h3>Strategi untuk Pemula</h3>
      <p>Beberapa strategi yang cocok untuk pemula meliputi:</p>
      <ol>
        <li>Trend following strategy</li>
        <li>Support and resistance trading</li>
        <li>Moving average crossover</li>
      </ol>
      
      <h3>Money Management</h3>
      <p>Aspek terpenting dalam trading adalah mengelola risiko. Selalu gunakan stop loss dan jangan pernah mempertaruhkan lebih dari 2% modal per trade.</p>
    `,
    image: '/api/placeholder/1200/600',
    author: 'Ahmad Trader',
    date: 'Jan 15, 2024',
    readTime: 8,
    category: 'Education',
    likes: 156,
    comments: 23,
    views: '2.3k',
    slug: 'panduan-lengkap-trading-forex-pemula'
  }
  
  // Sample comments data
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Trading',
      content: 'Artikel yang sangat informatif! Saya baru mulai trading dan ini sangat membantu untuk memahami dasar-dasarnya.',
      date: '2 days ago',
      likes: 5,
      userId: 'user1',
      postId: 1,
      replies: [
        {
          id: 2,
          author: 'Mike Trader',
          content: 'Setuju! Money management memang kunci utama sukses trading jangka panjang.',
          date: '2 days ago',
          likes: 2,
          userId: 'user2',
          postId: 1
        }
      ]
    },
    {
      id: 3,
      author: 'David Investor',
      content: 'Bagus sekali penjelasannya. Bisa tolong bahas lebih detail tentang analisis fundamental?',
      date: '1 day ago',
      likes: 3,
      userId: 'user3',
      postId: 1,
      replies: []
    }
  ])

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleCommentSubmit = async (commentData) => {
    // Simulate API call
    const newComment = {
      id: Date.now(),
      author: user?.fullName || 'Anonymous',
      content: commentData.content,
      date: 'just now',
      likes: 0,
      userId: user?.id,
      postId: commentData.post_id,
      replies: []
    }

    if (commentData.parent_id) {
      // Add as reply
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentData.parent_id 
            ? { ...comment, replies: [...comment.replies, newComment] }
            : comment
        )
      )
    } else {
      // Add as top-level comment
      setComments(prev => [newComment, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogPostHeader
          post={post}
          isLiked={isLiked}
          onLike={handleLike}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
        />
        
        <BlogPostContent content={post.content} />
        
        <CommentsSection
          postId={post.id}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
        />
      </div>
    </div>
  )
}