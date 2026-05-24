import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"

import { categoriesApi } from "@/api/categories.api"
import { getCategoryStyle } from "@/lib/category-style"
import type { Category } from "@/types"

export function Categories() {
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
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
      <div className="bg-muted/30 border-b border-border/50 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Explore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Topics
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you're looking for. Browse our curated categories and dive into specific fields of software engineering.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 mt-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No categories found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const { icon: Icon, color, desc } = getCategoryStyle(category.name)
              return (
                <Link
                  key={category._id}
                  to={`/blogs?category=${encodeURIComponent(category.name)}`}
                  className="group relative bg-card border border-white/5 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color}`} />

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg ${color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-muted-foreground mb-8 line-clamp-2">{desc}</p>

                    <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                      <span className="text-sm font-medium text-muted-foreground">View articles</span>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
