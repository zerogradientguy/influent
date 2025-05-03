import { Link } from "react-router-dom"
import { Users, ShieldCheck, BarChart2, Settings, Bell, FileText, LogOut } from 'lucide-react'

const AdminSidebar = ({ activePage }) => {
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 rounded-full">
            <img src="/logo.svg" alt="Influne Logo" className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
      </div>
      <nav className="mt-6">
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
          <div className="mt-3 space-y-1">
            <Link
              to="/admin/dashboard"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                activePage === "dashboard" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                activePage === "users" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Users
            </Link>
            <Link
              to="/admin/verification-requests"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                activePage === "verification" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              Verification
            </Link>
            <Link
              to="/admin/reports"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                activePage === "reports" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Reports
            </Link>
          </div>
        </div>
        <div className="px-4 py-2 mt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
          <div className="mt-3 space-y-1">
            <Link
              to="/admin/notifications"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                activePage === "notifications" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </Link>
            <Link
              to="/admin/settings"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                activePage === "settings" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default AdminSidebar
