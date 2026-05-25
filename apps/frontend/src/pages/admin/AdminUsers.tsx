import { useState } from "react"
import { Users, Shield, ShieldAlert, UserIcon, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { Pagination } from "@/components/shared/Pagination"
import { SearchInput } from "@/components/shared/SearchInput"
import { EmptyState } from "@/components/shared/EmptyState"
import { useAdminList } from "@/hooks/useAdminList"
import { usersApi } from "@/api/users.api"
import { formatDate } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"
import type { User, Role } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const fetchUsers = (params: Parameters<typeof usersApi.adminAll>[0]) => usersApi.adminAll(params)

const ROLE_COLORS: Record<Role, string> = {
  USER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ADMIN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  SUPERADMIN: "bg-amber-500/10 text-amber-500 border-amber-500/20",
}

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  USER: <UserIcon className="w-3 h-3 mr-1" />,
  ADMIN: <Shield className="w-3 h-3 mr-1" />,
  SUPERADMIN: <ShieldAlert className="w-3 h-3 mr-1" />,
}

export function AdminUsers() {
  const list = useAdminList<User>({
    fetcher: fetchUsers,
    errorMessage: "Failed to load users",
  })
  const { items, setItems, isLoading, search, setSearch, page, setPage, totalPages } = list
  
  const [statusTarget, setStatusTarget] = useState<{ user: User, activate: boolean } | null>(null)

  const handleUpdateRole = async (user: User, newRole: Role) => {
    try {
      const updated = await usersApi.update(user.id, { role: newRole })
      setItems((prev) => prev.map((u) => u.id === updated.id ? updated : u))
      toast.success(`Role updated to ${newRole}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update role."))
    }
  }

  const handleToggleStatus = async () => {
    if (!statusTarget) return
    const { user, activate } = statusTarget
    try {
      const updated = await usersApi.update(user.id, { isActive: activate })
      setItems((prev) => prev.map((u) => u.id === updated.id ? updated : u))
      toast.success(`User ${activate ? 'activated' : 'deactivated'} successfully.`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update user status."))
    } finally {
      setStatusTarget(null)
    }
  }

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Manage Users"
        description="View all registered users, change their roles, and manage account access."
        action={<SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />}
      />

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/20">
          <div className="col-span-5">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Users} title={search ? "No users match your search." : "No users yet."} />
        ) : (
          <div className="divide-y divide-border/30">
            {items.map((user) => (
              <AdminUserRow 
                key={user.id} 
                user={user} 
                onRoleChange={(role) => handleUpdateRole(user, role)}
                onToggleStatus={(activate) => setStatusTarget({ user, activate })}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.activate ? "Reactivate Account" : "Deactivate Account"}
        description={
          statusTarget?.activate 
            ? `Are you sure you want to reactivate ${statusTarget?.user.profile?.firstName}'s account? They will be able to log in again.` 
            : `Are you sure you want to deactivate ${statusTarget?.user.profile?.firstName}'s account? They will be immediately logged out and unable to access the platform.`
        }
        confirmLabel={statusTarget?.activate ? "Reactivate" : "Deactivate"}
        variant={statusTarget?.activate ? "default" : "destructive"}
        onConfirm={handleToggleStatus}
      />
    </div>
  )
}

interface AdminUserRowProps {
  user: User
  onRoleChange: (role: Role) => void
  onToggleStatus: (activate: boolean) => void
}

function AdminUserRow({ user, onRoleChange, onToggleStatus }: AdminUserRowProps) {
  const name = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Unknown User"
  
  return (
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
      <div className="md:col-span-5 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border/50">
          {user.profile?.profilePicture ? (
            <img src={user.profile.profilePicture} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
              {user.profile?.firstName?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="md:col-span-2">
        <Badge variant="outline" className={`text-xs ${ROLE_COLORS[user.role]}`}>
          {ROLE_ICONS[user.role]}
          {user.role}
        </Badge>
      </div>

      <div className="md:col-span-2 flex flex-col items-start gap-1">
        {user.isActive ? (
          <span className="inline-flex items-center text-xs font-medium text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium text-destructive">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Deactivated
          </span>
        )}
        <span className="text-[10px] text-muted-foreground">Joined {formatDate(user.createdAt || "")}</span>
      </div>

      <div className="md:col-span-3 flex items-center justify-end gap-2 mt-2 md:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
              Change Role
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onRoleChange("USER")} disabled={user.role === "USER"}>
              <UserIcon className="w-4 h-4 mr-2" /> Make User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("ADMIN")} disabled={user.role === "ADMIN"}>
              <Shield className="w-4 h-4 mr-2" /> Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("SUPERADMIN")} disabled={user.role === "SUPERADMIN"} className="text-amber-500 focus:text-amber-500">
              <ShieldAlert className="w-4 h-4 mr-2" /> Make Superadmin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={user.isActive ? "ghost" : "default"}
          size="sm"
          className={user.isActive ? "h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" : "h-8 text-xs"}
          onClick={() => onToggleStatus(!user.isActive)}
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  )
}
