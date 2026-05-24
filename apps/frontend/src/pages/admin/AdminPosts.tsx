import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  FileText, Search, Trash2, ExternalLink, MessageSquare,
  Eye, Heart, Clock, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { api } from "@/api/axios"
import { toast } from "sonner"

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  draft: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border/50",
}

export function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/posts/admin/all", { params: { page, limit: 15, search: search || undefined } })
      setPosts(res.data.data?.docs || [])
      setTotalPages(res.data.data?.totalPages || 1)
    } catch { toast.error("Failed to load posts") }
    finally { setIsLoading(false) }
  }, [page, search])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchPosts() }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/posts/${deleteTarget._id}`)
      setPosts(prev => prev.filter(p => p._id !== deleteTarget._id))
      toast.success("Post deleted.")
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Delete failed.")
    }
  }

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all posts across the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts or authors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Table header */}
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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">{search ? "No posts match your search." : "No posts yet."}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {posts.map(post => {
              const catName = post.categoryDetails?.name || "—"
              const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

              return (
                <div key={post._id} className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                  {/* Post title + image */}
                  <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />{dateStr}
                      </p>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="md:col-span-2 min-w-0">
                    <p className="text-sm truncate">{post.author?.name || "Unknown"}</p>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-1">
                    <span className="text-xs text-muted-foreground">{catName}</span>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1">
                    <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[post.status]}`}>
                      {post.status}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="md:col-span-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likeCount || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentCount || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-1">
                    {post.status === "published" && (
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link to={`/blogs/${post._id}`}><ExternalLink className="w-3.5 h-3.5" /></Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link to={`/admin/posts/${post._id}/comments`}><MessageSquare className="w-3.5 h-3.5" /></Link>
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(post)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
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
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
