import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Clock, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock Data for UI demonstration
const FEATURED_POST = {
  id: "1",
  title: "The Future of Web Development in 2025",
  excerpt: "Explore the cutting-edge frameworks, serverless architectures, and AI-driven workflows that are shaping the next generation of web applications.",
  author: "Vijay Kumar",
  date: "May 24, 2026",
  readTime: "8 min read",
  category: "Technology",
  imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop"
}

const RECENT_POSTS = [
  {
    id: "2",
    title: "Mastering React Server Components",
    excerpt: "A deep dive into how Server Components can drastically improve your application's performance and SEO.",
    author: "Sarah Drasner",
    date: "May 20, 2026",
    readTime: "6 min read",
    category: "React",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Designing for Accessibility First",
    excerpt: "Why building accessible web interfaces isn't just a legal requirement, but a fundamental aspect of good UI/UX design.",
    author: "Emma Bostian",
    date: "May 18, 2026",
    readTime: "5 min read",
    category: "Design",
    imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "4",
    title: "Understanding Micro-Frontends",
    excerpt: "Breaking down monolithic frontend applications into scalable, manageable, and independent micro-apps.",
    author: "Addy Osmani",
    date: "May 15, 2026",
    readTime: "10 min read",
    category: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "5",
    title: "The Ultimate Guide to Tailwind CSS",
    excerpt: "Learn how to build responsive, beautiful layouts in record time using utility-first CSS.",
    author: "Adam Wathan",
    date: "May 10, 2026",
    readTime: "7 min read",
    category: "CSS",
    imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2070&auto=format&fit=crop"
  },
]

const CATEGORIES = ["All", "Technology", "React", "Design", "Architecture", "CSS"]

export function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header & Search */}
      <div className="bg-muted/30 border-b border-border/50 py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Read our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Insights</span>
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
        {/* Categories Pill Menu */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post (Only show if "All" is selected) */}
        {activeCategory === "All" && (
          <div className="mb-20 group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-white/5 bg-card">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-full overflow-hidden">
                <img 
                  src={FEATURED_POST.imageUrl} 
                  alt={FEATURED_POST.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-0 lg:opacity-100"></div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <Badge className="w-fit mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-xs">
                  {FEATURED_POST.category}
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                  {FEATURED_POST.title}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {FEATURED_POST.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{FEATURED_POST.author}</p>
                      <p className="text-xs text-muted-foreground">{FEATURED_POST.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {FEATURED_POST.readTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts Grid */}
        <h3 className="text-2xl font-bold mb-8">
          {activeCategory === "All" ? "Latest Articles" : `${activeCategory} Articles`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RECENT_POSTS.map(post => (
            <div key={post.id} className="group flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none shadow-sm">
                    {post.category}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1 relative">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="text-xs text-muted-foreground font-medium">
                    {post.date}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 group/btn">
                    Read <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-16 text-center">
          <Button variant="outline" size="lg" className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
            Load More Articles
          </Button>
        </div>

      </div>
    </div>
  )
}
