import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft, Clock, ExternalLink, MessageSquare, Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { postsApi } from "@/api/posts.api"
import { commentsApi } from "@/api/comments.api"
import { formatDate, formatLongDate, getInitial } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"
import type { Comment, Post } from "@/types"

export function AdminPostComments() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletePostOpen, setDeletePostOpen] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([postsApi.getById(id), commentsApi.forPost(id, { limit: 100 })])
      .then(([post, comments]) => {
        if (cancelled) return
        setPost(post)
        setComments(comments?.docs ?? [])
      })
      .catch(() => {
        toast.error("Failed to load post data")
        navigate("/admin/posts")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  const handleDeletePost = async () => {
    if (!id) return
    try {
      await postsApi.delete(id)
      toast.success("Post deleted.")
      navigate("/admin/posts")
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed."))
    }
  }

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return
    try {
      await commentsApi.delete(deleteCommentId)
      setComments((prev) => prev.filter((c) => c._id !== deleteCommentId))
      toast.success("Comment deleted.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed."))
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
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/posts")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{post?.title ?? "Post Details"}</h1>
          <p className="text-sm text-muted-foreground">Post details and comments management</p>
        </div>
      </div>

      {post && (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {post.coverImage && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="capitalize">{post.status}</Badge>
              {post.category?.name && (
                <Badge className="bg-primary/10 text-primary border-primary/20">{post.category.name}</Badge>
              )}
            </div>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            {post.excerpt && <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>}

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={post.author?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitial(post.author?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{post.author?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{formatLongDate(post.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {post.status === "published" && (
                  <Button variant="outline" size="sm" asChild className="rounded-xl gap-1.5">
                    <Link to={`/blogs/${post._id}`}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletePostOpen(true)}
                  className="rounded-xl gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            {comments.map((comment) => (
              <CommentRow
                key={comment._id}
                comment={comment}
                onDelete={(id) => setDeleteCommentId(id)}
              />
            ))}
          </div>
        )}
      </div>

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

interface CommentRowProps {
  comment: Comment
  onDelete: (id: string) => void
}

function CommentRow({ comment, onDelete }: CommentRowProps) {
  return (
    <div className="group px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar className="w-8 h-8 mt-0.5 shrink-0">
            <AvatarImage src={comment.author?.avatar} />
            <AvatarFallback className="bg-muted text-xs">{getInitial(comment.author?.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{comment.author?.name ?? "Unknown"}</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(comment.createdAt, { month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{comment.content}</p>

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-border/40 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <Avatar className="w-6 h-6 mt-0.5 shrink-0">
                        <AvatarFallback className="bg-muted text-[10px]">
                          {getInitial(reply.author?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold">{reply.author?.name}</p>
                        <p className="text-xs text-foreground/70 mt-0.5">{reply.content}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0"
                      onClick={() => onDelete(reply._id)}
                      aria-label="Delete reply"
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
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0"
          onClick={() => onDelete(comment._id)}
          aria-label="Delete comment"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
