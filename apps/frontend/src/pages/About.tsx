import { Button } from "@/components/ui/button"
import { ArrowRight, PenTool, Sparkles, Users, BookOpen } from "lucide-react"

export function About() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">Voices</span> Worldwide.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            BlogSpace is a next-generation platform designed for passionate writers, thinkers, and storytellers. We believe in sharing knowledge, building communities, and pushing the boundaries of what's possible on the web.
          </p>
        </section>

        {/* Value Props / Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {/* Card 1 */}
          <div className="group relative p-8 rounded-3xl bg-card border border-white/5 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <PenTool className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Inspiring Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stay engaged with articles covering a wide array of topics, unique perspectives, and compelling personal stories.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 rounded-3xl bg-card border border-white/5 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 overflow-hidden mt-0 md:mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Vibrant Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with like-minded individuals. Share your insights, receive thoughtful feedback, and grow alongside fellow creators.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative p-8 rounded-3xl bg-card border border-white/5 shadow-lg hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 overflow-hidden mt-0 md:mt-16">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Open Platform</h3>
              <p className="text-muted-foreground leading-relaxed">
                We believe in the power of shared ideas. Our platform encourages collaboration and provides tools for writers to showcase their work.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to share your journey?</h2>
            <p className="text-lg text-white/70 mb-10">
              Join thousands of creators who are already reading, writing, and growing on BlogSpace. Your next big idea starts here.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Start Reading
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full px-8 text-base bg-white/10 text-white hover:bg-white/20 border border-white/10 group">
                Create an Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
