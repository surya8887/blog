import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Menu, X, Search, Hexagon, Shield, PenLine } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/store/useAuthStore"
import { authApi } from "@/api/auth.api"
import { logout as firebaseLogout } from "@/services/firebase"
import { isAdmin } from "@/constants/roles"
import { APP_NAME } from "@/constants/app"
import { getDisplayName } from "@/lib/user"
import { getInitial } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/blogs", label: "Blogs" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
] as const

function NavLinksList() {
  return (
    <>
      {NAV_LINKS.map(({ to, label }, idx) => (
        <Link
          key={to}
          to={to}
          className={
            idx === 0
              ? "text-sm font-medium transition-colors hover:text-primary"
              : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          }
        >
          {label}
        </Link>
      ))}
    </>
  )
}

export function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchValue.trim())}`)
    } else {
      navigate(`/blogs`)
    }
  }

  const handleLogout = async () => {
    try {
      await firebaseLogout()
      await authApi.logout()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log out from server"))
    } finally {
      clearAuth()
      toast.success("Successfully logged out")
    }
  }

  const displayName = getDisplayName(user)
  const userIsAdmin = isAdmin(user)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <Hexagon className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">{APP_NAME}</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <NavLinksList />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search articles..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[200px] lg:w-[300px]"
              />
            </form>
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/dashboard/create-blog">
                  <PenLine className="h-4 w-4" />
                  Write
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile?.profilePicture ?? undefined} alt={displayName} />
                      <AvatarFallback>{getInitial(displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                    <Link to="/dashboard/create-blog">Write a Blog</Link>
                  </DropdownMenuItem>
                  {userIsAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="container md:hidden border-t py-4 px-4 pb-6 flex flex-col gap-4 bg-background">
          <NavLinksList />
          <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search articles..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
            />
          </form>
          {!user && (
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium">Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  )
}
