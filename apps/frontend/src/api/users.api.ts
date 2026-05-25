import { api } from "./axios"
import type { ApiResponse, Paginated, User, Role } from "@/types"

interface ListParams {
  page?: number
  limit?: number
  search?: string
}

export interface UpdateUserPayload {
  role?: Role
  isActive?: boolean
}

export const usersApi = {
  async adminAll(params: ListParams = {}): Promise<Paginated<User>> {
    const res = await api.get<ApiResponse<Paginated<User>>>("/users/admin/all", { params })
    return res.data.data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await api.put<ApiResponse<User>>(`/users/admin/${id}`, payload)
    return res.data.data
  },
}
