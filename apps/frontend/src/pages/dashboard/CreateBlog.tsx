import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus, ArrowLeft, Loader2, Send } from "lucide-react"
import { api } from "@/api/axios"

const CATEGORIES = ["Technology", "React", "Design", "Architecture", "CSS", "Life", "Career"]

export function CreateBlog() {
  const navigate = useNavigate()
  const [isPublishing, setIsPublishing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto"
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`
    }
  }, [content])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.")
      return
    }

    setIsPublishing(true)
    try {
      const payload = {
        title,
        content,
        category: selectedCategory || "Technology",
        status: "published" // Or "draft" if you have a draft feature
      }

      await api.post("/posts", payload)
      
      toast.success("Blog post published successfully!")
      navigate("/blogs") // Redirect to blogs page
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
            <Button 
              onClick={handlePublish} 
              disabled={isPublishing || !title.trim() || !content.trim()}
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
        <div className="mb-10 group">
          <Label 
            htmlFor="coverUpload" 
            className={`relative flex flex-col items-center justify-center w-full h-48 md:h-64 rounded-3xl border-2 border-dashed border-border/50 cursor-pointer overflow-hidden transition-all duration-300 ${coverPreview ? '' : 'hover:border-primary/50 hover:bg-primary/5'}`}
          >
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white/10 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 flex items-center">
                    <ImagePlus className="w-4 h-4 mr-2" /> Change Cover
                  </div>
                </div>
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
            />
          </Label>
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
          className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-foreground placeholder:text-muted-foreground/40 outline-none resize-none overflow-hidden mb-6"
          rows={1}
          style={{ height: 'auto', minHeight: '60px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />

        {/* Content Input */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell your story..."
          className="w-full bg-transparent text-lg md:text-xl text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed font-serif"
          style={{ minHeight: '300px' }}
        />

      </div>
    </div>
  )
}
