import { Outlet, NavLink } from "react-router-dom"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { User, Settings, LayoutDashboard, ChevronRight } from "lucide-react"

export const DashboardLayout = () => {
  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Profile", path: "/dashboard/profile", icon: User },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ]

  return (
    <AuthGuard>
      <div className="container mx-auto flex flex-col md:flex-row gap-8 py-8 min-h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                <ChevronRight className="ml-auto h-4 w-4 hidden md:block opacity-50" />
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-4xl">
          <Outlet />
        </main>
      </div>
    </AuthGuard>
  )
}
