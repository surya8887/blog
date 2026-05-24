import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Code, Layout, Server, Database, Smartphone, Palette, Shield, Terminal, Hash, Loader2 } from "lucide-react"
import { api } from "@/api/axios"

// We keep the visual metadata here and merge it with DB data
const CATEGORY_META: Record<string, any> = {
  "Frontend Development": { icon: <Layout className="w-8 h-8" />, color: "bg-blue-500", desc: "Master React, Vue, CSS architecture, and modern web UI." },
  "Backend Architecture": { icon: <Server className="w-8 h-8" />, color: "bg-emerald-500", desc: "Deep dives into Node.js, microservices, and system design." },
  "Database Systems": { icon: <Database className="w-8 h-8" />, color: "bg-amber-500", desc: "PostgreSQL, MongoDB, Redis, and data modeling strategies." },
  "Mobile App Dev": { icon: <Smartphone className="w-8 h-8" />, color: "bg-purple-500", desc: "React Native, Swift, and building cross-platform experiences." },
  "Design": { icon: <Palette className="w-8 h-8" />, color: "bg-pink-500", desc: "Design systems, accessibility, and user-centric interfaces." },
  "Web Security": { icon: <Shield className="w-8 h-8" />, color: "bg-red-500", desc: "Authentication, OAuth, preventing XSS/CSRF, and encryption." },
  "Technology": { icon: <Terminal className="w-8 h-8" />, color: "bg-cyan-500", desc: "General technology news, updates, and deep dives." },
  "React": { icon: <Code className="w-8 h-8" />, color: "bg-indigo-500", desc: "Everything React, Next.js, and the surrounding ecosystem." },
  "Architecture": { icon: <Server className="w-8 h-8" />, color: "bg-emerald-500", desc: "System design, microservices, and scalable infrastructure." },
  "CSS": { icon: <Palette className="w-8 h-8" />, color: "bg-pink-500", desc: "Tailwind, CSS modules, animations, and modern styling." },
}

export function Categories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/categories")
        setCategories(response.data.data || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-muted/30 border-b border-border/50 py-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Topics</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you're looking for. Browse our curated categories and dive into specific fields of software engineering.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
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
              const meta = CATEGORY_META[category.name] || {
                icon: <Hash className="w-8 h-8" />,
                color: "bg-primary",
                desc: `Explore articles about ${category.name}.`
              }

              return (
                <Link 
                  to={`/blogs?category=${category.name}`} 
                  key={category._id}
                  className="group relative bg-card border border-white/5 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-1"
                >
                  {/* Dynamic hover background glow based on category color */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${meta.color}`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg ${meta.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      {meta.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-muted-foreground mb-8 line-clamp-2">
                      {meta.desc}
                    </p>

                    <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                      <span className="text-sm font-medium text-muted-foreground">
                        View articles
                      </span>
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
