import {
  Code, Database, Hash, Layout, Palette, Server, Shield, Smartphone, Terminal,
  type LucideIcon,
} from "lucide-react"

interface CategoryStyle {
  icon: LucideIcon
  /** Tailwind background-color class for the icon container */
  color: string
  /** Default short description, used when one is not provided */
  desc: string
}

const STYLES: Record<string, CategoryStyle> = {
  "Frontend Development": { icon: Layout, color: "bg-blue-500", desc: "Master React, Vue, CSS architecture, and modern web UI." },
  "Backend Architecture": { icon: Server, color: "bg-emerald-500", desc: "Deep dives into Node.js, microservices, and system design." },
  "Database Systems": { icon: Database, color: "bg-amber-500", desc: "PostgreSQL, MongoDB, Redis, and data modeling strategies." },
  "Mobile App Dev": { icon: Smartphone, color: "bg-purple-500", desc: "React Native, Swift, and building cross-platform experiences." },
  Design: { icon: Palette, color: "bg-pink-500", desc: "Design systems, accessibility, and user-centric interfaces." },
  "Web Security": { icon: Shield, color: "bg-red-500", desc: "Authentication, OAuth, preventing XSS/CSRF, and encryption." },
  Technology: { icon: Terminal, color: "bg-cyan-500", desc: "General technology news, updates, and deep dives." },
  React: { icon: Code, color: "bg-indigo-500", desc: "Everything React, Next.js, and the surrounding ecosystem." },
  Architecture: { icon: Server, color: "bg-emerald-500", desc: "System design, microservices, and scalable infrastructure." },
  CSS: { icon: Palette, color: "bg-pink-500", desc: "Tailwind, CSS modules, animations, and modern styling." },
}

const DEFAULT_STYLE: CategoryStyle = {
  icon: Hash,
  color: "bg-primary",
  desc: "Explore articles in this category.",
}

export function getCategoryStyle(name: string): CategoryStyle {
  return STYLES[name] ?? { ...DEFAULT_STYLE, desc: `Explore articles about ${name}.` }
}
