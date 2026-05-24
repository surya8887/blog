import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { MainLayout } from "@/layouts/MainLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"

import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview"
import { Profile } from "@/pages/dashboard/Profile"
import { Settings } from "@/pages/dashboard/Settings"

function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="devblog-theme" attribute="class">
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
                    
                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardOverview />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>

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