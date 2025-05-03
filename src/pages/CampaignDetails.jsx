"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Calendar, DollarSign, Users, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react"

const CampaignDetails = ({ user }) => {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [influencers, setInfluencers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [applySuccess, setApplySuccess] = useState(false)
  const [success, setSuccess] = useState(null)
  const [feedbackData, setFeedbackData] = useState({
    influencerId: null,
    rating: 5,
    feedback: "",
    showModal: false,
  })

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login")
      return
    }

    const fetchCampaignData = async () => {
      try {
        const [campaignRes, influencersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/campaigns/${id}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:5000/api/campaigns/${id}/influencers`, {
            credentials: "include",
          }),
        ])

        if (!campaignRes.ok || !influencersRes.ok) {
          throw new Error("Failed to fetch campaign data")
        }

        const campaignData = await campaignRes.json()
        const influencersData = await influencersRes.json()

        setCampaign(campaignData.campaign)
        setInfluencers(influencersData.influencers)
      } catch (error) {
        setError("Failed to load campaign details")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaignData()
  }, [id, user, navigate])

  const handleApply = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/api/campaigns/${id}/apply`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to apply for campaign")
      }

      // Update the influencers list
      const updatedInfluencersRes = await fetch(`http://localhost:5000/api/campaigns/${id}/influencers`, {
        credentials: "include",
      })

      if (!updatedInfluencersRes.ok) {
        throw new Error("Failed to update influencers list")
      }

      const updatedInfluencersData = await updatedInfluencersRes.json()
      setInfluencers(updatedInfluencersData.influencers)
      setApplySuccess(true)

      // Hide success message after 5 seconds
      setTimeout(() => {
        setApplySuccess(false)
      }, 5000)
    } catch (error) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInfluencerAction = async (influencerId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/campaigns/${id}/influencers/${influencerId}/${action}`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} influencer`)
      }

      // Update the influencers list
      const updatedInfluencersRes = await fetch(`http://localhost:5000/api/campaigns/${id}/influencers`, {
        credentials: "include",
      })

      if (!updatedInfluencersRes.ok) {
        throw new Error("Failed to update influencers list")
      }

      const updatedInfluencersData = await updatedInfluencersRes.json()
      setInfluencers(updatedInfluencersData.influencers)
    } catch (error) {
      setError(error.message || "An error occurred")
    }
  }

  // Add this function after the handleInfluencerAction function
  const submitFeedback = async (influencerId, rating, feedback) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/api/campaigns/${id}/influencers/${influencerId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, feedback }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      // Update the influencers list
      const updatedInfluencersRes = await fetch(`http://localhost:5000/api/campaigns/${id}/influencers`, {
        credentials: "include",
      })

      if (!updatedInfluencersRes.ok) {
        throw new Error("Failed to update influencers list")
      }

      const updatedInfluencersData = await updatedInfluencersRes.json()
      setInfluencers(updatedInfluencersData.influencers)
      setSuccess("Feedback submitted successfully")

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (error) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-8">
          <h2 className="text-xl font-bold mb-4">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">
            The campaign you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to={user.role === "brand" ? "/brand/dashboard" : "/influencer/dashboard"} className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {applySuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 animate-fadeIn">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">
              Application submitted successfully! The brand will review your application.
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 animate-fadeIn">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-gray-600">
            {user.role === "influencer" ? `By ${campaign.brandName}` : "Campaign Details"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{campaign.description}</p>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <p className="text-gray-700 whitespace-pre-line">{campaign.requirements}</p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Target Audience</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Age Range:</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.targetAudience.ageRange.map((age) => (
                    <span key={age} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {age}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Gender:</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.targetAudience.gender.map((gender) => (
                    <span key={gender} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {gender}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Interests:</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.targetAudience.interests.map((interest) => (
                    <span key={interest} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium">${campaign.budget}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Influencers</p>
                  <p className="font-medium">{influencers.filter((i) => i.status === "approved").length} approved</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {user.role === "influencer" && (
              <div className="mt-6">
                {influencers.some((i) => i.influencerId === user.id) ? (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-gray-700 mb-2 font-medium">You have already applied to this campaign</p>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      {influencers.find((i) => i.influencerId === user.id)?.status === "approved"
                        ? "Approved"
                        : influencers.find((i) => i.influencerId === user.id)?.status === "rejected"
                          ? "Rejected"
                          : "Pending Review"}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="btn-primary w-full flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Applying...
                      </>
                    ) : (
                      "Apply for Campaign"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {user.role === "brand" && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <Link to={`/brand/edit-campaign/${id}`} className="btn-secondary w-full block text-center">
                  Edit Campaign
                </Link>
                <button className="btn-primary w-full">View Analytics</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Influencers Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{user.role === "brand" ? "Influencers" : "Other Influencers"}</h2>

        {influencers.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">No influencers have applied to this campaign yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Influencer</th>
                  <th className="py-3 px-4 text-left">Followers</th>
                  <th className="py-3 px-4 text-left">Engagement Rate</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  {user.role === "brand" && <th className="py-3 px-4 text-left">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {influencers.map((influencer) => (
                  <tr key={influencer.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                        <div>
                          <p className="font-medium">{influencer.name}</p>
                          <p className="text-sm text-gray-600">{influencer.niche}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{influencer.followers.toLocaleString()}</td>
                    <td className="py-3 px-4">{influencer.engagementRate}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          influencer.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : influencer.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : influencer.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {influencer.status.charAt(0).toUpperCase() + influencer.status.slice(1)}
                      </span>
                    </td>
                    {user.role === "brand" && (
                      <td className="py-3 px-4">
                        {influencer.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleInfluencerAction(influencer.influencerId, "approve")}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleInfluencerAction(influencer.influencerId, "reject")}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        )}
                        {influencer.status === "approved" && (
                          <div className="flex space-x-2">
                            <Link
                              to={`/influencer/${influencer.influencerId}`}
                              className="text-emerald-600 hover:text-emerald-800 mr-2"
                            >
                              View Profile
                            </Link>
                            <button
                              onClick={() =>
                                setFeedbackData({
                                  influencerId: influencer.influencerId,
                                  rating: 5,
                                  feedback: "",
                                  showModal: true,
                                })
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Rate Performance
                            </button>
                          </div>
                        )}
                        {influencer.status !== "pending" && influencer.status !== "approved" && (
                          <Link
                            to={`/influencer/${influencer.influencerId}`}
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            View Profile
                          </Link>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Feedback Modal */}
      {feedbackData.showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rate Influencer Performance</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5 stars)</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className={`text-2xl ${feedbackData.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <textarea
                id="feedback"
                rows="4"
                className="input-field"
                placeholder="Share your experience working with this influencer..."
                value={feedbackData.feedback}
                onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFeedbackData({ ...feedbackData, showModal: false })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  submitFeedback(feedbackData.influencerId, feedbackData.rating, feedbackData.feedback)
                  setFeedbackData({ ...feedbackData, showModal: false })
                }}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignDetails
