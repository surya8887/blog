import { api } from "./axios"
import type { ApiResponse, UploadResult } from "@/types"

export const uploadApi = {
  async image(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append("image", file)
    const res = await api.post<ApiResponse<UploadResult>>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },
}
