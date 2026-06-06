import { useNavigate } from "react-router-dom"
import { Send } from "lucide-react"
import { toast } from "sonner"

import { BlogEditor } from "@/features/blog/BlogEditor"
import { postsApi } from "@/api/posts.api"

export function CreateBlog() {
  const navigate = useNavigate()

  return (
    <BlogEditor
      onSave={async (payload) => {
        const post = await postsApi.create(payload)
        toast.success("Blog post published successfully!")
        navigate(`/dashboard/publish-success/${post._id}`)
      }}
      saveActions={[
        {
          label: "Publish",
          status: "published",
          icon: <Send className="w-4 h-4 mr-2" />,
        },
      ]}
      statusText="Unsaved draft"
    />
  )
}
