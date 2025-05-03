"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, AlertCircle, Save, Lock, Mail, Bell } from "lucide-react"
import AdminSidebar from "./components/AdminSidebar"

const AdminSettings = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      siteName: "Influne",
      siteDescription: "Influencer Marketing Platform",
      contactEmail: "support@influne.com",
      allowRegistration: true,
      requireEmailVerification: true,
    },
    notifications: {
      sendWelcomeEmail: true,
      sendVerificationApprovalEmail: true,
      sendVerificationRejectionEmail: true,
      sendCampaignNotifications: true,
      adminNotifyNewUsers: true,
      adminNotifyVerificationRequests: true,
    },
    security: {
      passwordMinLength: 8,
      requireStrongPasswords: true,
      sessionTimeout: 60, // minutes
      maxLoginAttempts: 5,
    },
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
          // Fetch settings
          fetchSettings()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/login")
      }
    }

    checkAdmin()
  }, [navigate])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }

      const data = await response.json()

      // If we have settings from the API, update our state
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      // We'll continue with default settings if API fails
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setSuccess("Settings saved successfully")
    } catch (error) {
      setError("Failed to save settings: " + error.message)
    } finally {
      setIsSaving(false)
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
      <AdminSidebar activePage="settings" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-emerald-600 mr-3" />
            <h1 className="text-2xl font-bold">System Settings</h1>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === "general"
                    ? "border-b-2 border-emerald-500 text-emerald-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => handleTabChange("general")}
              >
                General
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === "notifications"
                    ? "border-b-2 border-emerald-500 text-emerald-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => handleTabChange("notifications")}
              >
                Notifications
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === "security"
                    ? "border-b-2 border-emerald-500 text-emerald-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => handleTabChange("security")}
              >
                Security
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-500" />
                  General Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleSettingChange("general", "contactEmail", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.general.allowRegistration}
                      onChange={(e) => handleSettingChange("general", "allowRegistration", e.target.checked)}
                    />
                    <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                      Allow new user registrations
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.general.requireEmailVerification}
                      onChange={(e) => handleSettingChange("general", "requireEmailVerification", e.target.checked)}
                    />
                    <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                      Require email verification for new accounts
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-gray-500" />
                  Notification Settings
                </h2>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">User Notifications</h3>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendWelcomeEmail"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.notifications.sendWelcomeEmail}
                      onChange={(e) => handleSettingChange("notifications", "sendWelcomeEmail", e.target.checked)}
                    />
                    <label htmlFor="sendWelcomeEmail" className="ml-2 block text-sm text-gray-900">
                      Send welcome email to new users
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendVerificationApprovalEmail"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.notifications.sendVerificationApprovalEmail}
                      onChange={(e) =>
                        handleSettingChange("notifications", "sendVerificationApprovalEmail", e.target.checked)
                      }
                    />
                    <label htmlFor="sendVerificationApprovalEmail" className="ml-2 block text-sm text-gray-900">
                      Send email when verification is approved
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendVerificationRejectionEmail"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.notifications.sendVerificationRejectionEmail}
                      onChange={(e) =>
                        handleSettingChange("notifications", "sendVerificationRejectionEmail", e.target.checked)
                      }
                    />
                    <label htmlFor="sendVerificationRejectionEmail" className="ml-2 block text-sm text-gray-900">
                      Send email when verification is rejected
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendCampaignNotifications"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.notifications.sendCampaignNotifications}
                      onChange={(e) =>
                        handleSettingChange("notifications", "sendCampaignNotifications", e.target.checked)
                      }
                    />
                    <label htmlFor="sendCampaignNotifications" className="ml-2 block text-sm text-gray-900">
                      Send campaign-related notifications
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Admin Notifications</h3>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminNotifyNewUsers"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.notifications.adminNotifyNewUsers}
                      onChange={(e) => handleSettingChange("notifications", "adminNotifyNewUsers", e.target.checked)}
                    />
                    <label htmlFor="adminNotifyNewUsers" className="ml-2 block text-sm text-gray-900">
                      Notify admins about new user registrations
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminNotifyVerificationRequests"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.notifications.adminNotifyVerificationRequests}
                      onChange={(e) =>
                        handleSettingChange("notifications", "adminNotifyVerificationRequests", e.target.checked)
                      }
                    />
                    <label htmlFor="adminNotifyVerificationRequests" className="ml-2 block text-sm text-gray-900">
                      Notify admins about new verification requests
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-gray-500" />
                  Security Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      id="passwordMinLength"
                      min="6"
                      max="20"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.security.passwordMinLength}
                      onChange={(e) =>
                        handleSettingChange("security", "passwordMinLength", Number.parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      min="15"
                      max="1440"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        handleSettingChange("security", "sessionTimeout", Number.parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      id="maxLoginAttempts"
                      min="3"
                      max="10"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        handleSettingChange("security", "maxLoginAttempts", Number.parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireStrongPasswords"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={settings.security.requireStrongPasswords}
                      onChange={(e) => handleSettingChange("security", "requireStrongPasswords", e.target.checked)}
                    />
                    <label htmlFor="requireStrongPasswords" className="ml-2 block text-sm text-gray-900">
                      Require strong passwords (uppercase, lowercase, numbers, special characters)
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
