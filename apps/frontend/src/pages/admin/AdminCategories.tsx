import { useState, useEffect } from "react"
import {
  FolderTree, Plus, Trash2, PenLine, Loader2, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { api } from "@/api/axios"
import { toast } from "sonner"

interface Category {
  _id: string
  name: string
  slug: string
  children?: Category[]
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [catName, setCatName] = useState("")
  const [catSlug, setCatSlug] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories")
      setCategories(res.data.data || [])
    } catch { toast.error("Failed to load categories") }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditingCategory(null)
    setCatName("")
    setCatSlug("")
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setDialogOpen(true)
  }

  const handleNameChange = (val: string) => {
    setCatName(val)
    if (!editingCategory) {
      setCatSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    }
  }

  const handleSave = async () => {
    if (!catName.trim() || !catSlug.trim()) { toast.error("Name and slug are required."); return }
    setIsSaving(true)
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name: catName.trim(), slug: catSlug.trim() })
        toast.success("Category updated.")
      } else {
        await api.post("/categories", { name: catName.trim(), slug: catSlug.trim() })
        toast.success("Category created.")
      }
      setDialogOpen(false)
      fetchCategories()
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save category.")
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/categories/${deleteTarget._id}`)
      toast.success("Category deleted.")
      fetchCategories()
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Delete failed.")
    }
  }

  const totalCount = categories.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0)

  return (
    <div className="px-6 py-8 pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage blog categories ({totalCount} total).</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl gap-2 shrink-0 shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Name</div>
          <div className="col-span-4">Slug</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No categories yet.</p>
            <p className="text-xs mt-1">Create your first category to organize posts.</p>
            <Button onClick={openCreate} className="mt-4 rounded-xl gap-2" size="sm">
              <Plus className="w-4 h-4" /> Create Category
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {categories.map(cat => (
              <div key={cat._id}>
                {/* Parent */}
                <div className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                  <div className="md:col-span-5 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold">{cat.name}</span>
                    {(cat.children?.length || 0) > 0 && (
                      <span className="text-xs text-muted-foreground">({cat.children!.length} children)</span>
                    )}
                  </div>
                  <div className="md:col-span-4">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{cat.slug}</code>
                  </div>
                  <div className="md:col-span-3 flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                      <PenLine className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(cat)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                {cat.children?.map(child => (
                  <div key={child._id} className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-3 items-center hover:bg-muted/20 transition-colors bg-muted/10 border-t border-border/20">
                    <div className="md:col-span-5 flex items-center gap-2 pl-6">
                      <span className="text-muted-foreground/40">└</span>
                      <span className="text-sm">{child.name}</span>
                    </div>
                    <div className="md:col-span-4">
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{child.slug}</code>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(child)}>
                        <PenLine className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(child)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
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
              <Input value={catName} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Technology" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={catSlug} onChange={e => setCatSlug(e.target.value)} placeholder="e.g. technology" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !catName.trim()}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? ${(deleteTarget as any)?.children?.length ? "It has child categories that must be deleted first." : ""}`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
