import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { Spinner } from "@/components/shared/Spinner"

const Home = lazy(() => import("@/pages/Home").then(m => ({ default: m.Home })))
const Login = lazy(() => import("@/pages/Login").then(m => ({ default: m.Login })))
const Signup = lazy(() => import("@/pages/Signup").then(m => ({ default: m.Signup })))
const About = lazy(() => import("@/pages/About").then(m => ({ default: m.About })))
const Blogs = lazy(() => import("@/pages/Blogs").then(m => ({ default: m.Blogs })))
const SingleBlog = lazy(() => import("@/pages/SingleBlog").then(m => ({ default: m.SingleBlog })))
const Categories = lazy(() => import("@/pages/Categories").then(m => ({ default: m.Categories })))

const DashboardOverview = lazy(() => import("@/pages/dashboard/DashboardOverview").then(m => ({ default: m.DashboardOverview })))
const Profile = lazy(() => import("@/pages/dashboard/Profile").then(m => ({ default: m.Profile })))
const Settings = lazy(() => import("@/pages/dashboard/Settings").then(m => ({ default: m.Settings })))
const CreateBlog = lazy(() => import("@/pages/dashboard/CreateBlog").then(m => ({ default: m.CreateBlog })))
const EditBlog = lazy(() => import("@/pages/dashboard/EditBlog").then(m => ({ default: m.EditBlog })))
const PublishSuccess = lazy(() => import("@/pages/dashboard/PublishSuccess").then(m => ({ default: m.PublishSuccess })))

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })))
const AdminPosts = lazy(() => import("@/pages/admin/AdminPosts").then(m => ({ default: m.AdminPosts })))
const AdminPostComments = lazy(() => import("@/pages/admin/AdminPostComments").then(m => ({ default: m.AdminPostComments })))
const AdminComments = lazy(() => import("@/pages/admin/AdminComments").then(m => ({ default: m.AdminComments })))
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories").then(m => ({ default: m.AdminCategories })))
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })))

export const AppRouter = () => {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
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
    </Suspense>
  )
}

