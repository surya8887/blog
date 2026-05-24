import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Paginated } from "@/types"
import { DEBOUNCE_SEARCH_MS, ADMIN_LIST_LIMIT } from "@/constants/app"
import { getErrorMessage } from "@/lib/error"
import { useDebouncedValue } from "./useDebouncedValue"

interface UseAdminListOptions<T> {
  fetcher: (params: { page: number; limit: number; search?: string }) => Promise<Paginated<T>>
  limit?: number
  errorMessage?: string
}

interface UseAdminListResult<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  isLoading: boolean
  search: string
  setSearch: (value: string) => void
  page: number
  setPage: (page: number) => void
  totalPages: number
  refetch: () => Promise<void>
}

export function useAdminList<T>({
  fetcher,
  limit = ADMIN_LIST_LIMIT,
  errorMessage = "Failed to load data",
}: UseAdminListOptions<T>): UseAdminListResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_MS)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetcher({
        page,
        limit,
        search: debouncedSearch || undefined,
      })
      setItems(result?.docs ?? [])
      setTotalPages(result?.totalPages ?? 1)
    } catch (error) {
      toast.error(getErrorMessage(error, errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [fetcher, page, limit, debouncedSearch, errorMessage])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  return {
    items,
    setItems,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    refetch,
  }
}
