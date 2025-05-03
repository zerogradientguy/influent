"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  User,
  MapPin,
  Instagram,
  Twitter,
  Youtube,
  MessageSquare,
  Star,
  AlertCircle,
  ExternalLink,
  Shield,
} from "lucide-react"

const InfluencerPublicProfile = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [influencer, setInfluencer] = useState(null)
  const [portfolioItems, setPortfolioItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchInfluencerData = async () => {
      try {
        const [profileRes, portfolioRes] = await Promise.all([
          fetch(`http://localhost:5000/api/influencers/${id}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:5000/api/influencers/${id}/portfolio`, {
            credentials: "include",
          }),
        ])

        if (!profileRes.ok || !portfolioRes.ok) {
          throw new Error("Failed to fetch influencer data")
        }

        const profileData = await profileRes.json()
        const portfolioData = await portfolioRes.json()

        setInfluencer({
          ...profileData.influencer,
          is_verified: profileData.influencer.isVerified,
        })
        setPortfolioItems(portfolioData.portfolioItems)
      } catch (error) {
        setError("Failed to load influencer profile")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfluencerData()
  }, [id])

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

  // Parse social media data
  let socialMedia = {}
  try {
    socialMedia =
      typeof influencer.socialMedia === "string" ? JSON.parse(influencer.socialMedia) : influencer.socialMedia
  } catch (e) {
    socialMedia = {}
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="card mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden">
                {influencer.profileImage ? (
                  <img
                    src={`http://localhost:5000/uploads/${influencer.profileImage}`}
                    alt={influencer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                    <User size={64} />
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3 mt-6 md:mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold">{influencer.name}</h1>
                    {influencer.is_verified ? (
                      <div className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    ) : (
                      user &&
                      user.role === "brand" && (
                        <div className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Not Verified
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-emerald-600 font-medium">{influencer.niche || "Content Creator"}</p>
                  {influencer.location && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin size={16} className="mr-1" />
                      {influencer.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md">
                    <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                    <span className="font-medium">{influencer.rating?.toFixed(1) || "4.8"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="font-semibold">Bio</h2>
                <p className="text-gray-700 mt-1">{influencer.bio}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {socialMedia.instagram && (
                  <a
                    href={`https://instagram.com/${socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-pink-600 hover:text-pink-700"
                  >
                    <Instagram size={18} className="mr-1" />
                    <span>@{socialMedia.instagram}</span>
                  </a>
                )}
                {socialMedia.twitter && (
                  <a
                    href={`https://twitter.com/${socialMedia.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-600"
                  >
                    <Twitter size={18} className="mr-1" />
                    <span>@{socialMedia.twitter}</span>
                  </a>
                )}
                {socialMedia.youtube && (
                  <a
                    href={socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Youtube size={18} className="mr-1" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="bg-gray-100 px-3 py-2 rounded-md">
                  <p className="text-xs text-gray-500">Followers</p>
                  <p className="font-semibold">{influencer.followers?.toLocaleString() || "75K+"}</p>
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-md">
                  <p className="text-xs text-gray-500">Engagement Rate</p>
                  <p className="font-semibold">{influencer.engagementRate?.toFixed(1) || "4.2"}%</p>
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-md">
                  <p className="text-xs text-gray-500">Base Rate</p>
                  <p className="font-semibold">${influencer.pricing?.toLocaleString() || "500"}</p>
                </div>
              </div>

              {user && user.role === "brand" && (
                <div className="mt-6">
                  <button onClick={startConversation} className="btn-primary flex items-center">
                    <MessageSquare size={18} className="mr-2" />
                    Message Influencer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Portfolio</h2>

          {portfolioItems.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No portfolio items available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200">
                    {item.image_url ? (
                      <img
                        src={`http://localhost:5000/uploads/${item.image_url}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-emerald-600 mb-2">{item.platform}</p>
                    {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      View Content
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfluencerPublicProfile
