import { useEffect, useState } from "react"
import { FolderTree, Loader2, PenLine, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/shared/EmptyState"

import { categoriesApi } from "@/api/categories.api"
import { slugify } from "@/lib/format"
import { getErrorMessage } from "@/lib/error"
import type { Category } from "@/types"

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [catName, setCatName] = useState("")
  const [catSlug, setCatSlug] = useState("")
  const [catParent, setCatParent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const refresh = async () => {
    try {
      setCategories(await categoriesApi.list())
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load categories"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const openCreate = () => {
    setEditingCategory(null)
    setCatName("")
    setCatSlug("")
    setCatParent("")
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setCatParent(cat.parent || "")
    setDialogOpen(true)
  }

  const handleNameChange = (val: string) => {
    setCatName(val)
    if (!editingCategory) setCatSlug(slugify(val))
  }

  const handleSave = async () => {
    if (!catName.trim() || !catSlug.trim()) {
      toast.error("Name and slug are required.")
      return
    }
    setIsSaving(true)
    try {
      const payload: any = { name: catName.trim(), slug: catSlug.trim() }
      payload.parent = catParent || null

      if (editingCategory) {
        await categoriesApi.update(editingCategory._id, payload)
        toast.success("Category updated.")
      } else {
        await categoriesApi.create(payload)
        toast.success("Category created.")
      }
      setDialogOpen(false)
      refresh()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save category."))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoriesApi.delete(deleteTarget._id)
      toast.success("Category deleted.")
      refresh()
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed."))
    }
  }

  const totalCount = categories.reduce((sum, c) => sum + 1 + (c.children?.length ?? 0), 0)

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <AdminPageHeader
        title="Categories"
        description={`Manage blog categories (${totalCount} total).`}
        action={
          <Button onClick={openCreate} className="rounded-xl gap-2 shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> New Category
          </Button>
        }
      />

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Name</div>
          <div className="col-span-4">Slug</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories yet."
            description="Create your first category to organize posts."
            action={
              <Button onClick={openCreate} className="rounded-xl gap-2" size="sm">
                <Plus className="w-4 h-4" /> Create Category
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-border/30">
            {categories.map((cat) => (
              <div key={cat._id}>
                <CategoryRow category={cat} onEdit={openEdit} onDelete={setDeleteTarget} />
                {cat.children?.map((child) => (
                  <CategoryRow
                    key={child._id}
                    category={child}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    isChild
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details." : "Add a new category to organize posts."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={catName} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Technology" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="e.g. technology" />
            </div>
            <div className="space-y-2">
              <Label>Parent Category (Optional)</Label>
              <select
                value={catParent}
                onChange={(e) => setCatParent(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">None (Top-Level)</option>
                {categories.map((c) => (
                  c._id !== editingCategory?._id && (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  )
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !catName.trim()}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? ${
                deleteTarget.children?.length ? "It has child categories that must be deleted first." : ""
              }`
            : ""
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}

interface CategoryRowProps {
  category: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  isChild?: boolean
}

function CategoryRow({ category, onEdit, onDelete, isChild = false }: CategoryRowProps) {
  const baseClass = isChild
    ? "group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-3 items-center hover:bg-muted/20 transition-colors bg-muted/10 border-t border-border/20"
    : "group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors"
  const iconBtnSize = isChild ? "h-7 w-7" : "h-8 w-8"
  const iconSize = isChild ? "w-3 h-3" : "w-3.5 h-3.5"

  return (
    <div className={baseClass}>
      <div className={`md:col-span-5 flex items-center gap-2 ${isChild ? "pl-6" : ""}`}>
        {isChild ? (
          <span className="text-muted-foreground/40">└</span>
        ) : (
          <FolderTree className="w-4 h-4 text-primary shrink-0" />
        )}
        <span className={isChild ? "text-sm" : "text-sm font-semibold"}>{category.name}</span>
        {!isChild && (category.children?.length ?? 0) > 0 && (
          <span className="text-xs text-muted-foreground">({category.children!.length} children)</span>
        )}
      </div>
      <div className="md:col-span-4">
        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{category.slug}</code>
      </div>
      <div className="md:col-span-3 flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className={iconBtnSize} onClick={() => onEdit(category)} aria-label="Edit category">
          <PenLine className={iconSize} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`${iconBtnSize} text-destructive hover:text-destructive`}
          onClick={() => onDelete(category)}
          aria-label="Delete category"
        >
          <Trash2 className={iconSize} />
        </Button>
      </div>
    </div>
  )
}
