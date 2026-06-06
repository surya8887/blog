import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { postsApi } from "@/api/posts.api"
import { PostCard } from "@/components/blog/PostCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { FileText } from "lucide-react"
import type { Post } from "@/types"

export function FeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    postsApi
      .list({ limit: 3 })
      .then((result) => {
        if (!cancelled) setPosts(result.docs ?? [])
      })
      .catch((err) => console.error("Failed to fetch featured posts:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
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
        <EmptyState icon={FileText} title="No featured posts yet." />
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
              <PostCard post={post} index={i} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
