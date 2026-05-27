import { useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadApi } from "@/api/upload.api"
import { getErrorMessage } from "@/lib/error"
import { cn } from "@/lib/utils"

interface CoverImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  onUploadingChange?: (isUploading: boolean) => void
  inputId?: string
}

export function CoverImageUploader({
  value,
  onChange,
  onUploadingChange,
  inputId = "coverUpload",
}: CoverImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value)
  const [isUploading, setIsUploading] = useState(false)

  const setUploading = (uploading: boolean) => {
    setIsUploading(uploading)
    onUploadingChange?.(uploading)
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    try {
      const { url } = await uploadApi.image(file)
      setPreview(url)
      onChange(url)
      toast.success("Cover image uploaded!")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload image."))
      setPreview(value ?? null)
      onChange(value ?? null)
    } finally {
      URL.revokeObjectURL(localUrl)
      setUploading(false)
    }
  }

  const remove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="group relative">
      <Label
        htmlFor={inputId}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 md:h-64 rounded-3xl border-2 border-dashed border-border/50 cursor-pointer overflow-hidden transition-all duration-300",
          !preview && "hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Cover" className="w-full h-full object-cover" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                <p className="text-white text-sm font-medium">Uploading…</p>
              </div>
            )}
            {!isUploading && (
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
            <p className="text-xs opacity-70">Any image up to 10MB</p>
          </div>
        )}
        <Input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
      </Label>
      {preview && !isUploading && (
        <button
          type="button"
          onClick={remove}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
          aria-label="Remove cover image"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
