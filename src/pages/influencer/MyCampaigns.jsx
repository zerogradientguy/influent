"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Calendar, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react"

const MyCampaigns = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
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

    const fetchCampaigns = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/influencer/campaigns", {
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
          brandName: "StyleBrand",
          status: "approved",
          compensation: 1500,
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Promote our new summer fashion collection on your social media channels.",
        },
        {
          id: 2,
          name: "Fitness App Launch",
          brandName: "FitTech",
          status: "pending",
          compensation: 2000,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Help us launch our new fitness tracking app with authentic content about your fitness journey.",
        },
        {
          id: 3,
          name: "Organic Food Promotion",
          brandName: "NatureEats",
          status: "completed",
          compensation: 1200,
          deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Create content showcasing our organic food products in your daily meals.",
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
  const pendingCampaigns = campaigns.filter((campaign) => campaign.status === "pending")
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "approved")
  const completedCampaigns = campaigns.filter((campaign) => campaign.status === "completed")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="text-gray-600">Manage your campaign collaborations</p>
        </div>
        <Link to="/influencer/available-campaigns" className="btn-primary mt-4 md:mt-0 flex items-center">
          Browse Available Campaigns
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

      {campaigns.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600 mb-4">You haven't applied to any campaigns yet.</p>
          <Link to="/influencer/available-campaigns" className="btn-primary">
            Browse Available Campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Campaigns */}
          <div>
            <h2 className="text-xl font-bold mb-4">Pending Applications</h2>
            {pendingCampaigns.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-gray-600">No pending applications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="card border-l-4 border-yellow-400">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">By {campaign.brandName}</p>
                    <p className="text-gray-700 mb-4 text-sm line-clamp-2">{campaign.description}</p>
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium">${campaign.compensation}</span>
                      </div>
                      <Link to={`/campaign/${campaign.id}`} className="text-emerald-600 hover:text-emerald-700 text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Campaigns */}
          <div>
            <h2 className="text-xl font-bold mb-4">Active Campaigns</h2>
            {activeCampaigns.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-gray-600">No active campaigns</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="card border-l-4 border-green-400">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">By {campaign.brandName}</p>
                    <p className="text-gray-700 mb-4 text-sm line-clamp-2">{campaign.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm">Due: {new Date(campaign.deadline).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/campaign/${campaign.id}`} className="btn-primary text-xs py-1">
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="card border-l-4 border-gray-400">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Completed</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">By {campaign.brandName}</p>
                    <p className="text-gray-700 mb-4 text-sm line-clamp-2">{campaign.description}</p>
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium">${campaign.compensation}</span>
                      </div>
                      <Link to={`/campaign/${campaign.id}`} className="text-emerald-600 hover:text-emerald-700 text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCampaigns
