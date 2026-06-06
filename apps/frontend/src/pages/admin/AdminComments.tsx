import { useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { Clock, ExternalLink, MessageSquare, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { SearchInput } from "@/components/shared/SearchInput"
import { commentsApi } from "@/api/comments.api"
import { useAdminList } from "@/hooks/useAdminList"
import { ADMIN_COMMENTS_LIMIT } from "@/constants/app"
import { formatDate } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"
import type { Comment } from "@/types"

const fetchComments = (params: Parameters<typeof commentsApi.adminAll>[0]) => commentsApi.adminAll(params)

export function AdminComments() {
  const list = useAdminList<Comment>({
    fetcher: fetchComments,
    limit: ADMIN_COMMENTS_LIMIT,
    errorMessage: "Failed to load comments",
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { items, setItems, isLoading, search, setSearch, page, setPage, totalPages } = list

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      await commentsApi.delete(deleteId)
      setItems((prev) => prev.filter((c) => c._id !== deleteId))
      toast.success("Comment deleted.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed."))
    }
  }, [deleteId, setItems])

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <AdminPageHeader
        title="All Comments"
        description="Manage all comments across the platform."
        action={<SearchInput value={search} onChange={setSearch} placeholder="Search comments or posts..." />}
      />

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Comment</div>
          <div className="col-span-3">Post</div>
          <div className="col-span-2">Author</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={search ? "No comments match your search." : "No comments yet."}
          />
        ) : (
          <div className="divide-y divide-border/30">
            {items.map((comment) => {
              const postId = comment.post ?? comment.postDetails?._id
              return (
                <div
                  key={comment._id}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="md:col-span-5 min-w-0">
                    <p className="text-sm line-clamp-2 leading-relaxed">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>

                  <div className="md:col-span-3 min-w-0">
                    {postId ? (
                      <Link
                        to={`/admin/posts/${postId}/comments`}
                        className="text-sm text-primary hover:underline truncate block"
                      >
                        {comment.postDetails?.title ?? "Unknown Post"}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unknown Post</span>
                    )}
                  </div>

                  <div className="md:col-span-2 min-w-0">
                    <p className="text-sm truncate">{comment.author?.name ?? "Unknown"}</p>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-end gap-1">
                    {postId && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/admin/posts/${postId}/comments`} aria-label="Open post">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(comment._id)}
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
