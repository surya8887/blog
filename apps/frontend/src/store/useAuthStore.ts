import { create } from 'zustand'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture: string | null
  bio?: string | null
}

export interface User {
  id: string
  email: string
  isActive: boolean
  isVerified: boolean
  role: string
  profile: UserProfile | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ user: null }),
}))
