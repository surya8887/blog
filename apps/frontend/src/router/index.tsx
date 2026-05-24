import { Routes, Route } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"

import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview"
import { Profile } from "@/pages/dashboard/Profile"
import { Settings } from "@/pages/dashboard/Settings"

export const AppRouter = () => {
  return (
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
  )
}
