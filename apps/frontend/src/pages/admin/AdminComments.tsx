import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  MessageSquare, Search, Trash2, Clock, FileText, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { api } from "@/api/axios"
import { toast } from "sonner"

export function AdminComments() {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/comments/admin/all", { params: { page, limit: 20, search: search || undefined } })
      setComments(res.data.data?.docs || [])
      setTotalPages(res.data.data?.totalPages || 1)
    } catch { toast.error("Failed to load comments") }
    finally { setIsLoading(false) }
  }, [page, search])

  useEffect(() => { fetchComments() }, [fetchComments])

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchComments() }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/comments/${deleteId}`)
      setComments(prev => prev.filter(c => c._id !== deleteId))
      toast.success("Comment deleted.")
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Delete failed.")
    }
  }

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Comments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all comments across the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search comments or posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Comment</div>
          <div className="col-span-3">Post</div>
          <div className="col-span-2">Author</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-2/3" /></div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">{search ? "No comments match your search." : "No comments yet."}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {comments.map(comment => (
              <div key={comment._id} className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                {/* Comment text */}
                <div className="md:col-span-5 min-w-0">
                  <p className="text-sm line-clamp-2 leading-relaxed">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                {/* Post title */}
                <div className="md:col-span-3 min-w-0">
                  <Link
                    to={`/admin/posts/${comment.post || comment.postDetails?._id}/comments`}
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {comment.postDetails?.title || "Unknown Post"}
                  </Link>
                </div>

                {/* Author */}
                <div className="md:col-span-2 min-w-0">
                  <p className="text-sm truncate">{comment.author?.name || "Unknown"}</p>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8" asChild
                  >
                    <Link to={`/admin/posts/${comment.post || comment.postDetails?._id}/comments`}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(comment._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
