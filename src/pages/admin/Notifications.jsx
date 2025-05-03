"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, AlertCircle, CheckCircle, Trash2, RefreshCw } from "lucide-react"
import AdminSidebar from "./components/AdminSidebar"

const AdminNotifications = ({ user }) => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("all")
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
          // Fetch notifications
          fetchNotifications()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/login")
      }
    }

    checkAdmin()
  }, [navigate])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data.notifications)
    } catch (error) {
      setError("Failed to load notifications")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/notifications/${id}/read`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
      )
    } catch (error) {
      setError("Failed to update notification")
      console.error(error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications/read-all", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))
    } catch (error) {
      setError("Failed to update notifications")
      console.error(error)
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete notification")
      }

      // Update local state
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    } catch (error) {
      setError("Failed to delete notification")
      console.error(error)
    }
  }

  const handleDeleteAllNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications/delete-all", {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete all notifications")
      }

      // Update local state
      setNotifications([])
    } catch (error) {
      setError("Failed to delete notifications")
      console.error(error)
    }
  }

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.is_read
    if (activeTab === "verification") return notification.related_type === "verification"
    if (activeTab === "user") return notification.related_type === "user"
    return true
  })

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
      <AdminSidebar activePage="notifications" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-emerald-600 mr-3" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </button>
            <button
              onClick={fetchNotifications}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Notification Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === "all"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("all")}
              >
                All
              </button>
              <button
                className={`${
                  activeTab === "unread"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("unread")}
              >
                Unread
              </button>
              <button
                className={`${
                  activeTab === "verification"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("verification")}
              >
                Verification
              </button>
              <button
                className={`${
                  activeTab === "user"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("user")}
              >
                User
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No notifications found</p>
            <p className="text-gray-500 text-sm">
              {activeTab === "all"
                ? "You don't have any notifications yet"
                : `You don't have any ${activeTab} notifications`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-4 ${!notification.is_read ? "border-l-4 border-emerald-500" : ""}`}
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Mark as Read"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {notification.related_type && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationTypeBadge(
                        notification.related_type,
                      )}`}
                    >
                      {notification.related_type}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get badge color based on notification type
function getNotificationTypeBadge(type) {
  switch (type) {
    case "verification":
      return "bg-purple-100 text-purple-800"
    case "user":
      return "bg-blue-100 text-blue-800"
    case "campaign":
      return "bg-emerald-100 text-emerald-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default AdminNotifications
