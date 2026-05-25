import { useEffect, useState, useRef, useMemo } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import JoditEditor from "jodit-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/shared/Spinner"
import { CategoryPills } from "@/components/blog/CategoryPills"
import { TagsInput } from "@/components/blog/TagsInput"
import { CoverImageUploader } from "@/components/blog/CoverImageUploader"
import { categoriesApi } from "@/api/categories.api"
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea"
import { MAX_EXCERPT_LENGTH } from "@/constants/app"
import { getErrorMessage } from "@/lib/error"
import type { PostPayload } from "@/api/posts.api"
import type { PostStatus } from "@/types"

export interface BlogEditorInitialValues {
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  category?: string
  status?: PostStatus
  coverImage?: string | null
}

export interface BlogEditorSaveAction {
  label: string
  icon?: React.ReactNode
  status: PostStatus
  variant?: "default" | "outline"
  size?: "default" | "sm"
  /** When set, hide on mobile screens */
  desktopOnly?: boolean
}

interface BlogEditorProps {
  initialValues?: BlogEditorInitialValues
  /** Shown next to the back button — e.g. "Draft saved" or null */
  statusText?: string | null
  saveActions: BlogEditorSaveAction[]
  /** Returns a promise; called when any save action is clicked */
  onSave: (payload: PostPayload) => Promise<void>
  backTo?: number | string
  /** Override outer container shell */
  shell?: "card" | "plain"
}

const defaultInitial: Required<BlogEditorInitialValues> = {
  title: "",
  content: "",
  excerpt: "",
  tags: [],
  category: "",
  status: "draft",
  coverImage: null,
}

export function BlogEditor({
  initialValues,
  statusText,
  saveActions,
  onSave,
  backTo = -1,
  shell = "card",
}: BlogEditorProps) {
  const navigate = useNavigate()
  const merged = { ...defaultInitial, ...initialValues }

  const [title, setTitle] = useState(merged.title)
  const [content, setContent] = useState(merged.content)
  const [excerpt, setExcerpt] = useState(merged.excerpt)
  const [tags, setTags] = useState<string[]>(merged.tags)
  const [selectedCategory, setSelectedCategory] = useState(merged.category)
  const [coverImage, setCoverImage] = useState<string | null>(merged.coverImage)
  const [isCoverUploading, setIsCoverUploading] = useState(false)
  const [savingStatus, setSavingStatus] = useState<PostStatus | null>(null)

  const [categories, setCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const excerptRef = useAutoResizeTextarea<HTMLTextAreaElement>(excerpt)
  const editorRef = useRef(null)

  const joditConfig = useMemo(() => ({
    readonly: false,
    placeholder: "Tell your story…",
    theme: "dark",
    minHeight: 400,
    style: {
      background: "transparent",
      color: "inherit"
    }
  }), [])

  useEffect(() => {
    setTitle(merged.title)
    setContent(merged.content)
    setExcerpt(merged.excerpt)
    setTags(merged.tags)
    setSelectedCategory(merged.category)
    setCoverImage(merged.coverImage)
    // We intentionally re-run only when the identity of initialValues changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  useEffect(() => {
    let cancelled = false
    categoriesApi
      .list()
      .then((items) => {
        if (cancelled) return
        const names = items.map((c) => c.name)
        setCategories(names)
        setSelectedCategory((current) => current || names[0] || "")
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
      .finally(() => {
        if (!cancelled) setIsLoadingCategories(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async (status: PostStatus) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.")
      return
    }
    if (isCoverUploading) {
      toast.error("Please wait for the image to finish uploading.")
      return
    }
    const category = selectedCategory || categories[0]
    if (!category) {
      toast.error("Please select a category.")
      return
    }

    const payload: PostPayload = {
      title: title.trim(),
      content,
      category,
      status,
    }
    if (excerpt.trim()) payload.excerpt = excerpt.trim()
    if (coverImage) payload.coverImage = coverImage
    if (tags.length > 0) payload.tags = tags

    setSavingStatus(status)
    try {
      await onSave(payload)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save."))
    } finally {
      setSavingStatus(null)
    }
  }

  const anySaving = savingStatus !== null
  const goBack = () => {
    if (typeof backTo === "string") navigate(backTo)
    else navigate(backTo as number)
  }

  if (isLoadingCategories) return <Spinner fullScreen />

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goBack} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="flex items-center gap-2 sm:gap-4">
            {statusText && (
              <span className="text-sm text-muted-foreground hidden sm:inline-block">{statusText}</span>
            )}
            {isCoverUploading && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
              </span>
            )}
            {saveActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "default"}
                size={action.size ?? "sm"}
                onClick={() => handleSave(action.status)}
                disabled={anySaving || isCoverUploading || !title.trim() || !content.trim()}
                className={`rounded-full ${
                  action.variant === "outline" ? "" : "shadow-md shadow-primary/20"
                } ${action.desktopOnly ? "hidden sm:flex" : ""}`}
              >
                {savingStatus === action.status ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className={shell === "card" ? "w-full px-4 md:px-8 py-12 relative z-10" : "container max-w-3xl mx-auto px-4 mt-8"}>
        <Shell shell={shell}>
          <div className="mb-10">
            <CoverImageUploader
              value={coverImage}
              onChange={setCoverImage}
              onUploadingChange={setIsCoverUploading}
            />
          </div>

          <div className="mb-8">
            <CategoryPills
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title…"
            className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-foreground placeholder:text-muted-foreground/40 outline-none resize-none overflow-hidden mb-4"
            rows={1}
            style={{ minHeight: "60px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = "auto"
              t.style.height = `${t.scrollHeight}px`
            }}
          />

          <textarea
            ref={excerptRef}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, MAX_EXCERPT_LENGTH))}
            placeholder={`Short excerpt or summary (optional, max ${MAX_EXCERPT_LENGTH} chars)…`}
            className="w-full bg-transparent text-base text-muted-foreground placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed border-b border-border/30 pb-4 mb-6"
            style={{ minHeight: "48px" }}
          />
          {excerpt.length > MAX_EXCERPT_LENGTH - 100 && (
            <p className="text-xs text-muted-foreground mb-4 text-right">
              {excerpt.length}/{MAX_EXCERPT_LENGTH}
            </p>
          )}

          <div className="mb-8">
            <TagsInput tags={tags} onChange={setTags} />
          </div>

          <div className="w-full text-foreground mt-4 overflow-hidden rounded-md border border-border/30">
            <JoditEditor
              ref={editorRef}
              value={content}
              config={joditConfig}
              onBlur={(newContent) => setContent(newContent)}
              onChange={(newContent) => setContent(newContent)}
            />
          </div>
        </Shell>
      </div>
    </div>
  )
}

function Shell({ shell, children }: { shell: "card" | "plain"; children: React.ReactNode }) {
  if (shell === "plain") return <>{children}</>
  return (
    <div className="bg-card/40 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="p-8 md:p-14 lg:p-20 relative z-10 flex flex-col w-full">{children}</div>
    </div>
  )
}
