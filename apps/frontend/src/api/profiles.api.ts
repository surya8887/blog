import { api } from "./axios"
import type { ApiResponse, Profile, User } from "@/types"

export const profilesApi = {
  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/profiles/me")
    return res.data.data
  },

  async updateMe(payload: Partial<Profile>): Promise<User> {
    const res = await api.put<ApiResponse<User>>("/profiles/me", payload)
    return res.data.data
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append("profilePicture", file)
    const res = await api.post<ApiResponse<User>>("/profiles/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },

  async uploadCover(file: File): Promise<User> {
    const formData = new FormData()
    formData.append("coverPicture", file)
    const res = await api.post<ApiResponse<User>>("/profiles/me/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },
}
