import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, MessageSquare, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { commentsApi } from "@/api/comments.api"
import { getErrorMessage } from "@/lib/error"
import { formatDate, getInitial } from "@/lib/format"
import { useAuthStore } from "@/store/useAuthStore"
import type { Comment } from "@/types"

interface CommentsSectionProps {
  postId: string
  onCountChange?: (delta: number) => void
}

export interface CommentsSectionHandle {
  focus: () => void
}

export function CommentsSection({ postId, onCountChange }: CommentsSectionProps) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    commentsApi
      .forPost(postId)
      .then((result) => {
        if (!cancelled) setComments(result?.docs ?? [])
      })
      .catch((err) => console.error("Failed to fetch comments:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  const handleSubmit = async () => {
    const content = newComment.trim()
    if (!content) return
    if (!user) {
      toast.error("Please log in to comment.")
      return
    }

    setIsSubmitting(true)
    try {
      const created = await commentsApi.create({ content, postId })
      setComments((prev) => [created, ...prev])
      setNewComment("")
      onCountChange?.(1)
      toast.success("Comment added!")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add comment."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId)
    try {
      await commentsApi.delete(commentId)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
      onCountChange?.(-1)
      toast.success("Comment deleted.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete comment."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary" />
        Comments
        <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
      </h2>

      {user ? (
        <div className="mb-10 bg-muted/30 rounded-2xl p-5 border border-border/50">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0 mt-1">
              <AvatarImage src={user.profile?.profilePicture ?? ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitial(user.profile?.firstName ?? user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed min-h-[80px] border-b border-border/50 pb-3 mb-3 focus:border-primary/50 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit()
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Ctrl+Enter to submit</p>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newComment.trim()}
                  className="rounded-full px-5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-2" /> Post
                    </>
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
          <Button asChild className="rounded-full px-8">
            <Link to="/login">Log in to Comment</Link>
          </Button>
        </div>
      )}

      {isLoading ? (
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
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={user?.id}
              isDeleting={deletingId === comment._id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId: string | undefined
  isDeleting: boolean
  onDelete: (id: string) => void
}

function CommentItem({ comment, currentUserId, isDeleting, onDelete }: CommentItemProps) {
  const canDelete = currentUserId && currentUserId === comment.author.userId
  return (
    <div className="group flex gap-3">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {getInitial(comment.author.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-muted/20 rounded-2xl px-4 py-3 border border-border/30">
        <div className="flex items-start justify-between mb-1">
          <div>
            <span className="text-sm font-semibold">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground ml-2">{formatDate(comment.createdAt)}</span>
          </div>
          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              aria-label="Delete comment"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed">{comment.content}</p>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-border/30">
            {comment.replies.map((reply) => (
              <div key={reply._id} className="flex gap-2">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={reply.author.avatar} />
                  <AvatarFallback className="text-xs bg-muted">{getInitial(reply.author.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="text-xs font-semibold">{reply.author.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDate(reply.createdAt, { month: "short", day: "numeric" })}
                  </span>
                  <p className="text-xs leading-relaxed mt-0.5">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
