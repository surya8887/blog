import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { CheckCircle, Eye, PenLine, LayoutDashboard, Clock, Heart, Tag, Loader2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/api/axios"
import { toast } from "sonner"

// Confetti particle
function ConfettiParticle({ x, color, delay }: { x: number; color: string; delay: number }) {
  return (
    <div
      className="absolute top-0 w-2 h-2 rounded-sm opacity-0"
      style={{
        left: `${x}%`,
        background: color,
        animationName: "confetti-fall",
        animationDuration: `${2 + Math.random() * 2}s`,
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationTimingFunction: "ease-in",
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        transform: `scale(${0.5 + Math.random()})`,
      }}
    />
  )
}

const CONFETTI_COLORS = [
  "oklch(0.55 0.22 285)",
  "oklch(0.65 0.2 310)",
  "oklch(0.7 0.18 60)",
  "oklch(0.65 0.22 30)",
  "oklch(0.6 0.2 200)",
  "oklch(0.7 0.16 160)",
]

export function PublishSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 1500,
  }))

  useEffect(() => {
    if (!id) { navigate("/dashboard"); return }
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`)
        setPost(res.data.data)
      } catch {
        navigate("/dashboard")
      } finally {
        setIsLoading(false)
        setTimeout(() => setShowContent(true), 200)
      }
    }
    fetchPost()
  }, [id, navigate])

  const handleShare = async () => {
    const url = `${window.location.origin}/blogs/${id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Could not copy link.")
    }
  }

  const readTime = post ? Math.max(1, Math.ceil((post.content || "").split(" ").length / 200)) : 1

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-16">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((p, i) => (
          <ConfettiParticle key={i} {...p} />
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`relative z-10 max-w-2xl w-full transition-all duration-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Success Icon */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-bounce-in">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Post <span className="gradient-text">Published!</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Your article is now live and ready to be read by the world. 🎉
          </p>
        </div>

        {/* Post Preview Card */}
        {post && (
          <div className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-primary/5 overflow-hidden mb-8 animate-fade-up animation-delay-200">
            {post.coverImage && (
              <div className="h-56 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {(post.category?.name || post.categoryDetails?.name) && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
                    {post.category?.name || post.categoryDetails?.name}
                  </Badge>
                )}
                {post.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    <Tag className="w-3 h-3 mr-1" />#{tag}
                  </Badge>
                ))}
              </div>

              <h2 className="text-2xl font-bold leading-tight mb-3">{post.title}</h2>

              {post.excerpt && (
                <p className="text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {post.author?.name?.[0] || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{post.author?.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readTime} min read</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up animation-delay-300">
          <Button asChild size="lg" className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
            <Link to={`/blogs/${id}`}>
              <Eye className="w-4 h-4" /> View Post
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl gap-2 border-border/60">
            <Link to="/dashboard/create-blog">
              <PenLine className="w-4 h-4" /> Write Another
            </Link>
          </Button>
          <Button variant="ghost" size="lg" onClick={handleShare} className="rounded-2xl gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
