import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  Clock, ExternalLink, Eye, FileText, Heart, MessageSquare,
  MoreVertical, PenLine, Tag, Trash2, TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"

import { postsApi } from "@/api/posts.api"
import { useAuthStore } from "@/store/useAuthStore"
import { POST_STATUS_COLORS } from "@/constants/post"
import { formatDate, getInitial } from "@/lib/format"
import { getDisplayName } from "@/lib/user"
import { getErrorMessage } from "@/lib/error"
import type { Post } from "@/types"

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  sub?: string
  color: string
}

function StatCard({ label, value, icon: Icon, sub, color }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="capitalize">
          {p.dataKey}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export const DashboardOverview = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)

  const displayName = getDisplayName(user)

  useEffect(() => {
    let cancelled = false
    postsApi
      .myPosts({ limit: 50 })
      .then((result) => {
        if (!cancelled) setPosts(result.docs ?? [])
      })
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load your posts")))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await postsApi.delete(deleteTarget._id)
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id))
      toast.success("Post deleted.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete post."))
    }
  }

  const stats = useMemo(() => {
    return posts.reduce(
      (acc, p) => ({
        total: acc.total + 1,
        published: acc.published + (p.status === "published" ? 1 : 0),
        likes: acc.likes + (p.likeCount ?? 0),
        views: acc.views + (p.viewCount ?? 0),
        comments: acc.comments + (p.commentCount ?? 0),
      }),
      { total: 0, published: 0, likes: 0, views: 0, comments: 0 }
    )
  }, [posts])

  const chartData = posts
    .filter((p) => p.status === "published")
    .slice(0, 7)
    .reverse()
    .map((p) => ({
      name: p.title.length > 16 ? p.title.slice(0, 16) + "…" : p.title,
      likes: p.likeCount ?? 0,
      views: p.viewCount ?? 0,
      comments: p.commentCount ?? 0,
    }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={user?.profile?.profilePicture ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitial(displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {displayName} 👋</h1>
            <p className="text-sm text-muted-foreground">Here's what's happening with your blog.</p>
          </div>
        </div>
        <Button asChild className="rounded-xl gap-2 shadow-sm shadow-primary/20 shrink-0">
          <Link to="/dashboard/create-blog">
            <PenLine className="w-4 h-4" /> Write New Post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Posts" value={stats.total} icon={FileText} sub={`${stats.published} published`} color="bg-primary/10 text-primary" />
          <StatCard label="Total Likes" value={stats.likes} icon={Heart} sub="across all posts" color="bg-pink-500/10 text-pink-500" />
          <StatCard label="Total Views" value={stats.views} icon={Eye} sub="all time" color="bg-violet-500/10 text-violet-500" />
          <StatCard label="Comments" value={stats.comments} icon={MessageSquare} sub="received" color="bg-blue-500/10 text-blue-500" />
        </div>
      )}

      {/* Chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Post Performance
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Likes, views & comments per published post</p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="w-10 h-10 opacity-20 mb-3" />
            <p className="text-sm">No published posts yet to chart.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} className="fill-muted-foreground" />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="views" fill="oklch(0.72 0.18 285 / 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="likes" fill="oklch(0.65 0.22 0 / 70%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="comments" fill="oklch(0.55 0.22 285)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {!isLoading && chartData.length > 0 && (
          <div className="flex items-center gap-5 mt-4 justify-center">
            {[
              { label: "Views", color: "bg-violet-400/40" },
              { label: "Likes", color: "bg-rose-500/70" },
              { label: "Comments", color: "bg-primary" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-3 h-3 rounded-sm ${l.color}`} /> {l.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Posts list */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Your Posts
            <span className="text-xs font-normal text-muted-foreground">({stats.total})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No posts yet"
            description="Write your first post to see it here."
            action={
              <Button asChild className="rounded-xl gap-2" size="sm">
                <Link to="/dashboard/create-blog">
                  <PenLine className="w-4 h-4" /> Start Writing
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-border/30">
            {posts.map((post) => (
              <PostRow key={post._id} post={post} onDelete={() => setDeleteTarget(post)} onEdit={(id) => navigate(`/dashboard/edit-blog/${id}`)} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Post"
        description={deleteTarget ? `Delete "${deleteTarget.title}"? This cannot be undone.` : ""}
        onConfirm={handleDelete}
      />
    </div>
  )
}

interface PostRowProps {
  post: Post
  onDelete: () => void
  onEdit: (id: string) => void
}

function PostRow({ post, onDelete, onEdit }: PostRowProps) {
  const catName = post.categoryDetails?.name ?? post.category?.name

  return (
    <div className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {post.title}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
          {catName && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {catName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(post.publishedAt ?? post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {post.likeCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.viewCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {post.commentCount ?? 0}
          </span>
        </div>
      </div>

      <Badge variant="outline" className={`text-xs font-medium capitalize hidden sm:flex ${POST_STATUS_COLORS[post.status]}`}>
        {post.status}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {post.status === "published" && (
            <DropdownMenuItem asChild>
              <Link to={`/blogs/${post._id}`} className="flex items-center gap-2 cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" /> View Post
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onEdit(post._id)} className="flex items-center gap-2 cursor-pointer">
            <PenLine className="w-3.5 h-3.5" /> Edit Post
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
