import {
  Database, Hash, Layout, Palette, Server, Shield, Smartphone, 
  Cpu, Bot, Lock, Code2, Coffee, Globe, Gamepad2, Briefcase, Camera, 
  BookOpen, HeartPulse, Music, Video, Bitcoin, Cloud, BarChart3, PenTool,
  Trophy, Plane, Compass, Sparkles, Folder,
  type LucideIcon,
} from "lucide-react"

interface CategoryStyle {
  icon: LucideIcon
  /** Tailwind background-color class for the icon container */
  color: string
  /** Default short description, used when one is not provided */
  desc: string
}

const EXACT_STYLES: Record<string, CategoryStyle> = {
  "Frontend Development": { icon: Layout, color: "bg-blue-500", desc: "Master React, Vue, CSS architecture, and modern web UI." },
  "Backend Architecture": { icon: Server, color: "bg-emerald-500", desc: "Deep dives into Node.js, microservices, and system design." },
  "Database Systems": { icon: Database, color: "bg-amber-500", desc: "PostgreSQL, MongoDB, Redis, and data modeling strategies." },
  "Mobile App Dev": { icon: Smartphone, color: "bg-purple-500", desc: "React Native, Swift, and building cross-platform experiences." },
  "Design": { icon: Palette, color: "bg-pink-500", desc: "Design systems, accessibility, and user-centric interfaces." },
  "Web Security": { icon: Shield, color: "bg-red-500", desc: "Authentication, OAuth, preventing XSS/CSRF, and encryption." },
}

// Maps keywords to a specific icon and color
const KEYWORD_MAPPINGS: Array<{ keywords: string[], icon: LucideIcon, color: string }> = [
  { keywords: ["ai", "artificial intelligence", "machine learning", "deep learning", "llm", "gpt"], icon: Bot, color: "bg-indigo-500" },
  { keywords: ["tech", "technology", "hardware", "gadget"], icon: Cpu, color: "bg-cyan-500" },
  { keywords: ["cyber", "security", "hack", "infosec", "privacy"], icon: Lock, color: "bg-red-500" },
  { keywords: ["program", "code", "coding", "software", "developer", "react", "javascript", "python"], icon: Code2, color: "bg-blue-600" },
  { keywords: ["life", "lifestyle", "daily", "personal", "blog", "thoughts", "coffee"], icon: Coffee, color: "bg-amber-600" },
  { keywords: ["web", "internet", "online", "browser"], icon: Globe, color: "bg-blue-400" },
  { keywords: ["game", "gaming", "esports", "play"], icon: Gamepad2, color: "bg-violet-500" },
  { keywords: ["business", "finance", "marketing", "startup", "entrepreneur"], icon: Briefcase, color: "bg-slate-600" },
  { keywords: ["photo", "photography", "camera", "picture"], icon: Camera, color: "bg-zinc-500" },
  { keywords: ["book", "education", "learning", "tutorial", "guide", "study"], icon: BookOpen, color: "bg-orange-500" },
  { keywords: ["health", "fitness", "medical", "wellness", "workout"], icon: HeartPulse, color: "bg-rose-500" },
  { keywords: ["music", "audio", "sound", "song", "podcast"], icon: Music, color: "bg-fuchsia-500" },
  { keywords: ["video", "movie", "film", "youtube", "cinema"], icon: Video, color: "bg-red-600" },
  { keywords: ["crypto", "bitcoin", "ethereum", "web3", "blockchain", "nft"], icon: Bitcoin, color: "bg-yellow-500" },
  { keywords: ["cloud", "aws", "azure", "gcp", "serverless", "devops"], icon: Cloud, color: "bg-sky-500" },
  { keywords: ["data", "analytics", "statistics", "math"], icon: BarChart3, color: "bg-teal-500" },
  { keywords: ["design", "ui", "ux", "art", "creative", "draw"], icon: PenTool, color: "bg-pink-500" },
  { keywords: ["sport", "sports", "football", "soccer", "basketball", "tennis", "athlete"], icon: Trophy, color: "bg-amber-500" },
  { keywords: ["travel", "trip", "journey", "explore", "vacation", "tour", "adventure"], icon: Plane, color: "bg-sky-400" },
  { keywords: ["nature", "environment", "outdoors", "earth"], icon: Compass, color: "bg-emerald-600" },
  { keywords: ["magic", "inspiration", "ideas", "random"], icon: Sparkles, color: "bg-yellow-400" },
  { keywords: ["other", "misc", "miscellaneous", "general"], icon: Folder, color: "bg-slate-400" },
]

const DEFAULT_STYLE: CategoryStyle = {
  icon: Hash,
  color: "bg-primary",
  desc: "Explore articles in this category.",
}

// Fallback colors for unmapped categories to make them look diverse
const FALLBACK_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-pink-500", 
  "bg-amber-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500"
]

export function getCategoryStyle(name: string): CategoryStyle {
  if (!name) return DEFAULT_STYLE;

  // 1. Check exact match
  if (EXACT_STYLES[name]) {
    return EXACT_STYLES[name];
  }

  // 2. Check keyword matches
  const lowerName = name.toLowerCase();
  for (const mapping of KEYWORD_MAPPINGS) {
    if (mapping.keywords.some(kw => lowerName.includes(kw))) {
      return {
        icon: mapping.icon,
        color: mapping.color,
        desc: `Explore articles about ${name}.`
      };
    }
  }

  // 3. Deterministic random color based on string length & char codes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % FALLBACK_COLORS.length;

  return { 
    icon: Hash, 
    color: FALLBACK_COLORS[colorIndex], 
    desc: `Explore articles about ${name}.` 
  };
}
