import { Outlet, NavLink } from "react-router-dom"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { User, Settings, LayoutDashboard, ChevronRight, PenLine } from "lucide-react"

export const DashboardLayout = () => {
  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Profile", path: "/dashboard/profile", icon: User },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
    { name: "Write Post", path: "/dashboard/create-blog", icon: PenLine },
  ]

  return (
    <AuthGuard>
      <div className="flex min-h-[calc(100vh-64px)]">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border/50 bg-card/50 px-3 py-6 gap-1">
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
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40" />
            </NavLink>
          ))}
        </aside>

        {/* Mobile top nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Main content — full width */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 md:pb-8 overflow-auto">
          <Outlet />
        </main>

      </div>
    </AuthGuard>
  )
}
