import { api } from "./axios"
import type { ApiResponse, User } from "@/types"

interface LoginPayload {
  email: string
  password: string
}

interface SignupPayload extends LoginPayload {
  firstName: string
  lastName: string
}

interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>("/auth/login", payload)
    return res.data.data
  },

  async signup(payload: SignupPayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/auth/signup", payload)
    return res.data.data
  },

  async googleLogin(idToken: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>("/auth/google", { idToken })
    return res.data.data
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout")
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put("/auth/password", payload)
  },
}
