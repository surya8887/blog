import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { AdminGuard } from "@/components/auth/AdminGuard"
import { useAuthStore } from "@/store/useAuthStore"
import {
  LayoutDashboard, FileText, MessageSquare, FolderTree,
  ChevronRight, Shield, LogOut, Home
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Posts", path: "/admin/posts", icon: FileText },
  { name: "Comments", path: "/admin/comments", icon: MessageSquare },
  { name: "Categories", path: "/admin/categories", icon: FolderTree },
]

export const AdminLayout = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const displayName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "Admin"

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border/40 bg-card">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border/40">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Admin Panel</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">DevBlog Management</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
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

          {/* User footer */}
          <div className="p-3 border-t border-border/40">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/50">
              <Avatar className="w-8 h-8 border border-border/50">
                <AvatarImage src={user?.profile?.profilePicture || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm flex">
          {navItems.map((item) => (
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

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>

      </div>
    </AdminGuard>
  )
}
