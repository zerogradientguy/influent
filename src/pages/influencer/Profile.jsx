"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Save, CheckCircle, XCircle, Shield } from "lucide-react"

const InfluencerProfile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    niche: "",
    bio: "",
    location: "",
    followers: {
      instagram: "",
      tiktok: "",
      youtube: "",
      twitter: "",
    },
    socialMedia: {
      instagram: "",
      tiktok: "",
      youtube: "",
      twitter: "",
    },
    pricing: "",
    availability: true,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    latestRequest: null,
  })
  const navigate = useNavigate()

  // Add a refresh function to fetch the latest profile data
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/influencer/profile", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()

      // Parse social media JSON if it's a string
      let socialMedia = data.influencer.social_media
      if (typeof socialMedia === "string") {
        try {
          socialMedia = JSON.parse(socialMedia)
        } catch (e) {
          socialMedia = {
            instagram: "",
            tiktok: "",
            youtube: "",
            twitter: "",
          }
        }
      }

      setFormData({
        name: user.name || "",
        email: user.email || "",
        niche: data.influencer.niche || "",
        bio: data.influencer.bio || "",
        location: data.influencer.location || "",
        followers: {
          instagram: data.influencer.followers?.instagram || "",
          tiktok: data.influencer.followers?.tiktok || "",
          youtube: data.influencer.followers?.youtube || "",
          twitter: data.influencer.followers?.twitter || "",
        },
        socialMedia: socialMedia || {
          instagram: "",
          tiktok: "",
          youtube: "",
          twitter: "",
        },
        pricing: data.influencer.pricing || "",
        availability: data.influencer.availability !== false,
      })
    } catch (error) {
      setError("Failed to load profile data")
      console.error(error)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [user])

  // Fetch verification status
  const fetchVerificationStatus = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/influencer/verification-status", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch verification status")
      }

      const data = await response.json()
      setVerificationStatus(data)
    } catch (error) {
      console.error("Failed to fetch verification status:", error)
    }
  }, [])

  // Update the useEffect to use the fetchProfile function
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

    // Fetch influencer profile
    fetchProfile()
    fetchVerificationStatus()
  }, [user, navigate, fetchProfile, fetchVerificationStatus])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSocialMediaChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }))
  }

  const handleFollowersChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      followers: {
        ...prev.followers,
        [platform]: value,
      },
    }))
  }

  // Update the handleSubmit function to refresh the profile data after update
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/influencer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update profile")
      }

      // Refresh the profile data to ensure the dashboard shows the latest information
      await fetchProfile()

      setSuccess("Profile updated successfully")

      // Update the user object with the new name if it was changed
      if (formData.name !== user.name) {
        setUser((prev) => ({
          ...prev,
          name: formData.name,
        }))
      }
    } catch (error) {
      setError(error.message || "An error occurred while updating the profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationRequest = () => {
    navigate("/influencer/verification-request")
  }

  const getVerificationStatusDisplay = () => {
    if (verificationStatus.isVerified) {
      return (
        <div className="flex items-center text-emerald-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Verified Account</span>
        </div>
      )
    }

    if (verificationStatus.latestRequest) {
      switch (verificationStatus.latestRequest.status) {
        case "pending":
          return (
            <div className="flex items-center text-yellow-600">
              <Shield className="h-5 w-5 mr-2" />
              <span>Verification Pending</span>
            </div>
          )
        case "rejected":
          return (
            <div className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              <span>Verification Rejected</span>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className="flex items-center text-gray-600">
        <Shield className="h-5 w-5 mr-2" />
        <span>Not Verified</span>
      </div>
    )
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Influencer Profile</h1>
          <div className="flex items-center">
            {getVerificationStatusDisplay()}
            {!verificationStatus.isVerified && !(verificationStatus.latestRequest?.status === "pending") && (
              <button onClick={handleVerificationRequest} className="ml-4 btn-secondary flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Request Verification
              </button>
            )}
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

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
                  Niche *
                </label>
                <select
                  id="niche"
                  name="niche"
                  required
                  className="input-field"
                  value={formData.niche}
                  onChange={handleChange}
                >
                  <option value="">Select Niche</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Technology">Technology</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Business">Business</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio *
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  required
                  className="input-field"
                  placeholder="Tell brands about yourself, your content, and your audience..."
                  value={formData.bio}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="input-field"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Social Media Profiles</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      id="instagram"
                      className="input-field rounded-l-none"
                      placeholder="username"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="instagram_followers" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram Followers
                  </label>
                  <input
                    type="number"
                    id="instagram_followers"
                    className="input-field"
                    placeholder="e.g. 10000"
                    value={formData.followers.instagram}
                    onChange={(e) => handleFollowersChange("instagram", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      id="tiktok"
                      className="input-field rounded-l-none"
                      placeholder="username"
                      value={formData.socialMedia.tiktok}
                      onChange={(e) => handleSocialMediaChange("tiktok", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tiktok_followers" className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok Followers
                  </label>
                  <input
                    type="number"
                    id="tiktok_followers"
                    className="input-field"
                    placeholder="e.g. 10000"
                    value={formData.followers.tiktok}
                    onChange={(e) => handleFollowersChange("tiktok", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube
                  </label>
                  <input
                    type="text"
                    id="youtube"
                    className="input-field"
                    placeholder="Channel name or URL"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="youtube_followers" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube Subscribers
                  </label>
                  <input
                    type="number"
                    id="youtube_followers"
                    className="input-field"
                    placeholder="e.g. 10000"
                    value={formData.followers.youtube}
                    onChange={(e) => handleFollowersChange("youtube", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      id="twitter"
                      className="input-field rounded-l-none"
                      placeholder="username"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="twitter_followers" className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter Followers
                  </label>
                  <input
                    type="number"
                    id="twitter_followers"
                    className="input-field"
                    placeholder="e.g. 10000"
                    value={formData.followers.twitter}
                    onChange={(e) => handleFollowersChange("twitter", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Collaboration Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Rate (USD)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="pricing"
                    id="pricing"
                    className="input-field pl-7"
                    placeholder="0.00"
                    value={formData.pricing}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Your starting price for collaborations</p>
              </div>

              <div className="flex items-center">
                <input
                  id="availability"
                  name="availability"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  checked={formData.availability}
                  onChange={handleChange}
                />
                <label htmlFor="availability" className="ml-2 block text-sm text-gray-900">
                  Available for new collaborations
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>

            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {/* Placeholder for profile picture */}
                <span className="text-gray-400">No image</span>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF up to 2MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center" disabled={isLoading}>
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InfluencerProfile
