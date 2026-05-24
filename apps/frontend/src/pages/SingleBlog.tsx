import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, MessageSquare, Heart, Share2, Loader2, Send, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/api/axios"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"

interface Comment {
  _id: string
  content: string
  author: {
    userId: string
    name: string
    avatar?: string
  }
  createdAt: string
  replies?: Comment[]
}

export function SingleBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Like state
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  // Comment state
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const commentSectionRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch post + initial like status
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/posts/${id}`)
        const data = response.data.data
        setPost(data)
        setLikeCount(data.likeCount || 0)
        setCommentCount(data.commentCount || 0)

        // Fetch whether current user has liked this post
        if (user) {
          try {
            const likeRes = await api.get(`/likes/status/${id}`)
            setIsLiked(likeRes.data.data.isLiked)
          } catch {
            // Not critical — default stays false
          }
        }
      } catch (error) {
        console.error("Failed to fetch post:", error)
        navigate("/blogs")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetchPost()
  }, [id, navigate, user])

  // Fetch comments
  const fetchComments = async () => {
    if (!id) return
    setIsLoadingComments(true)
    try {
      const response = await api.get(`/comments/post/${id}`)
      setComments(response.data.data?.docs || [])
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  useEffect(() => {
    if (id) fetchComments()
  }, [id])

  // Toggle like
  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts.")
      navigate("/login")
      return
    }
    if (isTogglingLike) return

    setIsTogglingLike(true)
    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev) => prev + (newIsLiked ? 1 : -1))

    try {
      const response = await api.post(`/likes/toggle/${id}`)
      // Sync with server response
      setIsLiked(response.data.data.isLiked)
    } catch (error: any) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikeCount((prev) => prev + (newIsLiked ? -1 : 1))
      toast.error(error.response?.data?.message || "Failed to toggle like.")
    } finally {
      setIsTogglingLike(false)
    }
  }

  // Submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    if (!user) {
      toast.error("Please log in to comment.")
      navigate("/login")
      return
    }

    setIsSubmittingComment(true)
    try {
      await api.post("/comments", {
        content: newComment.trim(),
        postId: id,
      })
      setNewComment("")
      setCommentCount((prev) => prev + 1)
      await fetchComments()
      toast.success("Comment added!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment.")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId)
    try {
      await api.delete(`/comments/${commentId}`)
      setCommentCount((prev) => Math.max(0, prev - 1))
      setComments((prev) => prev.filter((c) => c._id !== commentId))
      toast.success("Comment deleted.")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete comment.")
    } finally {
      setDeletingCommentId(null)
    }
  }

  // Scroll to comments section
  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" })
    setTimeout(() => commentInputRef.current?.focus(), 400)
  }

  // Share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link.")
    }
  }

  // Estimate read time
  const readTime = post ? Math.max(1, Math.ceil(post.content?.split(" ").length / 200)) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) return null

  return (
    <article className="min-h-screen bg-background pb-32 animate-in fade-in duration-700">

      {/* Hero Section */}
      <div className="relative h-[65vh] min-h-[580px] w-full bg-muted overflow-hidden">
        <img
          src={post.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/20" />

        {/* Back button — absolutely positioned so it doesn't stack with bottom content */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Bottom content — title + author only (no Back button competing for space) */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container max-w-4xl mx-auto px-4 pb-10">

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary/80 backdrop-blur-md hover:bg-primary border-none px-3 py-1 text-sm shadow-xl">
                {post.category?.name || "Uncategorized"}
              </Badge>
              {post.tags?.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-white/10 px-3 py-1 text-sm shadow-xl hover:bg-black/60">
                  #{tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight drop-shadow-xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-base sm:text-lg text-white/75 max-w-3xl leading-relaxed mb-5 font-serif drop-shadow-md line-clamp-2">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-white/20 pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-white/20 shadow-xl">
                  <AvatarImage src={post.author?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.author?.name?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold drop-shadow-md">{post.author?.name || "Anonymous"}</p>
                  <p className="text-white/70 text-sm drop-shadow-md">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{readTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
                  <span className="text-sm font-medium">{likeCount}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-3xl mx-auto px-4 mt-16">

        {/* Floating Actions */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          <button
            onClick={handleToggleLike}
            disabled={isTogglingLike}
            className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-200 group ${
              isLiked
                ? "bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30"
                : "bg-background/50 border-border/50 hover:border-primary/50"
            }`}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? "text-pink-500 fill-pink-500" : "text-muted-foreground group-hover:text-pink-500"}`} />
          </button>
          <button
            onClick={scrollToComments}
            className="w-12 h-12 rounded-full border border-border/50 bg-background/50 backdrop-blur-md shadow-lg hover:border-primary/50 flex items-center justify-center group transition-all duration-200"
            title="Comments"
          >
            <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full border border-border/50 bg-background/50 backdrop-blur-md shadow-lg hover:border-primary/50 flex items-center justify-center group transition-all duration-200"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none font-serif prose-headings:font-sans prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-3xl prose-img:shadow-2xl leading-loose">
          {post.content.split("\n").map((paragraph: string, idx: number) => (
            paragraph.trim() ? <p key={idx} className="mb-6">{paragraph}</p> : <br key={idx} />
          ))}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 mb-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/50 mt-10 pt-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleToggleLike}
              disabled={isTogglingLike}
              className={`rounded-full px-6 transition-all duration-200 ${
                isLiked
                  ? "bg-pink-500/10 border-pink-500/40 text-pink-500 hover:bg-pink-500/20"
                  : "hover:border-pink-400 hover:text-pink-500"
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 transition-all ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
              {isLiked ? "Liked" : "Like"} ({likeCount})
            </Button>
            <Button variant="outline" onClick={scrollToComments} className="rounded-full px-6">
              <MessageSquare className="w-4 h-4 mr-2" /> Comment ({commentCount})
            </Button>
          </div>
          <Button variant="ghost" onClick={handleShare} className="rounded-full px-6">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        {/* ─────────────── COMMENTS SECTION ─────────────── */}
        <div ref={commentSectionRef} className="mt-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            Comments
            <span className="text-sm font-normal text-muted-foreground">({commentCount})</span>
          </h2>

          {/* Comment Input Box */}
          {user ? (
            <div className="mb-10 bg-muted/30 rounded-2xl p-5 border border-border/50">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 flex-shrink-0 mt-1">
                  <AvatarImage src={user.profile?.profilePicture || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed min-h-[80px] border-b border-border/50 pb-3 mb-3 focus:border-primary/50 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitComment()
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Ctrl+Enter to submit</p>
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="rounded-full px-5"
                    >
                      {isSubmittingComment ? (
                        <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Posting...</>
                      ) : (
                        <><Send className="w-3 h-3 mr-2" /> Post</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-10 bg-muted/20 rounded-2xl p-6 border border-border/40 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4 text-sm">
                Join the conversation — log in to leave a comment.
              </p>
              <Button onClick={() => navigate("/login")} className="rounded-full px-8">
                Log in to Comment
              </Button>
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment._id} className="group flex gap-3">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {comment.author.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/20 rounded-2xl px-4 py-3 border border-border/30">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                      {/* Delete button for own comments */}
                      {user && user.id === comment.author.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={deletingCommentId === comment._id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          title="Delete comment"
                        >
                          {deletingCommentId === comment._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-border/30">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-2">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarImage src={reply.author.avatar} />
                              <AvatarFallback className="text-xs bg-muted">
                                {reply.author.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <span className="text-xs font-semibold">{reply.author.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric",
                                })}
                              </span>
                              <p className="text-xs leading-relaxed mt-0.5">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </article>
  )
}
