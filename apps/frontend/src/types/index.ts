export type Role = "USER" | "ADMIN" | "SUPERADMIN"

export type PostStatus = "draft" | "published" | "archived"

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export interface Paginated<T> {
  docs: T[]
  totalDocs?: number
  totalPages: number
  page: number
  limit: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
}

export interface Profile {
  id?: string
  userId?: string
  firstName: string
  lastName: string
  bio?: string | null
  phone?: string | null
  birthDate?: string | null
  gender?: string | null
  address?: string | null
  profilePicture?: string | null
  coverPicture?: string | null
  socialLinks?: SocialLinks
  createdAt?: string
  updatedAt?: string
}

export interface User {
  id: string
  email: string
  role: Role
  isActive: boolean
  isVerified: boolean
  profile: Profile | null
  createdAt?: string
  updatedAt?: string
}

export interface PostAuthor {
  userId?: string
  name?: string
  avatar?: string
}

export interface PostCategoryRef {
  _id?: string
  name?: string
  slug?: string
}

export interface Post {
  _id: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  status: PostStatus
  tags?: string[]
  author?: PostAuthor
  category?: PostCategoryRef
  categoryDetails?: PostCategoryRef
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  updatedAt?: string
  publishedAt?: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  children?: Category[]
}

export interface Comment {
  _id: string
  content: string
  author: PostAuthor & { userId: string }
  post?: string
  postDetails?: { _id: string; title: string }
  createdAt: string
  replies?: Comment[]
}

export interface AdminStats {
  totalPosts: number
  totalComments: number
  totalCategories: number
  totalAuthors: number
}

export interface UploadResult {
  url: string
}
