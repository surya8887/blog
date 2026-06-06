import { Hero } from "@/features/home/components/Hero"
import { FeaturedPosts } from "@/features/home/components/FeaturedPosts"
import { Categories } from "@/features/home/components/Categories"
import { TrendingPosts } from "@/features/home/components/TrendingPosts"
import { Newsletter } from "@/features/home/components/Newsletter"

export function Home() {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
      <Hero />
      <FeaturedPosts />
      <Categories />
      <TrendingPosts />
      <Newsletter />
    </div>
  )
}
