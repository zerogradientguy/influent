"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AlertCircle, TrendingUp, Users, DollarSign, Award, ArrowLeft, MessageSquare, Shield } from "lucide-react"

const InfluencerAnalytics = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [influencer, setInfluencer] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [contentPerformance, setContentPerformance] = useState([])
  const [campaignPerformance, setCampaignPerformance] = useState([])
  const [audienceData, setAudienceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "brand") {
      navigate("/influencer/dashboard")
      return
    }

    const fetchInfluencerData = async () => {
      try {
        // Fetch influencer profile
        const profileRes = await fetch(`http://localhost:5000/api/influencers/${id}`, {
          credentials: "include",
        })

        if (!profileRes.ok) {
          throw new Error("Failed to fetch influencer data")
        }

        const profileData = await profileRes.json()
        setInfluencer(profileData.influencer)

        // For demo purposes, we'll generate mock analytics data
        // In a real app, you would fetch this from the backend
        generateMockAnalytics(profileData.influencer)
      } catch (error) {
        setError("Failed to load influencer analytics")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfluencerData()
  }, [id, user, navigate])

  const generateMockAnalytics = (influencer) => {
    // Generate mock analytics data based on the influencer's metrics
    const mockAnalytics = {
      impressions: Math.floor(influencer.followers * (Math.random() * 0.3 + 0.7)),
      engagement: Math.floor((influencer.followers * influencer.engagementRate) / 100),
      reachRate: Math.floor(Math.random() * 20 + 60), // 60-80%
      conversionRate: (Math.random() * 2 + 1).toFixed(1), // 1-3%
      averageROI: (Math.random() * 3 + 2).toFixed(1), // 2-5x
    }
    setAnalytics(mockAnalytics)

    // Generate mock content performance data
    const platforms = ["Instagram", "TikTok", "YouTube", "Twitter"]
    const mockContentPerformance = platforms.map((platform) => ({
      platform,
      engagement: Math.floor(Math.random() * 5000 + 1000),
      impressions: Math.floor(Math.random() * 15000 + 5000),
      clicks: Math.floor(Math.random() * 1000 + 200),
    }))
    setContentPerformance(mockContentPerformance)

    // Generate mock campaign performance data
    const campaigns = ["Product Launch", "Brand Awareness", "Holiday Special", "Summer Collection"]
    const mockCampaignPerformance = campaigns.map((campaign) => ({
      name: campaign,
      engagement: Math.floor(Math.random() * 3000 + 500),
      conversions: Math.floor(Math.random() * 100 + 10),
      roi: (Math.random() * 4 + 1.5).toFixed(1),
    }))
    setCampaignPerformance(mockCampaignPerformance)

    // Generate mock audience data
    const mockAudienceData = [
      { name: "18-24", value: Math.floor(Math.random() * 30 + 10) },
      { name: "25-34", value: Math.floor(Math.random() * 30 + 20) },
      { name: "35-44", value: Math.floor(Math.random() * 20 + 10) },
      { name: "45+", value: Math.floor(Math.random() * 15 + 5) },
    ]
    setAudienceData(mockAudienceData)
  }

  const startConversation = async () => {
    if (!user) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: influencer.userId }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to start conversation")
      }

      const data = await response.json()
      navigate(`/conversation/${data.conversationId}`)
    } catch (error) {
      setError("Failed to start conversation")
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">Influencer not found.</p>
            <Link to="/brand/search-influencers" className="btn-primary">
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Influencer Analytics</h1>
          <p className="text-gray-600">Performance metrics for {influencer.name}</p>
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

      {/* Influencer Overview */}
      <div className="card mb-8">
        <div className="md:flex items-start">
          <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              {influencer.profileImage ? (
                <img
                  src={`http://localhost:5000/uploads/${influencer.profileImage}`}
                  alt={influencer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                  <Users size={32} />
                </div>
              )}
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{influencer.name}</h2>
              {influencer.isVerified && (
                <div className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>
            <p className="text-emerald-600">{influencer.niche || "Content Creator"}</p>
            <p className="text-gray-600 mt-2">{influencer.bio}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Followers</p>
                <p className="font-semibold">{influencer.followers?.toLocaleString() || "0"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Engagement Rate</p>
                <p className="font-semibold">{influencer.engagementRate?.toFixed(1) || "0"}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-semibold">{influencer.rating?.toFixed(1) || "0"}/5.0</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Base Rate</p>
                <p className="font-semibold">${influencer.pricing?.toLocaleString() || "0"}</p>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={startConversation} className="btn-primary flex items-center">
                <MessageSquare size={18} className="mr-2" />
                Message Influencer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Impressions</p>
            <p className="text-2xl font-bold">{analytics?.impressions?.toLocaleString() || "0"}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Engagement</p>
            <p className="text-2xl font-bold">{analytics?.engagement?.toLocaleString() || "0"}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold">{analytics?.conversionRate || "0"}%</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Average ROI</p>
            <p className="text-2xl font-bold">{analytics?.averageROI || "0"}x</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Content Performance by Platform */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Content Performance by Platform</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentPerformance}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="engagement" fill="#8884d8" name="Engagement" />
                <Bar dataKey="impressions" fill="#82ca9d" name="Impressions" />
                <Bar dataKey="clicks" fill="#ffc658" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Audience Demographics</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Age Group"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Campaign</th>
                <th className="py-3 px-4 text-left">Engagement</th>
                <th className="py-3 px-4 text-left">Conversions</th>
                <th className="py-3 px-4 text-left">ROI</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerformance.map((campaign, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{campaign.name}</td>
                  <td className="py-3 px-4">{campaign.engagement.toLocaleString()}</td>
                  <td className="py-3 px-4">{campaign.conversions.toLocaleString()}</td>
                  <td className="py-3 px-4">{campaign.roi}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InfluencerAnalytics
