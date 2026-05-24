import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Spinner } from "@/components/shared/Spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <Spinner fullScreen />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
