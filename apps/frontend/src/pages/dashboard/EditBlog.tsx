import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { BlogEditor, type BlogEditorInitialValues } from "@/features/blog/BlogEditor"
import { Spinner } from "@/components/shared/Spinner"
import { postsApi } from "@/api/posts.api"
import { getErrorMessage } from "@/lib/error"

export function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState<BlogEditorInitialValues | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    postsApi
      .getById(id)
      .then((p) => {
        if (cancelled) return
        setInitial({
          title: p.title ?? "",
          content: p.content ?? "",
          excerpt: p.excerpt ?? "",
          tags: p.tags ?? [],
          category: p.categoryDetails?.name ?? p.category?.name ?? "",
          status: p.status ?? "draft",
          coverImage: p.coverImage ?? null,
        })
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, "Failed to load post."))
        navigate("/dashboard")
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  if (!id || !initial) return <Spinner fullScreen />

  return (
    <BlogEditor
      initialValues={initial}
      onSave={async (payload) => {
        await postsApi.update(id, payload)
        toast.success("Post updated!")
        navigate("/dashboard")
      }}
      saveActions={[
        { label: "Save Draft", status: "draft", variant: "outline", desktopOnly: true },
        {
          label: "Publish",
          status: "published",
          icon: <Save className="w-4 h-4 mr-2" />,
        },
      ]}
    />
  )
}
