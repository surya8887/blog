import { api } from "./axios"
import type { ApiResponse, Category } from "@/types"

interface CategoryPayload {
  name: string
  slug: string
}

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>("/categories")
    return res.data.data ?? []
  },

  async create(payload: CategoryPayload): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>("/categories", payload)
    return res.data.data
  },

  async update(id: string, payload: CategoryPayload): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload)
    return res.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
