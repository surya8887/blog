import { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus, ArrowLeft, Loader2, Save, X, Tag } from "lucide-react"
import { api } from "@/api/axios"

const CATEGORIES = ["Technology", "React", "Design", "Architecture", "CSS", "Life", "Career"]

export function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")

  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const excerptRef = useRef<HTMLTextAreaElement>(null)

  // Load existing post
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/posts/${id}`)
        const p = res.data.data
        setTitle(p.title || "")
        setContent(p.content || "")
        setExcerpt(p.excerpt || "")
        setTags(p.tags || [])
        setSelectedCategory(p.categoryDetails?.name || p.category?.name || "")
        setStatus(p.status || "draft")
        if (p.coverImage) { setCoverPreview(p.coverImage); setCoverImageUrl(p.coverImage) }
      } catch {
        toast.error("Failed to load post.")
        navigate("/dashboard")
      } finally {
        setIsFetching(false)
      }
    }
    if (id) load()
  }, [id, navigate])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto"
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`
    }
  }, [content])

  useEffect(() => {
    if (excerptRef.current) {
      excerptRef.current.style.height = "auto"
      excerptRef.current.style.height = `${excerptRef.current.scrollHeight}px`
    }
  }, [excerpt])

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setCoverPreview(localUrl)
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      const url = res.data.data.url
      setCoverImageUrl(url)
      setCoverPreview(url)
      URL.revokeObjectURL(localUrl)
      toast.success("Cover image updated!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Image upload failed.")
      setCoverPreview(coverImageUrl || null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const trimmed = tagInput.trim().replace(/,+$/, "")
      if (trimmed && !tags.includes(trimmed) && tags.length < 10) setTags(prev => [...prev, trimmed])
      setTagInput("")
    }
  }

  const handleSave = async (saveStatus?: "draft" | "published") => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required."); return }
    if (isUploadingImage) { toast.error("Please wait for image to finish uploading."); return }

    setIsSaving(true)
    try {
      const payload: Record<string, any> = {
        title, content, status: saveStatus ?? status,
        category: selectedCategory || "Technology",
      }
      if (excerpt.trim()) payload.excerpt = excerpt.trim()
      if (coverImageUrl) payload.coverImage = coverImageUrl
      if (tags.length > 0) payload.tags = tags

      await api.put(`/posts/${id}`, payload)
      toast.success("Post updated!")
      navigate("/dashboard")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <div className="flex items-center gap-2">
            {isUploadingImage && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
              </span>
            )}
            <Button
              variant="outline" size="sm"
              onClick={() => handleSave("draft")}
              disabled={isSaving || isUploadingImage}
              className="rounded-full hidden sm:flex"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave("published")}
              disabled={isSaving || isUploadingImage || !title.trim() || !content.trim()}
              className="rounded-full shadow-md shadow-primary/20"
              size="sm"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-2" />Publish</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 mt-8">

        {/* Cover image */}
        <div className="mb-10 group relative">
          <Label htmlFor="editCoverUpload" className={`relative flex flex-col items-center justify-center w-full h-48 md:h-64 rounded-3xl border-2 border-dashed border-border/50 cursor-pointer overflow-hidden transition-all duration-300 ${coverPreview ? "" : "hover:border-primary/50 hover:bg-primary/5"}`}>
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                    <p className="text-white text-sm">Uploading…</p>
                  </div>
                )}
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
            <Input id="editCoverUpload" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" disabled={isUploadingImage} />
          </Label>
          {coverPreview && !isUploadingImage && (
            <button onClick={() => { setCoverPreview(null); setCoverImageUrl("") }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white z-10">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Title */}
        <textarea value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Article Title…"
          className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-foreground placeholder:text-muted-foreground/40 outline-none resize-none overflow-hidden mb-4"
          rows={1} style={{ height: "auto", minHeight: "60px" }}
          onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px` }} />

        {/* Excerpt */}
        <textarea ref={excerptRef} value={excerpt} onChange={e => setExcerpt(e.target.value.slice(0, 500))}
          placeholder="Short excerpt or summary (optional, max 500 chars)…"
          className="w-full bg-transparent text-base text-muted-foreground placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed border-b border-border/30 pb-4 mb-6"
          style={{ minHeight: "48px" }} />
        {excerpt.length > 400 && <p className="text-xs text-muted-foreground mb-4 text-right">{excerpt.length}/500</p>}

        {/* Tags */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Tag className="w-3 h-3" />{tag}
                <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-destructive ml-1"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
            placeholder="Add tags (Enter or comma, max 10)…"
            className="bg-transparent border-0 border-b border-border/30 rounded-none px-0 text-sm focus-visible:ring-0 focus-visible:border-primary/50"
            disabled={tags.length >= 10} />
        </div>

        {/* Content */}
        <textarea ref={contentRef} value={content} onChange={e => setContent(e.target.value)}
          placeholder="Tell your story…"
          className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed font-serif"
          style={{ minHeight: "300px" }} />

      </div>
    </div>
  )
}
