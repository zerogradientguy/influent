"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { NotificationsProvider } from "./contexts/NotificationsContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import BrandDashboard from "./pages/brand/Dashboard"
import BrandProfile from "./pages/brand/Profile"
import BrandCampaigns from "./pages/brand/MyCampaigns"
import CampaignCreation from "./pages/brand/CampaignCreation"
import EditCampaign from "./pages/brand/EditCampaign"
import SearchInfluencers from "./pages/brand/SearchInfluencers"
import InfluencerAnalytics from "./pages/brand/InfluencerAnalytics"
import CampaignAnalytics from "./pages/brand/CampaignAnalytics"
import InfluencerDashboard from "./pages/influencer/Dashboard"
import InfluencerProfile from "./pages/influencer/Profile"
import InfluencerCampaigns from "./pages/influencer/MyCampaigns"
import AvailableCampaigns from "./pages/influencer/AvailableCampaigns"
import Portfolio from "./pages/influencer/Portfolio"
import ContentSubmission from "./pages/influencer/ContentSubmission"
import PublicProfile from "./pages/influencer/PublicProfile"
import CampaignDetails from "./pages/CampaignDetails"
import Notifications from "./pages/Notifications"
import Messages from "./pages/Messages"
import Conversation from "./pages/Conversation"
import Resources from "./pages/Resources"
import VerificationRequest from "./pages/influencer/VerificationRequest"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminUsers from "./pages/admin/Users"
import AdminVerificationRequests from "./pages/admin/VerificationRequests"
import AdminReports from "./pages/admin/Reports"
import AdminSettings from "./pages/admin/Settings"
import AdminNotifications from "./pages/admin/Notifications"
import CreateAdmin from "./pages/admin/CreateAdmin"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/check-auth", {
          credentials: "include",
        })
        const data = await response.json()

        if (data.authenticated) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === "brand") {
        return <Navigate to="/brand/dashboard" replace />
      } else if (user.role === "influencer") {
        return <Navigate to="/influencer/dashboard" replace />
      } else if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />
      } else {
        return <Navigate to="/" replace />
      }
    }

    return children
  }

  return (
    <Router>
      <NotificationsProvider user={user}>
        <div className="flex flex-col min-h-screen">
          {/* Only show navbar on non-admin pages */}
          {user && user.role === "admin" ? null : <Navbar user={user} setUser={setUser} />}

          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />

              {/* Brand routes */}
              <Route
                path="/brand/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <BrandDashboard user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/profile"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <BrandProfile user={user} setUser={setUser} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/campaigns"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <BrandCampaigns user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/create-campaign"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <CampaignCreation user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/edit-campaign/:id"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <EditCampaign user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/search-influencers"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <SearchInfluencers user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/influencer/:id"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <InfluencerAnalytics user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand/campaign-analytics/:id"
                element={
                  <ProtectedRoute allowedRoles={["brand"]}>
                    <CampaignAnalytics user={user} />
                  </ProtectedRoute>
                }
              />

              {/* Influencer routes */}
              <Route
                path="/influencer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <InfluencerDashboard user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influencer/profile"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <InfluencerProfile user={user} setUser={setUser} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influencer/campaigns"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <InfluencerCampaigns user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influencer/available-campaigns"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <AvailableCampaigns user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influencer/portfolio"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <Portfolio user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influencer/content-submission/:id"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <ContentSubmission user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influencer/verification-request"
                element={
                  <ProtectedRoute allowedRoles={["influencer"]}>
                    <VerificationRequest user={user} />
                  </ProtectedRoute>
                }
              />
              <Route path="/influencer/:id" element={<PublicProfile />} />

              {/* Shared routes */}
              <Route
                path="/campaign/:id"
                element={
                  <ProtectedRoute>
                    <CampaignDetails user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conversation/:id"
                element={
                  <ProtectedRoute>
                    <Conversation user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <Resources user={user} />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verification-requests"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminVerificationRequests user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminReports user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettings user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications user={user} />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/create" element={<CreateAdmin />} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Only show footer on non-admin pages */}
          {user && user.role === "admin" ? null : <Footer />}
        </div>
      </NotificationsProvider>
    </Router>
  )
}

export default App
