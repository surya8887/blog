import { useCallback, useState } from "react"
import { Link } from "react-router-dom"
import {
  Clock, ExternalLink, Eye, FileText, Heart, MessageSquare, Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { Pagination } from "@/components/shared/Pagination"
import { SearchInput } from "@/components/shared/SearchInput"
import { EmptyState } from "@/components/shared/EmptyState"
import { useAdminList } from "@/hooks/useAdminList"
import { postsApi } from "@/api/posts.api"
import { POST_STATUS_COLORS } from "@/constants/post"
import { formatDate } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"
import type { Post } from "@/types"

const fetchPosts = (params: Parameters<typeof postsApi.adminAll>[0]) => postsApi.adminAll(params)

export function AdminPosts() {
  const list = useAdminList<Post>({
    fetcher: fetchPosts,
    errorMessage: "Failed to load posts",
  })
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const { items, setItems, isLoading, search, setSearch, page, setPage, totalPages } = list

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await postsApi.delete(deleteTarget._id)
      setItems((prev) => prev.filter((p) => p._id !== deleteTarget._id))
      toast.success("Post deleted.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed."))
    }
  }, [deleteTarget, setItems])

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <AdminPageHeader
        title="All Posts"
        description="Manage all posts across the platform."
        action={<SearchInput value={search} onChange={setSearch} placeholder="Search posts or authors..." />}
      />

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">Post</div>
          <div className="col-span-2">Author</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Stats</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={FileText} title={search ? "No posts match your search." : "No posts yet."} />
        ) : (
          <div className="divide-y divide-border/30">
            {items.map((post) => (
              <AdminPostRow key={post._id} post={post} onDelete={() => setDeleteTarget(post)} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Post"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.` : ""}
        onConfirm={handleDelete}
      />
    </div>
  )
}

interface AdminPostRowProps {
  post: Post
  onDelete: () => void
}

function AdminPostRow({ post, onDelete }: AdminPostRowProps) {
  const catName = post.categoryDetails?.name ?? "—"

  return (
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
      <div className="md:col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
          {post.coverImage ? (
            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{post.title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {formatDate(post.createdAt)}
          </p>
        </div>
      </div>

      <div className="md:col-span-2 min-w-0">
        <p className="text-sm truncate">{post.author?.name ?? "Unknown"}</p>
      </div>

      <div className="md:col-span-1">
        <span className="text-xs text-muted-foreground">{catName}</span>
      </div>

      <div className="md:col-span-1">
        <Badge variant="outline" className={`text-xs capitalize ${POST_STATUS_COLORS[post.status]}`}>
          {post.status}
        </Badge>
      </div>

      <div className="md:col-span-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {post.viewCount ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {post.likeCount ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {post.commentCount ?? 0}
        </span>
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-1">
        {post.status === "published" && (
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to={`/blogs/${post._id}`} aria-label="View post">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link to={`/admin/posts/${post._id}/comments`} aria-label="View comments">
            <MessageSquare className="w-3.5 h-3.5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label="Delete post"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
