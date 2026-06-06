import { api } from "./axios"
import type { ApiResponse } from "@/types"

interface LikeStatus {
  isLiked: boolean
  likeCount?: number
}

export const likesApi = {
  async status(postId: string): Promise<LikeStatus> {
    const res = await api.get<ApiResponse<LikeStatus>>(`/likes/status/${postId}`)
    return res.data.data
  },

  async toggle(postId: string): Promise<LikeStatus> {
    const res = await api.post<ApiResponse<LikeStatus>>(`/likes/toggle/${postId}`)
    return res.data.data
  },
}
