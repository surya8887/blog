import { api } from "./axios"
import type { ApiResponse, Comment, Paginated } from "@/types"

interface ListParams {
  page?: number
  limit?: number
  search?: string
}

interface CreatePayload {
  content: string
  postId: string
  parentId?: string
}

export const commentsApi = {
  async forPost(postId: string, params: ListParams = {}): Promise<Paginated<Comment>> {
    const res = await api.get<ApiResponse<Paginated<Comment>>>(`/comments/post/${postId}`, { params })
    return res.data.data
  },

  async adminAll(params: ListParams = {}): Promise<Paginated<Comment>> {
    const res = await api.get<ApiResponse<Paginated<Comment>>>("/comments/admin/all", { params })
    return res.data.data
  },

  async create(payload: CreatePayload): Promise<Comment> {
    const res = await api.post<ApiResponse<Comment>>("/comments", payload)
    return res.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/comments/${id}`)
  },
}
