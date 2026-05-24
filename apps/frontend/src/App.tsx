import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from "@/store/useAuthStore"

import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { AppRouter } from "@/router"

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="devblog-theme" attribute="class">
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  )
}

export default App