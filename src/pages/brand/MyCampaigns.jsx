"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, PlusCircle, Search } from "lucide-react"

const MyCampaigns = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
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

    const fetchCampaigns = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/brand/campaigns", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch campaigns")
        }

        const data = await response.json()
        setCampaigns(data.campaigns)
      } catch (error) {
        setError("Failed to load campaigns")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [user, navigate])

  // For demo purposes, create some sample campaigns if none are returned from the API
  useEffect(() => {
    if (!isLoading && campaigns.length === 0 && !error) {
      // Sample data for demonstration
      const sampleCampaigns = [
        {
          id: 1,
          name: "Summer Fashion Collection",
          status: "active",
          budget: 5000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          influencerCount: 3,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          name: "Holiday Special Promotion",
          status: "pending",
          budget: 3500,
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          influencerCount: 0,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          name: "Product Launch Campaign",
          status: "completed",
          budget: 7500,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          influencerCount: 5,
          createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setCampaigns(sampleCampaigns)
    }
  }, [isLoading, campaigns, error])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Group campaigns by status
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active")
  const pendingCampaigns = campaigns.filter((campaign) => campaign.status === "pending")
  const completedCampaigns = campaigns.filter((campaign) => campaign.status === "completed")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="text-gray-600">Manage your marketing campaigns</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Link to="/brand/search-influencers" className="btn-secondary flex items-center justify-center">
            <Search className="h-5 w-5 mr-2" />
            Find Influencers
          </Link>
          <Link to="/brand/create-campaign" className="btn-primary flex items-center justify-center">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Campaign
          </Link>
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

      {campaigns.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600 mb-4">You haven't created any campaigns yet.</p>
          <Link to="/brand/create-campaign" className="btn-primary inline-flex items-center">
            <PlusCircle size={18} className="mr-2" />
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Campaigns */}
          <div>
            <h2 className="text-xl font-bold mb-4">Active Campaigns</h2>
            {activeCampaigns.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-gray-600">No active campaigns</p>
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
                      <th className="py-3 px-4 text-left">End Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{campaign.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
                        </td>
                        <td className="py-3 px-4">{campaign.influencerCount}</td>
                        <td className="py-3 px-4">${campaign.budget}</td>
                        <td className="py-3 px-4">{new Date(campaign.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Link to={`/campaign/${campaign.id}`} className="text-emerald-600 hover:text-emerald-800">
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Campaigns */}
          <div>
            <h2 className="text-xl font-bold mb-4">Pending Campaigns</h2>
            {pendingCampaigns.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-gray-600">No pending campaigns</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Campaign Name</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Budget</th>
                      <th className="py-3 px-4 text-left">Start Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{campaign.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>
                        </td>
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

          {/* Completed Campaigns */}
          <div>
            <h2 className="text-xl font-bold mb-4">Completed Campaigns</h2>
            {completedCampaigns.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-gray-600">No completed campaigns</p>
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
                      <th className="py-3 px-4 text-left">End Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{campaign.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Completed</span>
                        </td>
                        <td className="py-3 px-4">{campaign.influencerCount}</td>
                        <td className="py-3 px-4">${campaign.budget}</td>
                        <td className="py-3 px-4">{new Date(campaign.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Link to={`/campaign/${campaign.id}`} className="text-emerald-600 hover:text-emerald-800">
                            View Results
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCampaigns
