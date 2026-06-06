import { api } from "./axios"
import type { AdminStats, ApiResponse } from "@/types"

export const adminApi = {
  async stats(): Promise<AdminStats> {
    const res = await api.get<ApiResponse<AdminStats>>("/admin/stats")
    return res.data.data
  },
}
