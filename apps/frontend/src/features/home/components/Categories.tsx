import { motion } from "framer-motion"
import { Monitor, Smartphone, Database, Palette, Shield, Terminal } from "lucide-react"

const CATEGORIES = [
  { name: "Web Dev", icon: Monitor, color: "bg-blue-500/10 text-blue-500" },
  { name: "Mobile", icon: Smartphone, color: "bg-green-500/10 text-green-500" },
  { name: "Backend", icon: Database, color: "bg-purple-500/10 text-purple-500" },
  { name: "Design", icon: Palette, color: "bg-pink-500/10 text-pink-500" },
  { name: "Security", icon: Shield, color: "bg-red-500/10 text-red-500" },
  { name: "DevOps", icon: Terminal, color: "bg-orange-500/10 text-orange-500" },
]

export function Categories() {
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
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`p-4 rounded-xl mb-3 transition-transform group-hover:scale-110 ${cat.color}`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
