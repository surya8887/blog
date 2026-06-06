import { cn } from "@/lib/utils"

interface CategoryPillsProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
  /** When true, clicking the active pill clears the selection. */
  allowDeselect?: boolean
  className?: string
}

export function CategoryPills({
  categories,
  selected,
  onSelect,
  allowDeselect = true,
  className,
}: CategoryPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((category) => {
        const isActive = selected === category
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(allowDeselect && isActive ? "" : category)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
            )}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
