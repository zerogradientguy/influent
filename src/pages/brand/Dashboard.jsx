"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PlusCircle, BarChart2, Users, Clock, AlertCircle, Search, Settings } from "lucide-react"

const BrandDashboard = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalInfluencers: 0,
    pendingRequests: 0,
    completedCampaigns: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not logged in or not a brand
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "brand") {
      navigate("/influencer/dashboard")
      return
    }

    // Fetch campaigns and stats
    const fetchData = async () => {
      try {
        const [campaignsRes, statsRes] = await Promise.all([
          fetch("http://localhost:5000/api/brand/campaigns", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/brand/stats", {
            credentials: "include",
          }),
        ])

        if (!campaignsRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const campaignsData = await campaignsRes.json()
        const statsData = await statsRes.json()

        setCampaigns(campaignsData.campaigns)
        setStats(statsData.stats)
      } catch (error) {
        setError("Failed to load dashboard data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, navigate])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Brand Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Link to="/brand/create-campaign" className="btn-primary mt-4 md:mt-0 flex items-center">
          <PlusCircle size={18} className="mr-2" />
          Create New Campaign
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Campaigns</p>
            <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Influencers</p>
            <p className="text-2xl font-bold">{stats.totalInfluencers}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Requests</p>
            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed Campaigns</p>
            <p className="text-2xl font-bold">{stats.completedCampaigns}</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Campaigns</h2>

        {campaigns.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">You haven't created any campaigns yet.</p>
            <Link to="/brand/create-campaign" className="btn-primary inline-flex items-center">
              <PlusCircle size={18} className="mr-2" />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Campaign Name</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Influencers</th>
                  <th className="py-3 px-4 text-left">Budget</th>
                  <th className="py-3 px-4 text-left">Start Date</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{campaign.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : campaign.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{campaign.influencerCount}</td>
                    <td className="py-3 px-4">${campaign.budget}</td>
                    <td className="py-3 px-4">{new Date(campaign.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Link to={`/campaign/${campaign.id}`} className="text-emerald-600 hover:text-emerald-800">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/brand/search-influencers" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <Search className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="font-semibold">Find Influencers</h3>
            </div>
            <p className="text-gray-600 text-sm">Search and discover influencers that match your brand.</p>
          </Link>

          <Link to="/brand/create-campaign" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <PlusCircle className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="font-semibold">Create Campaign</h3>
            </div>
            <p className="text-gray-600 text-sm">Set up a new marketing campaign with influencers.</p>
          </Link>

          <Link to="/brand/profile" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <Settings className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="font-semibold">Update Profile</h3>
            </div>
            <p className="text-gray-600 text-sm">Keep your brand profile up to date.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BrandDashboard
