import { useEffect, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { CategoryPills } from "@/components/blog/CategoryPills"
import { PostCard } from "@/components/blog/PostCard"
import { categoriesApi } from "@/api/categories.api"
import { postsApi } from "@/api/posts.api"
import type { Category, Post } from "@/types"

const ALL_CATEGORY = "All"

export function Blogs() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY)
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    categoriesApi
      .list()
      .then((items) => {
        if (!cancelled) setCategories(items)
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    postsApi
      .list(activeCategory === ALL_CATEGORY ? {} : { category: activeCategory })
      .then((result) => {
        if (!cancelled) setPosts(result.docs ?? [])
      })
      .catch((err) => console.error("Failed to fetch posts:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory])

  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)
  const categoryNames = [ALL_CATEGORY, ...categories.map((c) => c.name)]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header & Search */}
      <div className="bg-muted/30 border-b border-border/50 py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Read our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Insights
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover the latest articles, tutorials, and deep-dives into web development, design, and software architecture.
          </p>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-12 py-6 text-lg rounded-full bg-background border-border/60 shadow-sm focus-visible:ring-primary/50 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 mt-12">
        <CategoryPills
          categories={categoryNames}
          selected={activeCategory}
          allowDeselect={false}
          onSelect={(c) => setActiveCategory(c || ALL_CATEGORY)}
          className="justify-center mb-16"
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeCategory === ALL_CATEGORY && featuredPost && (
              <div className="mb-20">
                <PostCard post={featuredPost} variant="featured" />
              </div>
            )}

            <h3 className="text-2xl font-bold mb-8">
              {activeCategory === ALL_CATEGORY ? "Latest Articles" : `${activeCategory} Articles`}
            </h3>

            {recentPosts.length === 0 && (!featuredPost || activeCategory !== ALL_CATEGORY) ? (
              <div className="text-center py-10 text-muted-foreground">
                No posts found for this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
