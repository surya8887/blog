import { Link } from "react-router-dom"
import { TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const TRENDING = [
  { id: 1, title: "10 React Patterns You Should Know in 2026", author: "Dan Abramov", readTime: "6 min" },
  { id: 2, title: "Why I Switched from VS Code to Cursor", author: "Guillermo Rauch", readTime: "4 min" },
  { id: 3, title: "A Deep Dive into React Server Components", author: "Lee Robinson", readTime: "12 min" },
  { id: 4, title: "The State of WebAssembly", author: "Lin Clark", readTime: "8 min" },
]

export function TrendingPosts() {
  return (
    <section className="py-16 container px-4 md:px-6 mx-auto">
      <div className="flex items-center space-x-2 mb-8">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Trending Right Now</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {TRENDING.map((post, i) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-start space-x-4 group cursor-pointer"
          >
            <div className="text-4xl font-bold text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
              0{post.id}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                <Link to={`/blogs`}>{post.title}</Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {post.author} · {post.readTime} read
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
