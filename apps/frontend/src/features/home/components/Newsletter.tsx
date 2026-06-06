import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="py-20 container px-4 md:px-6 mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground px-6 py-16 md:px-12 md:py-20 flex flex-col items-center text-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="bg-primary-foreground/20 p-3 rounded-full inline-block mb-6 backdrop-blur-md">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Stay ahead of the curve</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Get the latest articles, tutorials, and insights delivered straight to your inbox every week. No spam, just pure signal.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground h-12"
              required
            />
            <Button size="lg" variant="secondary" className="h-12 shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  )
}
