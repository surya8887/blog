import { Link } from "react-router-dom"
import { Clock, Heart, MessageSquare, ArrowRight, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  post: any
  variant?: "default" | "compact" | "featured"
  index?: number
}

function getReadTime(content: string) {
  return Math.max(1, Math.ceil((content || "").split(" ").length / 200))
}

export function PostCard({ post, variant = "default", index = 0 }: PostCardProps) {
  const delay = Math.min(index * 100, 500)
  const readTime = getReadTime(post.content || "")
  const category = post.categoryDetails?.name || post.category?.name || "Uncategorized"
  const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1000"

  if (variant === "featured") {
    return (
      <Link
        to={`/blogs/${post._id}`}
        className="group relative block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/15 transition-all duration-500 border border-border/40 bg-card"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[380px]">
          {/* Image */}
          <div className="relative lg:col-span-3 h-56 lg:h-full overflow-hidden">
            <img
              src={post.coverImage || fallbackImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/30 opacity-0 lg:opacity-100 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <Badge className="w-fit mb-5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-medium px-3 py-1 text-xs">
              {category}
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-3">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-muted-foreground text-base mb-6 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}
            <div className="mt-auto pt-5 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                  {post.author?.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">{post.author?.name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readTime}m</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/blogs/${post._id}`}
        className="group flex gap-4 p-4 rounded-2xl hover:bg-muted/40 transition-all duration-200 border border-transparent hover:border-border/50"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage || fallbackImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-1">{category}</p>
          <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {post.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
            <Clock className="w-3 h-3" /> {readTime} min read
          </p>
        </div>
      </Link>
    )
  }

  // Default card
  return (
    <Link
      to={`/blogs/${post._id}`}
      className="group flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/8 transition-all duration-400 hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={post.coverImage || fallbackImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/85 backdrop-blur-md text-foreground border-none shadow-sm text-xs font-medium">
            {category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h4 className="text-base font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h4>
        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-3.5 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted overflow-hidden border border-border/40">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {post.author?.name?.[0] || "?"}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[80px]">
              {post.author?.name || "Anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime}m</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likeCount || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
