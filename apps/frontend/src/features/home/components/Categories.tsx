import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import { categoriesApi } from "@/api/categories.api"
import { getCategoryStyle } from "@/lib/category-style"
import type { Category } from "@/types"

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false
    categoriesApi
      .list()
      .then((items) => {
        if (!cancelled) setCategories(items.slice(0, 6))
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
    return () => {
      cancelled = true
    }
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Explore Topics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find what matters to you. We cover everything from frontend frameworks to backend architecture.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const { icon: Icon, color } = getCategoryStyle(cat.name)
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/blogs?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={`p-4 rounded-xl mb-3 text-white transition-transform group-hover:scale-110 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">{cat.name}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
