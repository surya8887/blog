import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { CategoryPills } from "@/components/blog/CategoryPills"
import { PostCard } from "@/components/blog/PostCard"
import { categoriesApi } from "@/api/categories.api"
import { postsApi } from "@/api/posts.api"
import type { Category, Post } from "@/types"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ALL_CATEGORY = "All"

export function Blogs() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("category") || ALL_CATEGORY)
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const urlSearchQuery = searchParams.get("search") || ""

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
    const selectedCat = categories.find((c) => c.name === activeCategory)
    const categoryId = selectedCat ? selectedCat._id : undefined

    postsApi
      .list({
        page: currentPage,
        limit: 7,
        ...(activeCategory !== ALL_CATEGORY && categoryId ? { category: categoryId } : {}),
        ...(urlSearchQuery ? { search: urlSearchQuery } : {})
      })
      .then((result) => {
        if (!cancelled) {
          setPosts(result.docs ?? [])
          setTotalPages(result.totalPages || 1)
        }
      })
      .catch((err) => console.error("Failed to fetch posts:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory, currentPage, urlSearchQuery, categories])

  useEffect(() => {
    setCurrentPage(1)
  }, [urlSearchQuery])

  useEffect(() => {
    const cat = searchParams.get("category")
    if (cat && cat !== activeCategory) {
      setActiveCategory(cat)
    }
  }, [searchParams, activeCategory])

  const handleCategorySelect = (c: string | undefined) => {
    setActiveCategory(c || ALL_CATEGORY)
    setCurrentPage(1)
  }

  const isDefaultView = activeCategory === ALL_CATEGORY && !urlSearchQuery && currentPage === 1
  const featuredPost = isDefaultView ? posts[0] : null
  const recentPosts = isDefaultView ? posts.slice(1) : posts
  const categoryNames = [ALL_CATEGORY, ...categories.map((c) => c.name)]

  const renderPaginationItems = () => {
    const items = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage(i)
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" isActive={currentPage === 1} onClick={(e) => { e.preventDefault(); setCurrentPage(1) }}>1</PaginationLink>
        </PaginationItem>
      )
      
      if (currentPage > 3) {
        items.push(<PaginationItem key="ellipsis1"><PaginationEllipsis /></PaginationItem>)
      }
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive={currentPage === i} onClick={(e) => { e.preventDefault(); setCurrentPage(i) }}>{i}</PaginationLink>
          </PaginationItem>
        )
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationItem key="ellipsis2"><PaginationEllipsis /></PaginationItem>)
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" isActive={currentPage === totalPages} onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages) }}>{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

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
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 mt-12">
        <CategoryPills
          categories={categoryNames}
          selected={activeCategory}
          allowDeselect={false}
          onSelect={handleCategorySelect}
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
              {urlSearchQuery
                ? `Search Results for "${urlSearchQuery}"`
                : activeCategory === ALL_CATEGORY
                ? "Latest Articles"
                : `${activeCategory} Articles`}
            </h3>

            {recentPosts.length === 0 && (!featuredPost || activeCategory !== ALL_CATEGORY) ? (
              <div className="text-center py-10 text-muted-foreground">
                No posts found for this category.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map((post, i) => (
                    <PostCard key={post._id} post={post} index={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) setCurrentPage(p => p - 1)
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {renderPaginationItems()}

                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage < totalPages) setCurrentPage(p => p + 1)
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
