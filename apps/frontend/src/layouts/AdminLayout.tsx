import { Outlet, NavLink } from "react-router-dom"
import {
  ChevronRight, FileText, FolderTree, Home, LayoutDashboard, MessageSquare, Shield, Users,
  type LucideIcon,
} from "lucide-react"

import { AdminGuard } from "@/components/auth/AdminGuard"
import { useAuthStore } from "@/store/useAuthStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { APP_NAME } from "@/constants/app"
import { getDisplayName } from "@/lib/user"
import { getInitial } from "@/lib/format"

interface NavItem {
  name: string
  path: string
  icon: LucideIcon
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Posts", path: "/admin/posts", icon: FileText },
  { name: "Comments", path: "/admin/comments", icon: MessageSquare },
  { name: "Categories", path: "/admin/categories", icon: FolderTree },
]

export const AdminLayout = () => {
  const { user } = useAuthStore()
  const displayName = getDisplayName(user, "Admin")

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border/40 bg-card">
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border/40">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Admin Panel</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{APP_NAME} Management</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.filter(item => item.name !== "Users" || user?.role === "SUPERADMIN").map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
                <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-40" />
              </NavLink>
            ))}

            <div className="my-4 border-t border-border/40" />

            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Home className="w-4 h-4 shrink-0" />
              Back to Site
            </NavLink>
          </nav>

          <div className="p-3 border-t border-border/40">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/50">
              <Avatar className="w-8 h-8 border border-border/50">
                <AvatarImage src={user?.profile?.profilePicture ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {getInitial(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm flex">
          {NAV_ITEMS.filter(item => item.name !== "Users" || user?.role === "SUPERADMIN").map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AdminGuard>
  )
}
