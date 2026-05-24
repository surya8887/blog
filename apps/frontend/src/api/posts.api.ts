import { api } from "./axios"
import type { ApiResponse, Paginated, Post, PostStatus } from "@/types"

interface ListParams {
  page?: number
  limit?: number
  search?: string
  category?: string
}

export interface PostPayload {
  title: string
  content: string
  category: string
  status: PostStatus
  excerpt?: string
  coverImage?: string
  tags?: string[]
}

export const postsApi = {
  async list(params: ListParams = {}): Promise<Paginated<Post>> {
    const res = await api.get<ApiResponse<Paginated<Post>>>("/posts", { params })
    return res.data.data
  },

  async myPosts(params: ListParams = {}): Promise<Paginated<Post>> {
    const res = await api.get<ApiResponse<Paginated<Post>>>("/posts/my-posts", { params })
    return res.data.data
  },

  async adminAll(params: ListParams = {}): Promise<Paginated<Post>> {
    const res = await api.get<ApiResponse<Paginated<Post>>>("/posts/admin/all", { params })
    return res.data.data
  },

  async getById(id: string): Promise<Post> {
    const res = await api.get<ApiResponse<Post>>(`/posts/${id}`)
    return res.data.data
  },

  async create(payload: PostPayload): Promise<Post> {
    const res = await api.post<ApiResponse<Post>>("/posts", payload)
    return res.data.data
  },

  async update(id: string, payload: Partial<PostPayload>): Promise<Post> {
    const res = await api.put<ApiResponse<Post>>(`/posts/${id}`, payload)
    return res.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },
}
