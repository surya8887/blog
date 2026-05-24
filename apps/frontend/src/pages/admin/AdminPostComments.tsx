import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft, Trash2, ExternalLink, MessageSquare, Clock,
  User as UserIcon, Loader2, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { api } from "@/api/axios"
import { toast } from "sonner"

export function AdminPostComments() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletePostOpen, setDeletePostOpen] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/comments/post/${id}`, { params: { limit: 100 } }),
        ])
        setPost(postRes.data.data)
        setComments(commentsRes.data.data?.docs || [])
      } catch {
        toast.error("Failed to load post data")
        navigate("/admin/posts")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetchData()
  }, [id, navigate])

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${id}`)
      toast.success("Post deleted.")
      navigate("/admin/posts")
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Delete failed.")
    }
  }

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return
    try {
      await api.delete(`/comments/${deleteCommentId}`)
      setComments(prev => prev.filter(c => c._id !== deleteCommentId))
      toast.success("Comment deleted.")
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Delete failed.")
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/posts")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{post?.title || "Post Details"}</h1>
          <p className="text-sm text-muted-foreground">Post details and comments management</p>
        </div>
      </div>

      {/* Post detail card */}
      {post && (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {post.coverImage && (
            <div className="h-48 overflow-hidden">
              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="capitalize">{post.status}</Badge>
              {post.category?.name && <Badge className="bg-primary/10 text-primary border-primary/20">{post.category.name}</Badge>}
            </div>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            {post.excerpt && <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>}

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={post.author?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{post.author?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{post.author?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {post.status === "published" && (
                  <Button variant="outline" size="sm" asChild className="rounded-xl gap-1.5">
                    <Link to={`/blogs/${post._id}`}><ExternalLink className="w-3.5 h-3.5" />View</Link>
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => setDeletePostOpen(true)} className="rounded-xl gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />Delete Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Comments
            <span className="text-xs font-normal text-muted-foreground">({comments.length})</span>
          </h2>
        </div>

        {comments.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No comments on this post.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {comments.map(comment => (
              <div key={comment._id} className="group px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="w-8 h-8 mt-0.5 shrink-0">
                      <AvatarImage src={comment.author?.avatar} />
                      <AvatarFallback className="bg-muted text-xs">{comment.author?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{comment.author?.name || "Unknown"}</p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{comment.content}</p>

                      {/* Nested replies */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-border/40 space-y-3">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <Avatar className="w-6 h-6 mt-0.5 shrink-0">
                                  <AvatarFallback className="bg-muted text-[10px]">{reply.author?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-semibold">{reply.author?.name}</p>
                                  <p className="text-xs text-foreground/70 mt-0.5">{reply.content}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost" size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0"
                                onClick={() => setDeleteCommentId(reply._id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0"
                    onClick={() => setDeleteCommentId(comment._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={deletePostOpen}
        onOpenChange={setDeletePostOpen}
        title="Delete Post & All Comments"
        description="This will permanently delete this post and all its comments. This cannot be undone."
        onConfirm={handleDeletePost}
        confirmLabel="Delete Everything"
      />
      <ConfirmDialog
        open={!!deleteCommentId}
        onOpenChange={(open) => !open && setDeleteCommentId(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?"
        onConfirm={handleDeleteComment}
      />
    </div>
  )
}
