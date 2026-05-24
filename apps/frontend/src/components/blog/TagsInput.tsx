import { Tag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MAX_TAGS_PER_POST } from "@/constants/app"

interface TagsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  max?: number
  placeholder?: string
}

export function TagsInput({
  tags,
  onChange,
  max = MAX_TAGS_PER_POST,
  placeholder = `Add tags (Enter or comma, max ${MAX_TAGS_PER_POST})…`,
}: TagsInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return
    e.preventDefault()
    const input = e.currentTarget
    const trimmed = input.value.trim().replace(/,+$/, "")
    if (trimmed && !tags.includes(trimmed) && tags.length < max) {
      onChange([...tags, trimmed])
    }
    input.value = ""
  }

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag))

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-destructive transition-colors ml-1"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-transparent border-0 border-b border-border/30 rounded-none px-0 text-sm focus-visible:ring-0 focus-visible:border-primary/50"
        disabled={tags.length >= max}
      />
    </div>
  )
}
