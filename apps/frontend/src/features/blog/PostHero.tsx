import { ArrowLeft, Clock, Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FALLBACK_AUTH_IMAGE } from "@/constants/app"
import { formatLongDate, getInitial } from "@/lib/format"
import type { Post } from "@/types"

interface PostHeroProps {
  post: Post
  likeCount: number
  readTime: number
}

export function PostHero({ post, likeCount, readTime }: PostHeroProps) {
  const navigate = useNavigate()

  return (
    <div className="relative h-[65vh] min-h-[580px] w-full bg-muted overflow-hidden">
      <img
        src={post.coverImage || FALLBACK_AUTH_IMAGE}
        alt={post.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/20" />

      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4 backdrop-blur-sm border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container max-w-4xl mx-auto px-4 pb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-primary/80 backdrop-blur-md hover:bg-primary border-none px-3 py-1 text-sm shadow-xl">
              {post.category?.name ?? post.categoryDetails?.name ?? "Uncategorized"}
            </Badge>
            {post.tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-black/40 backdrop-blur-md text-white border-white/10 px-3 py-1 text-sm shadow-xl hover:bg-black/60"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight drop-shadow-xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-white/75 max-w-3xl leading-relaxed mb-5 font-serif drop-shadow-md line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-white/20 pt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-white/20 shadow-xl">
                <AvatarImage src={post.author?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitial(post.author?.name, "A")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold drop-shadow-md">{post.author?.name ?? "Anonymous"}</p>
                <p className="text-white/70 text-sm drop-shadow-md">
                  {formatLongDate(post.publishedAt ?? post.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1.5 drop-shadow-md">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{readTime} min read</span>
              </div>
              <div className="flex items-center gap-1.5 drop-shadow-md">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
                <span className="text-sm font-medium">{likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
