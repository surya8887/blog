import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import {
  FileText, MessageSquare, FolderTree, Users, TrendingUp, Eye
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/api/axios"
import { toast } from "sonner"

interface Stats {
  totalPosts: number
  totalComments: number
  totalCategories: number
  totalAuthors: number
}

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: number | string; icon: any; color: string; href: string
}) {
  return (
    <Link
      to={href}
      className="bg-card rounded-2xl border border-border/50 p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold tracking-tight mt-1 group-hover:text-primary transition-colors">{value}</p>
      </div>
    </Link>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="capitalize" style={{ color: p.fill }}>
            {p.dataKey}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, postsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/posts/admin/all", { params: { limit: 7 } }),
        ])
        setStats(statsRes.data.data)
        setRecentPosts(postsRes.data.data?.docs || [])
      } catch (e) {
        toast.error("Failed to load admin data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = recentPosts
    .slice(0, 7)
    .reverse()
    .map(p => ({
      name: p.title?.length > 14 ? p.title.slice(0, 14) + "…" : p.title,
      views: p.viewCount || 0,
      likes: p.likeCount || 0,
      comments: p.commentCount || 0,
    }))

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your blog platform.</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Posts" value={stats.totalPosts} icon={FileText} color="bg-primary/10 text-primary" href="/admin/posts" />
          <StatCard label="Total Comments" value={stats.totalComments} icon={MessageSquare} color="bg-blue-500/10 text-blue-500" href="/admin/comments" />
          <StatCard label="Categories" value={stats.totalCategories} icon={FolderTree} color="bg-emerald-500/10 text-emerald-500" href="/admin/categories" />
          <StatCard label="Authors" value={stats.totalAuthors} icon={Users} color="bg-violet-500/10 text-violet-500" href="/admin" />
        </div>
      )}

      {/* Chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Recent Posts Performance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Views, likes & comments for the latest posts</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="w-10 h-10 opacity-20 mb-3" />
            <p className="text-sm">No posts to display.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} className="fill-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" fill="oklch(0.72 0.18 285 / 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="likes" fill="oklch(0.65 0.22 0 / 70%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="comments" fill="oklch(0.55 0.22 285)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {!isLoading && chartData.length > 0 && (
          <div className="flex items-center gap-5 mt-4 justify-center">
            {[{ label: "Views", color: "bg-violet-400/40" }, { label: "Likes", color: "bg-rose-500/70" }, { label: "Comments", color: "bg-primary" }].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-3 h-3 rounded-sm ${l.color}`} /> {l.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Recent Posts
          </h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-border/30">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {recentPosts.slice(0, 5).map(post => (
              <Link
                key={post._id}
                to={`/admin/posts/${post._id}/comments`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground/40" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">by {post.author?.name || "Unknown"} · {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 shrink-0">
                  <span>{post.viewCount || 0} views</span>
                  <span>{post.commentCount || 0} comments</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
