"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BarChart2, DollarSign, MessageSquare, AlertCircle, Star, Settings, Search } from "lucide-react"

const InfluencerDashboard = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalEarnings: 0,
    pendingRequests: 0,
    averageRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not logged in or not an influencer
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "influencer") {
      navigate("/brand/dashboard")
      return
    }

    // Fetch campaigns and stats
    const fetchData = async () => {
      try {
        const [campaignsRes, statsRes] = await Promise.all([
          fetch("http://localhost:5000/api/influencer/campaigns", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/influencer/stats", {
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
          <h1 className="text-2xl font-bold">Influencer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Link to="/influencer/profile" className="btn-primary mt-4 md:mt-0">
          Update Profile
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
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold">${stats.totalEarnings}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Requests</p>
            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Campaign Opportunities */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Campaign Opportunities</h2>

        {campaigns.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">No campaign opportunities available at the moment.</p>
            <Link to="/influencer/profile" className="btn-primary inline-flex items-center">
              Update Your Profile to Get Matched
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Campaign Name</th>
                  <th className="py-3 px-4 text-left">Brand</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Compensation</th>
                  <th className="py-3 px-4 text-left">Deadline</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{campaign.name}</td>
                    <td className="py-3 px-4">{campaign.brandName}</td>
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
                    <td className="py-3 px-4">${campaign.compensation}</td>
                    <td className="py-3 px-4">{new Date(campaign.deadline).toLocaleDateString()}</td>
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

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Available Campaigns</h2>
        <div className="card">
          <p className="text-gray-600 mb-4">Discover campaigns that match your profile and interests.</p>
          <Link to="/influencer/available-campaigns" className="btn-primary inline-flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Browse Available Campaigns
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/influencer/profile" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <Settings className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="font-semibold">Update Profile</h3>
            </div>
            <p className="text-gray-600 text-sm">Keep your profile up to date to get better matches.</p>
          </Link>

          <Link to="/influencer/campaigns" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <BarChart2 className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="font-semibold">My Campaigns</h3>
            </div>
            <p className="text-gray-600 text-sm">View and manage your current campaign collaborations.</p>
          </Link>

          <Link to="/resources" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="font-semibold">Resources</h3>
            </div>
            <p className="text-gray-600 text-sm">Learn best practices for working with brands.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default InfluencerDashboard
