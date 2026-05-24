import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Clock, MessageSquare, Heart, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/api/axios"

export function FeaturedPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/posts?limit=3")
        setPosts(response.data.data.docs || [])
      } catch (error) {
        console.error("Failed to fetch featured posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  return (
    <section className="py-16 container px-4 md:px-6 mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Featured Posts</h2>
        <Link to="/blogs" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No featured posts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full overflow-hidden border-0 shadow-lg dark:bg-zinc-900/50 hover:shadow-xl transition-all duration-300 group cursor-pointer bg-background">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={post.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000"} 
                    alt={post.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">
                      {post.categoryDetails?.name || "Uncategorized"}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                  <div className="flex items-center text-xs text-muted-foreground mb-4 space-x-4">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      5 min read
                    </div>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author?.avatar} />
                        <AvatarFallback>{post.author?.name?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.author?.name || "Anonymous"}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <div className="flex items-center text-xs hover:text-primary transition-colors">
                        <Heart className="mr-1 h-3 w-3" />
                        {post.likeCount || 0}
                      </div>
                      <div className="flex items-center text-xs hover:text-primary transition-colors">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {post.commentCount || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
