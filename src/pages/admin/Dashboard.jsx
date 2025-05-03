"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Users, ShieldCheck, BarChart2, Settings, Bell, FileText, LogOut, Building, User } from 'lucide-react'
import AdminSidebar from "./components/AdminSidebar"

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBrands: 0,
    totalInfluencers: 0,
    pendingVerifications: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/check-admin", {
          credentials: "include",
        })
        const data = await response.json()

        if (!data.isAdmin) {
          navigate("/login")
        } else {
          // Fetch admin stats
          fetchStats()
          fetchRecentActivity()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/login")
      }
    }

    checkAdmin()
  }, [navigate])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/admin/stats", {
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats")
      }
      
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      // Fallback to minimal data if API fails
      setStats({
        totalUsers: 0,
        totalBrands: 0,
        totalInfluencers: 0,
        pendingVerifications: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/recent-activity", {
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch recent activity")
      }
      
      const data = await response.json()
      setRecentActivity(data.activities)
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      // Set empty array if API fails
      setRecentActivity([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activePage="dashboard" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Users</h2>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Brands</h2>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalBrands}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Influencers</h2>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalInfluencers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Pending Verifications</h2>
                <p className="text-2xl font-semibold text-gray-800">{stats.pendingVerifications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/verification-requests"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Review Verification Requests</span>
              {stats.pendingVerifications > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.pendingVerifications}
                </span>
              )}
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-emerald-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-emerald-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Generate Reports</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-4 border-b border-gray-100">
                  <div className={`p-2 ${getActivityIconBg(activity.type)} rounded-full mr-4`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: activity.message }}></p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">No recent activity to display</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions for activity display
function getActivityIconBg(type) {
  switch (type) {
    case 'verification':
      return 'bg-green-100'
    case 'user':
      return 'bg-blue-100'
    case 'notification':
      return 'bg-amber-100'
    default:
      return 'bg-gray-100'
  }
}

function getActivityIcon(type) {
  switch (type) {
    case 'verification':
      return <ShieldCheck className="h-5 w-5 text-green-600" />
    case 'user':
      return <Users className="h-5 w-5 text-blue-600" />
    case 'notification':
      return <Bell className="h-5 w-5 text-amber-600" />
    default:
      return <BarChart2 className="h-5 w-5 text-gray-600" />
  }
}

function formatTimeAgo(timestamp) {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - activityTime) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

export default AdminDashboard
