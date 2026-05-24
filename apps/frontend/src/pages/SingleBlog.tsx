import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, MessageSquare, Heart, Share2, Loader2, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/api/axios"

export function SingleBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/posts/${id}`)
        setPost(response.data.data)
      } catch (error) {
        console.error("Failed to fetch post:", error)
        navigate("/blogs") // Redirect back if not found
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchPost()
  }, [id, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) return null

  return (
    <article className="min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-muted overflow-hidden">
        <img 
          src={post.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container max-w-4xl mx-auto px-4 pb-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4 backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <div className="flex gap-2 mb-6">
              <Badge className="bg-primary/80 backdrop-blur-md hover:bg-primary border-none px-3 py-1 text-sm shadow-xl">
                {post.category?.name || "Uncategorized"}
              </Badge>
              {post.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-white/10 px-3 py-1 text-sm shadow-xl hover:bg-black/60">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-xl">
              {post.title}
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl leading-relaxed mb-8 font-serif drop-shadow-md">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between border-t border-white/20 pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-white/20 shadow-xl">
                  <AvatarImage src={post.author?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.author?.name?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-lg drop-shadow-md">{post.author?.name || "Anonymous"}</p>
                  <p className="text-white/70 text-sm drop-shadow-md">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2 drop-shadow-md">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">5 min read</span>
                </div>
                <div className="flex items-center gap-2 drop-shadow-md">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" />
                  <span className="font-medium">{post.likeCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-3xl mx-auto px-4 mt-16">
        
        {/* Floating Actions */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 bg-background/50 backdrop-blur-md shadow-lg hover:border-primary/50 group">
            <Heart className="w-5 h-5 text-muted-foreground group-hover:text-pink-500 transition-colors" />
          </Button>
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 bg-background/50 backdrop-blur-md shadow-lg hover:border-primary/50 group">
            <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 bg-background/50 backdrop-blur-md shadow-lg hover:border-primary/50 group">
            <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        </div>

        {/* Markdown Content (Using standard HTML for now since it's a simple string in dummy data) */}
        <div className="prose prose-lg dark:prose-invert max-w-none font-serif prose-headings:font-sans prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-3xl prose-img:shadow-2xl leading-loose">
          {/* For real markdown, we'd use react-markdown. Since our dummy data is plain text, we render it simply. */}
          {post.content.split('\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="mb-6">{paragraph}</p>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/50 mt-16 pt-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-full px-6">
              <Heart className="w-4 h-4 mr-2" /> Like ({post.likeCount || 0})
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              <MessageSquare className="w-4 h-4 mr-2" /> Comment ({post.commentCount || 0})
            </Button>
          </div>
          <Button variant="ghost" className="rounded-full px-6">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

      </div>
    </article>
  )
}
