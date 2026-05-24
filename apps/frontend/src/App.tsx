import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { MainLayout } from "@/layouts/MainLayout"

import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"

function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="devblog-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/*" 
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    {/* Add more routes here, e.g., blogs, categories, about */}
                  </Routes>
                </MainLayout>
              } 
            />
          </Routes>
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  )
}

export default App