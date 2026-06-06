import type { Role, User } from "@/types"

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPERADMIN: "SUPERADMIN",
} as const satisfies Record<Role, Role>

export function normalizeRole(role: string | undefined | null): string {
  return (role ?? "").toLowerCase()
}

export function isAdmin(user: User | null | undefined): boolean {
  const role = normalizeRole(user?.role)
  return role === "admin" || role === "superadmin"
}

export function homePathFor(user: User | null | undefined): string {
  return isAdmin(user) ? "/admin" : "/"
}
