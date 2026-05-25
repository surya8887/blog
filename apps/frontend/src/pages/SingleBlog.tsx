import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Heart, MessageSquare, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/shared/Spinner"
import { postsApi } from "@/api/posts.api"
import { likesApi } from "@/api/likes.api"
import { useAuthStore } from "@/store/useAuthStore"
import { getReadTime } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"
import type { Post } from "@/types"

import { PostHero } from "@/features/blog/PostHero"
import { CommentsSection } from "@/features/blog/CommentsSection"

export function SingleBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  const [commentCount, setCommentCount] = useState(0)
  const commentsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)

    postsApi
      .getById(id)
      .then((data) => {
        if (cancelled) return
        setPost(data)
        setLikeCount(data.likeCount ?? 0)
        setCommentCount(data.commentCount ?? 0)
      })
      .catch((error) => {
        console.error("Failed to fetch post:", error)
        navigate("/blogs")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  useEffect(() => {
    if (!id || !user) return
    let cancelled = false
    likesApi
      .status(id)
      .then((res) => {
        if (!cancelled) setIsLiked(res.isLiked)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [id, user])

  const handleToggleLike = async () => {
    if (!id) return
    if (!user) {
      toast.error("Please log in to like posts.")
      navigate("/login")
      return
    }
    if (isTogglingLike) return

    setIsTogglingLike(true)
    const previousLiked = isLiked
    const nextLiked = !previousLiked
    setIsLiked(nextLiked)
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1))

    try {
      const res = await likesApi.toggle(id)
      setIsLiked(res.isLiked)
    } catch (error) {
      setIsLiked(previousLiked)
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1))
      toast.error(getErrorMessage(error, "Failed to toggle like."))
    } finally {
      setIsTogglingLike(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link.")
    }
  }

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const readTime = getReadTime(post?.content)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-12 h-12" />
      </div>
    )
  }

  if (!post) return null

  return (
    <article className="min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      <PostHero post={post} likeCount={likeCount} readTime={readTime} />

      <div className="container max-w-3xl mx-auto px-4 mt-16">
        {/* Floating Actions */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          <FloatingAction
            label={isLiked ? "Unlike" : "Like"}
            active={isLiked}
            onClick={handleToggleLike}
            disabled={isTogglingLike}
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? "text-pink-500 fill-pink-500" : "text-muted-foreground group-hover:text-pink-500"}`} />
          </FloatingAction>
          <FloatingAction label="Comments" onClick={scrollToComments}>
            <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </FloatingAction>
          <FloatingAction label="Share" onClick={handleShare}>
            <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </FloatingAction>
        </div>

        {/* Article body */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none font-serif prose-headings:font-sans prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-3xl prose-img:shadow-2xl leading-loose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/50 mt-10 pt-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleToggleLike}
              disabled={isTogglingLike}
              className={`rounded-full px-6 transition-all duration-200 ${
                isLiked
                  ? "bg-pink-500/10 border-pink-500/40 text-pink-500 hover:bg-pink-500/20"
                  : "hover:border-pink-400 hover:text-pink-500"
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 transition-all ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
              {isLiked ? "Liked" : "Like"} ({likeCount})
            </Button>
            <Button variant="outline" onClick={scrollToComments} className="rounded-full px-6">
              <MessageSquare className="w-4 h-4 mr-2" /> Comment ({commentCount})
            </Button>
          </div>
          <Button variant="ghost" onClick={handleShare} className="rounded-full px-6">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        <div ref={commentsRef}>
          <CommentsSection
            postId={post._id}
            onCountChange={(delta) => setCommentCount((c) => Math.max(0, c + delta))}
          />
        </div>
      </div>
    </article>
  )
}

interface FloatingActionProps {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function FloatingAction({ label, active, disabled, onClick, children }: FloatingActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-200 group ${
        active
          ? "bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30"
          : "bg-background/50 border-border/50 hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  )
}
