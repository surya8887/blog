import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus, ArrowLeft, Loader2, Send, X, Tag } from "lucide-react"
import { api } from "@/api/axios"

const CATEGORIES = ["Technology", "React", "Design", "Architecture", "CSS", "Life", "Career"]

export function CreateBlog() {
  const navigate = useNavigate()
  const [isPublishing, setIsPublishing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Image upload states
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string>("") // Real Cloudinary URL
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const excerptRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize content textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto"
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`
    }
  }, [content])

  // Auto-resize excerpt textarea
  useEffect(() => {
    if (excerptRef.current) {
      excerptRef.current.style.height = "auto"
      excerptRef.current.style.height = `${excerptRef.current.scrollHeight}px`
    }
  }, [excerpt])

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverFile(file)
    // Show local preview immediately while uploading
    const localUrl = URL.createObjectURL(file)
    setCoverPreview(localUrl)
    setCoverImageUrl("") // Reset previous URL

    // Upload to Cloudinary via backend
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const uploadedUrl = response.data.data.url
      setCoverImageUrl(uploadedUrl)
      // Replace blob preview with real Cloudinary URL
      setCoverPreview(uploadedUrl)
      // Revoke the object URL to free memory
      URL.revokeObjectURL(localUrl)
      toast.success("Cover image uploaded!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image.")
      setCoverFile(null)
      setCoverPreview(null)
      setCoverImageUrl("")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    setCoverImageUrl("")
  }

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const trimmed = tagInput.trim().replace(/,+$/, "")
      if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
        setTags((prev) => [...prev, trimmed])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.")
      return
    }
    if (isUploadingImage) {
      toast.error("Please wait for the image to finish uploading.")
      return
    }

    setIsPublishing(true)
    try {
      const payload: Record<string, any> = {
        title,
        content,
        category: selectedCategory || "Technology",
        status: "published",
      }

      if (excerpt.trim()) payload.excerpt = excerpt.trim()
      if (coverImageUrl) payload.coverImage = coverImageUrl
      if (tags.length > 0) payload.tags = tags

      const response = await api.post("/posts", payload)
      const postId = response.data.data._id

      toast.success("Blog post published successfully!")
      navigate(`/dashboard/publish-success/${postId}`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to publish blog post.")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">

      {/* Top Navbar / Publish Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {title.trim() ? "Draft saved" : "Unsaved draft"}
            </span>
            {isUploadingImage && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
              </span>
            )}
            <Button
              onClick={handlePublish}
              disabled={isPublishing || isUploadingImage || !title.trim() || !content.trim()}
              className="rounded-full shadow-md shadow-primary/20"
            >
              {isPublishing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Publish</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 mt-8">

        {/* Cover Image Uploader */}
        <div className="mb-10 group relative">
          <Label
            htmlFor="coverUpload"
            className={`relative flex flex-col items-center justify-center w-full h-48 md:h-64 rounded-3xl border-2 border-dashed border-border/50 cursor-pointer overflow-hidden transition-all duration-300 ${coverPreview ? "" : "hover:border-primary/50 hover:bg-primary/5"}`}
          >
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                {/* Uploading overlay */}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                    <p className="text-white text-sm font-medium">Uploading to Cloudinary...</p>
                  </div>
                )}
                {/* Hover overlay — only show when not uploading */}
                {!isUploadingImage && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white/10 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 flex items-center">
                      <ImagePlus className="w-4 h-4 mr-2" /> Change Cover
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground group-hover:text-primary transition-colors">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <p className="mb-2 text-sm font-semibold">Click to upload cover image</p>
                <p className="text-xs opacity-70">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
            <Input
              id="coverUpload"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              disabled={isUploadingImage}
            />
          </Label>
          {/* Remove cover button */}
          {coverPreview && !isUploadingImage && (
            <button
              onClick={removeCover}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
              title="Remove cover image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Upload status indicator */}
          {coverImageUrl && !isUploadingImage && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Uploaded to Cloudinary
            </div>
          )}
        </div>

        {/* Category Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Title..."
          className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-foreground placeholder:text-muted-foreground/40 outline-none resize-none overflow-hidden mb-4"
          rows={1}
          style={{ height: "auto", minHeight: "60px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = "auto"
            target.style.height = `${target.scrollHeight}px`
          }}
        />

        {/* Excerpt Input */}
        <textarea
          ref={excerptRef}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value.slice(0, 500))}
          placeholder="Write a short excerpt or summary (optional, max 500 chars)..."
          className="w-full bg-transparent text-base text-muted-foreground placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed border-b border-border/30 pb-4 mb-6"
          style={{ minHeight: "48px" }}
        />
        {excerpt.length > 400 && (
          <p className="text-xs text-muted-foreground mb-4 text-right">
            {excerpt.length}/500 characters
          </p>
        )}

        {/* Tags Input */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tags (press Enter or comma to add, max 10)..."
            className="bg-transparent border-0 border-b border-border/30 rounded-none px-0 text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:border-primary/50"
            disabled={tags.length >= 10}
          />
        </div>

        {/* Content Input */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell your story..."
          className="w-full bg-transparent text-lg md:text-xl text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed font-serif"
          style={{ minHeight: "300px" }}
        />

      </div>
    </div>
  )
}
