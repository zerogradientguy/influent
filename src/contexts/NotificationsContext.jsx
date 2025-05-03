 "use client"

import { createContext, useContext, useState, useEffect } from "react"

const NotificationsContext = createContext()

export const useNotifications = () => {
  return useContext(NotificationsContext)
}

export const NotificationsProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((notification) => !notification.is_read).length)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    if (!user) return

    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification,
          ),
        )
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const response = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({ ...notification, is_read: true })),
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
