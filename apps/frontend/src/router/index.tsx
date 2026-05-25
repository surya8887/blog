import { Routes, Route } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { AdminLayout } from "@/layouts/AdminLayout"

import { Home } from "@/pages/Home"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { About } from "@/pages/About"
import { Blogs } from "@/pages/Blogs"
import { SingleBlog } from "@/pages/SingleBlog"
import { Categories } from "@/pages/Categories"
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview"
import { Profile } from "@/pages/dashboard/Profile"
import { Settings } from "@/pages/dashboard/Settings"
import { CreateBlog } from "@/pages/dashboard/CreateBlog"
import { EditBlog } from "@/pages/dashboard/EditBlog"
import { PublishSuccess } from "@/pages/dashboard/PublishSuccess"

import { AdminDashboard } from "@/pages/admin/AdminDashboard"
import { AdminPosts } from "@/pages/admin/AdminPosts"
import { AdminPostComments } from "@/pages/admin/AdminPostComments"
import { AdminComments } from "@/pages/admin/AdminComments"
import { AdminCategories } from "@/pages/admin/AdminCategories"
import { AdminUsers } from "@/pages/admin/AdminUsers"

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/:id/comments" element={<AdminPostComments />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route 
        path="/*" 
        element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<SingleBlog />} />
              <Route path="/categories" element={<Categories />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="create-blog" element={<CreateBlog />} />
                <Route path="edit-blog/:id" element={<EditBlog />} />
                <Route path="publish-success/:id" element={<PublishSuccess />} />
              </Route>
            </Routes>
          </MainLayout>
        } 
      />
    </Routes>
  )
}
