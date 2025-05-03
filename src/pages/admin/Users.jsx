"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Users, AlertCircle, Search, Edit, UserX, CheckCircle, XCircle } from 'lucide-react'
import AdminSidebar from "./components/AdminSidebar"

const AdminUsers = ({ user }) => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
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
          // Fetch users
          fetchUsers()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/login")
      }
    }

    checkAdmin()
  }, [navigate])

  useEffect(() => {
    // Filter users based on search term and active filter
    if (users.length > 0) {
      let filtered = users

      // Apply role filter
      if (activeFilter !== "all") {
        filtered = filtered.filter(user => user.role === activeFilter)
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(user => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)
        )
      }

      setFilteredUsers(filtered)
    }
  }, [users, searchTerm, activeFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (error) {
      setError("Failed to load users")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId, action) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/${action}`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`)
      }

      // Refresh the user list
      fetchUsers()
      
      // Close modal if open
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null)
      }
    } catch (error) {
      setError(error.message || `An error occurred while performing action on user`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
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
      <AdminSidebar activePage="users" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center mb-6">
          <Users className="h-8 w-8 text-emerald-600 mr-3" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-80"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                activeFilter === "all" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeFilter === "admin" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange("admin")}
            >
              Admins
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeFilter === "brand" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange("brand")}
            >
              Brands
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeFilter === "influencer" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange("influencer")}
            >
              Influencers
            </button>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No users found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? "Try adjusting your search terms" : "There are no users in this category yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Joined</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_active ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleUserAction(user.id, "deactivate")}
                            className="text-red-600 hover:text-red-800"
                            title="Deactivate User"
                            disabled={isProcessing}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, "activate")}
                            className="text-green-600 hover:text-green-800"
                            title="Activate User"
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">User Details</h2>
                  <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`font-medium ${selectedUser.is_active ? "text-green-600" : "text-red-600"}`}>
                          {selectedUser.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="font-medium">
                          {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific information */}
                  {selectedUser.role === "brand" && selectedUser.brand && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Brand Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Industry</p>
                          <p className="font-medium">{selectedUser.brand.industry || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <p className="font-medium">
                            {selectedUser.brand.website ? (
                              <a 
                                href={selectedUser.brand.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800"
                              >
                                {selectedUser.brand.website}
                              </a>
                            ) : (
                              "Not specified"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{selectedUser.brand.location || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Verification</p>
                          <p className={`font-medium ${selectedUser.brand.is_verified ? "text-green-600" : "text-gray-600"}`}>
                            {selectedUser.brand.is_verified ? "Verified" : "Not verified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.role === "influencer" && selectedUser.influencer && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Influencer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Niche</p>
                          <p className="font-medium">{selectedUser.influencer.niche || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Followers</p>
                          <p className="font-medium">{selectedUser.influencer.followers?.toLocaleString() || "0"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Engagement Rate</p>
                          <p className="font-medium">{selectedUser.influencer.engagement_rate?.toFixed(2) || "0"}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{selectedUser.influencer.location || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rating</p>
                          <p className="font-medium">{selectedUser.influencer.rating?.toFixed(1) || "No ratings"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Verification</p>
                          <p className={`font-medium ${selectedUser.influencer.is_verified ? "text-green-600" : "text-gray-600"}`}>
                            {selectedUser.influencer.is_verified ? "Verified" : "Not verified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    {selectedUser.is_active ? (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, "deactivate")}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        {isProcessing ? "Processing..." : "Deactivate User"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, "activate")}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        {isProcessing ? "Processing..." : "Activate User"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get badge color based on role
function getRoleBadgeColor(role) {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'brand':
      return 'bg-blue-100 text-blue-800'
    case 'influencer':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default AdminUsers
