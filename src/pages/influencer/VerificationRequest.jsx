"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Upload, Shield, ArrowLeft } from "lucide-react"

const VerificationRequest = ({ user }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    socialMediaLinks: {
      instagram: "",
      tiktok: "",
      youtube: "",
      twitter: "",
    },
    additionalInfo: "",
  })
  const [idDocument, setIdDocument] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Redirect if not logged in or not an influencer
  if (!user) {
    navigate("/login")
    return null
  }

  if (user.role !== "influencer") {
    navigate("/brand/dashboard")
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialMediaChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: value,
      },
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size exceeds 5MB limit")
        return
      }
      setIdDocument(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!formData.fullName) {
      setError("Full name is required")
      setIsLoading(false)
      return
    }

    if (!idDocument) {
      setError("ID document is required")
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName)
      formDataToSend.append("socialMediaLinks", JSON.stringify(formData.socialMediaLinks))
      formDataToSend.append("additionalInfo", formData.additionalInfo)
      formDataToSend.append("idDocument", idDocument)

      const response = await fetch("http://localhost:5000/api/influencer/verification-request", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to submit verification request")
      }

      setSuccess("Verification request submitted successfully. We'll review your request and get back to you soon.")

      // Redirect back to profile after a delay
      setTimeout(() => {
        navigate("/influencer/profile")
      }, 3000)
    } catch (error) {
      setError(error.message || "An error occurred while submitting the verification request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/influencer/profile")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </button>

        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-emerald-600 mr-2" />
          <h1 className="text-2xl font-bold">Verification Request</h1>
        </div>

        <div className="card mb-6 bg-emerald-50 border border-emerald-200">
          <div className="flex items-start">
            <div className="bg-emerald-100 p-2 rounded-full mr-4">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-emerald-800">Why get verified?</h2>
              <p className="text-emerald-700 mt-1">
                Verification helps brands identify authentic influencers and increases your chances of being selected
                for campaigns. Verified influencers typically receive 3x more campaign offers.
              </p>
            </div>
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
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="input-field"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Must match your government-issued ID</p>
              </div>

              <div>
                <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700 mb-1">
                  Government-issued ID *
                </label>
                <div className="mt-1 flex items-center">
                  <label className="block w-full">
                    <span className="sr-only">Choose ID document</span>
                    <input
                      type="file"
                      id="idDocument"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,application/pdf"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a clear photo of your passport, driver's license, or national ID card. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Social Media Verification</h2>

            <div className="space-y-4">
              <p className="text-gray-600">
                Please provide direct links to your social media profiles to help us verify your identity.
              </p>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  id="instagram"
                  className="input-field"
                  placeholder="https://instagram.com/yourusername"
                  value={formData.socialMediaLinks.instagram}
                  onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                  TikTok Profile URL
                </label>
                <input
                  type="url"
                  id="tiktok"
                  className="input-field"
                  placeholder="https://tiktok.com/@yourusername"
                  value={formData.socialMediaLinks.tiktok}
                  onChange={(e) => handleSocialMediaChange("tiktok", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  id="youtube"
                  className="input-field"
                  placeholder="https://youtube.com/c/yourchannel"
                  value={formData.socialMediaLinks.youtube}
                  onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter Profile URL
                </label>
                <input
                  type="url"
                  id="twitter"
                  className="input-field"
                  placeholder="https://twitter.com/yourusername"
                  value={formData.socialMediaLinks.twitter}
                  onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Anything else you'd like us to know?
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows="4"
                className="input-field"
                placeholder="Add any additional information that might help with your verification..."
                value={formData.additionalInfo}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn-secondary mr-4"
              onClick={() => navigate("/influencer/profile")}
              disabled={isLoading}
            >
              Cancel
            </button>
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
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Verification Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerificationRequest
