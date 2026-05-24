import { create } from "zustand"
import { profilesApi } from "@/api/profiles.api"
import type { User } from "@/types"

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  clearAuth: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ user: null, isLoading: false }),
  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const user = await profilesApi.getMe()
      set({ user, isLoading: false })
    } catch {
      set({ user: null, isLoading: false })
    }
  },
}))
