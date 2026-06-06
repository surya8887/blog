import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

import { postsApi } from "@/api/posts.api"
import { getReadTime } from "@/lib/format"
import type { Post } from "@/types"

export function TrendingPosts() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    let cancelled = false
    postsApi
      .list({ limit: 4 })
      .then((result) => {
        if (!cancelled) setPosts(result.docs ?? [])
      })
      .catch((err) => console.error("Failed to fetch trending posts:", err))
    return () => {
      cancelled = true
    }
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="py-16 container px-4 md:px-6 mx-auto">
      <div className="flex items-center space-x-2 mb-8">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Trending Right Now</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {posts.map((post, i) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-start space-x-4 group cursor-pointer"
          >
            <div className="text-4xl font-bold text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
              0{i + 1}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                <Link to={`/blogs/${post._id}`}>{post.title}</Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {post.author?.name ?? "Anonymous"} · {getReadTime(post.content)} min read
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
