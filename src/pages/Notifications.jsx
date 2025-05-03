"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, AlertCircle, Check, Trash2 } from "lucide-react"
import { useNotifications } from "../contexts/NotificationsContext"

const Notifications = ({ user }) => {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications()
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    fetchNotifications()
  }, [user, navigate, fetchNotifications])

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.related_type === "campaign" && notification.related_id) {
      navigate(`/campaign/${notification.related_id}`)
    } else if (notification.related_type === "message" && notification.related_id) {
      navigate(`/conversation/${notification.related_id}`)
    }
  }

  const deleteNotification = async (id) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchNotifications()
      } else {
        setError("Failed to delete notification")
      }
    } catch (error) {
      setError("An error occurred while deleting the notification")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteAllNotifications = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("http://localhost:5000/api/notifications/delete-all", {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchNotifications()
      } else {
        setError("Failed to delete all notifications")
      }
    } catch (error) {
      setError("An error occurred while deleting notifications")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Bell className="mr-2 h-6 w-6" />
            Notifications
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="btn-secondary flex items-center text-sm py-1"
              disabled={notifications.every((n) => n.is_read)}
            >
              <Check className="mr-1 h-4 w-4" />
              Mark all as read
            </button>
            <button
              onClick={deleteAllNotifications}
              className="btn-secondary flex items-center text-sm py-1"
              disabled={notifications.length === 0 || isDeleting}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear all
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

        {notifications.length === 0 ? (
          <div className="card text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card hover:shadow-md transition-shadow ${
                  !notification.is_read ? "border-l-4 border-emerald-500" : ""
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-start space-x-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-emerald-600 hover:text-emerald-700"
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete notification"
                      disabled={isDeleting}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
