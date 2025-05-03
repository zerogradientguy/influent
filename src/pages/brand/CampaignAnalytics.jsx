"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { AlertCircle, TrendingUp, Users, DollarSign, Award } from "lucide-react"

const CampaignAnalytics = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [contentPerformance, setContentPerformance] = useState([])
  const [influencerPerformance, setInfluencerPerformance] = useState([])
  const [dailyStats, setDailyStats] = useState([])
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

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/campaigns/${id}/analytics`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const data = await response.json()
        setAnalytics(data.analytics)
        setContentPerformance(data.contentPerformance)
        setInfluencerPerformance(data.influencerPerformance)
        setDailyStats(data.dailyStats)
      } catch (error) {
        setError("Failed to load analytics data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [id, user, navigate])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Campaign Analytics</h1>
        <p className="text-gray-600">Track performance metrics and ROI for your campaign</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
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
            <p className="text-sm text-gray-600">Conversions</p>
            <p className="text-2xl font-bold">{analytics?.conversions?.toLocaleString() || "0"}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">ROI</p>
            <p className="text-2xl font-bold">{analytics?.roi?.toFixed(1) || "0"}x</p>
          </div>
        </div>
      </div>

      {/* Daily Performance */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyStats}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
              <Line type="monotone" dataKey="clicks" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
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
                <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Influencer Performance */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Influencer Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={influencerPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="engagement"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {influencerPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} engagements`, props.payload.name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Influencer Performance Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Influencer Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Influencer</th>
                <th className="py-3 px-4 text-left">Engagement</th>
                <th className="py-3 px-4 text-left">Clicks</th>
                <th className="py-3 px-4 text-left">Conversions</th>
                <th className="py-3 px-4 text-left">ROI</th>
              </tr>
            </thead>
            <tbody>
              {influencerPerformance.map((influencer, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{influencer.name}</td>
                  <td className="py-3 px-4">{influencer.engagement.toLocaleString()}</td>
                  <td className="py-3 px-4">{influencer.clicks.toLocaleString()}</td>
                  <td className="py-3 px-4">{influencer.conversions.toLocaleString()}</td>
                  <td className="py-3 px-4">{influencer.roi}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CampaignAnalytics
