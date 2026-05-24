import { Navigate, useLocation } from "react-router-dom"
import { ShieldAlert } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { Spinner } from "@/components/shared/Spinner"
import { isAdmin } from "@/constants/roles"

interface AdminGuardProps {
  children: React.ReactNode
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <Spinner fullScreen />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin(user)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to access the admin dashboard. This area is restricted to administrators.
        </p>
        <Navigate to="/" replace />
      </div>
    )
  }

  return <>{children}</>
}
