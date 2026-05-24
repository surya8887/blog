import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import {
  FileText, Heart, Eye, MessageSquare, TrendingUp, PenLine,
  Trash2, ExternalLink, Loader2, MoreVertical, Clock, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/api/axios"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"

interface Post {
  _id: string
  title: string
  status: "draft" | "published" | "archived"
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  publishedAt?: string
  coverImage?: string
  tags?: string[]
  categoryDetails?: { name: string }
  category?: { name: string }
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  draft: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border/50",
}

function StatCard({
  label, value, icon: Icon, sub, color
}: { label: string; value: number | string; icon: any; sub?: string; color: string }) {
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
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
  return null
}

export const DashboardOverview = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const displayName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User"

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await api.get("/posts/my-posts", { params: { limit: 50 } })
        setPosts(res.data.data?.docs || [])
      } catch (e) {
        toast.error("Failed to load your posts")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyPosts()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await api.delete(`/posts/${id}`)
      setPosts(prev => prev.filter(p => p._id !== id))
      toast.success("Post deleted.")
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete post.")
    } finally {
      setDeletingId(null)
    }
  }

  // Computed stats
  const totalPosts = posts.length
  const publishedPosts = posts.filter(p => p.status === "published").length
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0)
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0)
  const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0)

  // Chart: last 7 posts by likes + views
  const chartData = posts
    .filter(p => p.status === "published")
    .slice(0, 7)
    .reverse()
    .map(p => ({
      name: p.title.length > 16 ? p.title.slice(0, 16) + "…" : p.title,
      likes: p.likeCount || 0,
      views: p.viewCount || 0,
      comments: p.commentCount || 0,
    }))

  const readTime = (content = "") => Math.max(1, Math.ceil(content.split(" ").length / 200))

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={user?.profile?.profilePicture || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {displayName[0]?.toUpperCase()}
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

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Posts" value={totalPosts} icon={FileText}
            sub={`${publishedPosts} published`}
            color="bg-primary/10 text-primary" />
          <StatCard label="Total Likes" value={totalLikes} icon={Heart}
            sub="across all posts"
            color="bg-pink-500/10 text-pink-500" />
          <StatCard label="Total Views" value={totalViews} icon={Eye}
            sub="all time"
            color="bg-violet-500/10 text-violet-500" />
          <StatCard label="Comments" value={totalComments} icon={MessageSquare}
            sub="received"
            color="bg-blue-500/10 text-blue-500" />
        </div>
      )}

      {/* Bar Chart */}
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
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" fill="oklch(0.72 0.18 285 / 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="likes" fill="oklch(0.65 0.22 0 / 70%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="comments" fill="oklch(0.55 0.22 285)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {!isLoading && chartData.length > 0 && (
          <div className="flex items-center gap-5 mt-4 justify-center">
            {[
              { label: "Views", color: "bg-violet-400/40" },
              { label: "Likes", color: "bg-rose-500/70" },
              { label: "Comments", color: "bg-primary" },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-3 h-3 rounded-sm ${l.color}`} /> {l.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Your Posts
            <span className="text-xs font-normal text-muted-foreground">({totalPosts})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {[...Array(5)].map((_, i) => (
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
          <div className="py-20 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No posts yet</p>
            <p className="text-xs mt-1">Write your first post to see it here.</p>
            <Button asChild className="mt-5 rounded-xl gap-2" size="sm">
              <Link to="/dashboard/create-blog"><PenLine className="w-4 h-4" />Start Writing</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {posts.map((post) => {
              const catName = post.categoryDetails?.name || post.category?.name
              const dateStr = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              })
              return (
                <div key={post._id} className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  {/* Cover thumb */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {post.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      {catName && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />{catName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />{post.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />{post.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />{post.commentCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium capitalize hidden sm:flex ${STATUS_COLORS[post.status]}`}
                  >
                    {post.status}
                  </Badge>

                  {/* Actions */}
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
                      <DropdownMenuItem
                        onClick={() => navigate(`/dashboard/edit-blog/${post._id}`)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <PenLine className="w-3.5 h-3.5" /> Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(post._id, post.title)}
                        disabled={deletingId === post._id}
                        className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        {deletingId === post._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
