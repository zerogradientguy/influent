"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  User,
  LogOut,
  Search,
  BarChart2,
  PlusCircle,
  Settings,
  Bell,
  MessageSquare,
  Briefcase,
} from "lucide-react"
import { useNotifications } from "../contexts/NotificationsContext"

const Navbar = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { notifications, unreadCount, markAsRead } = useNotifications()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  const closeNotifications = () => {
    setIsNotificationsOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false)
      }
      if (isNotificationsOpen && !event.target.closest(".notifications-dropdown")) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen, isNotificationsOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
    setIsNotificationsOpen(false)
  }, [location])

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setUser(null)
        navigate("/")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.related_type === "campaign" && notification.related_id) {
      navigate(`/campaign/${notification.related_id}`)
    } else if (notification.related_type === "message" && notification.related_id) {
      navigate(`/conversation/${notification.related_id}`)
    } else {
      // Default navigation based on user role
      if (user.role === "brand") {
        navigate("/brand/dashboard")
      } else {
        navigate("/influencer/dashboard")
      }
    }

    setIsNotificationsOpen(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Influne Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-emerald-600">Influne</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                location.pathname === "/" ? "text-emerald-600 font-medium" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/resources"
              className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                location.pathname === "/resources" ? "text-emerald-600 font-medium" : ""
              }`}
            >
              Resources
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={user.role === "brand" ? "/brand/dashboard" : "/influencer/dashboard"}
                  className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                    location.pathname.includes("/dashboard") ? "text-emerald-600 font-medium" : ""
                  }`}
                >
                  Dashboard
                </Link>

                {user.role === "brand" && (
                  <>
                    <Link
                      to="/brand/search-influencers"
                      className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                        location.pathname.includes("/search-influencers") ? "text-emerald-600 font-medium" : ""
                      }`}
                    >
                      Find Influencers
                    </Link>
                    <Link
                      to="/brand/create-campaign"
                      className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                        location.pathname.includes("/create-campaign") ? "text-emerald-600 font-medium" : ""
                      }`}
                    >
                      Create Campaign
                    </Link>
                  </>
                )}

                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={toggleNotifications}
                  >
                    <Bell size={20} className="text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-medium">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.is_read ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${
                                  !notification.is_read ? "bg-blue-500" : "bg-gray-300"
                                }`}
                              ></div>
                              <div>
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-gray-500">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="px-4 py-2 text-center">
                        <Link
                          to="/notifications"
                          className="text-sm text-emerald-600 hover:text-emerald-700"
                          onClick={closeNotifications}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Link
                  to="/messages"
                  className={`relative p-1 rounded-full hover:bg-gray-100 transition-colors ${
                    location.pathname.includes("/messages") || location.pathname.includes("/conversation")
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <MessageSquare size={20} className="text-gray-700" />
                </Link>

                <div className="relative user-dropdown">
                  <button
                    className={`flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors ${
                      isDropdownOpen ? "text-emerald-600" : ""
                    }`}
                    onClick={toggleDropdown}
                  >
                    <User size={18} />
                    <span>{user.name}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to={user.role === "brand" ? "/brand/profile" : "/influencer/profile"}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeDropdown}
                      >
                        <div className="flex items-center">
                          <Settings size={16} className="mr-2" />
                          Profile Settings
                        </div>
                      </Link>
                      {user.role === "brand" && (
                        <Link
                          to="/brand/campaigns"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeDropdown}
                        >
                          <div className="flex items-center">
                            <BarChart2 size={16} className="mr-2" />
                            My Campaigns
                          </div>
                        </Link>
                      )}
                      {user.role === "influencer" && (
                        <>
                          <Link
                            to="/influencer/campaigns"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={closeDropdown}
                          >
                            <div className="flex items-center">
                              <BarChart2 size={16} className="mr-2" />
                              My Campaigns
                            </div>
                          </Link>
                          <Link
                            to="/influencer/portfolio"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={closeDropdown}
                          >
                            <div className="flex items-center">
                              <Briefcase size={16} className="mr-2" />
                              Portfolio
                            </div>
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          closeDropdown()
                          handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-emerald-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                  location.pathname === "/" ? "text-emerald-600 font-medium" : ""
                }`}
              >
                Home
              </Link>
              <Link
                to="/resources"
                className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                  location.pathname === "/resources" ? "text-emerald-600 font-medium" : ""
                }`}
              >
                Resources
              </Link>

              {user ? (
                <>
                  <Link
                    to={user.role === "brand" ? "/brand/dashboard" : "/influencer/dashboard"}
                    className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                      location.pathname.includes("/dashboard") ? "text-emerald-600 font-medium" : ""
                    }`}
                  >
                    Dashboard
                  </Link>

                  {user.role === "brand" && (
                    <>
                      <Link
                        to="/brand/search-influencers"
                        className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                          location.pathname.includes("/search-influencers") ? "text-emerald-600 font-medium" : ""
                        }`}
                      >
                        <Search size={18} className="inline mr-2" />
                        Find Influencers
                      </Link>
                      <Link
                        to="/brand/create-campaign"
                        className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                          location.pathname.includes("/create-campaign") ? "text-emerald-600 font-medium" : ""
                        }`}
                      >
                        <PlusCircle size={18} className="inline mr-2" />
                        Create Campaign
                      </Link>
                      <Link
                        to="/brand/campaigns"
                        className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                          location.pathname.includes("/campaigns") && !location.pathname.includes("/create-campaign")
                            ? "text-emerald-600 font-medium"
                            : ""
                        }`}
                      >
                        <BarChart2 size={18} className="inline mr-2" />
                        My Campaigns
                      </Link>
                    </>
                  )}

                  {user.role === "influencer" && (
                    <>
                      <Link
                        to="/influencer/campaigns"
                        className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                          location.pathname.includes("/campaigns") ? "text-emerald-600 font-medium" : ""
                        }`}
                      >
                        <BarChart2 size={18} className="inline mr-2" />
                        My Campaigns
                      </Link>
                      <Link
                        to="/influencer/available-campaigns"
                        className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                          location.pathname.includes("/available-campaigns") ? "text-emerald-600 font-medium" : ""
                        }`}
                      >
                        <Search size={18} className="inline mr-2" />
                        Find Campaigns
                      </Link>
                      <Link
                        to="/influencer/portfolio"
                        className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                          location.pathname.includes("/portfolio") ? "text-emerald-600 font-medium" : ""
                        }`}
                      >
                        <Briefcase size={18} className="inline mr-2" />
                        Portfolio
                      </Link>
                    </>
                  )}

                  <Link
                    to="/notifications"
                    className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                      location.pathname.includes("/notifications") ? "text-emerald-600 font-medium" : ""
                    }`}
                  >
                    <Bell size={18} className="inline mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/messages"
                    className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                      location.pathname.includes("/messages") || location.pathname.includes("/conversation")
                        ? "text-emerald-600 font-medium"
                        : ""
                    }`}
                  >
                    <MessageSquare size={18} className="inline mr-2" />
                    Messages
                  </Link>

                  <Link
                    to={user.role === "brand" ? "/brand/profile" : "/influencer/profile"}
                    className={`text-gray-700 hover:text-emerald-600 transition-colors ${
                      location.pathname.includes("/profile") ? "text-emerald-600 font-medium" : ""
                    }`}
                  >
                    <Settings size={18} className="inline mr-2" />
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" className="text-gray-700 hover:text-emerald-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-center">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
