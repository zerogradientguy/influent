"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle, Save, ArrowLeft } from "lucide-react"

const EditCampaign = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    requirements: "",
    targetAudience: {
      ageRange: [],
      gender: [],
      interests: [],
    },
    status: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "brand") {
      navigate("/influencer/dashboard")
      return
    }

    const fetchCampaign = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch campaign")
        }

        const data = await response.json()
        const campaign = data.campaign

        // Parse target audience if it's a string
        let targetAudience = campaign.targetAudience
        if (typeof targetAudience === "string") {
          try {
            targetAudience = JSON.parse(targetAudience)
          } catch (e) {
            targetAudience = {
              ageRange: [],
              gender: [],
              interests: [],
            }
          }
        }

        setFormData({
          name: campaign.name,
          description: campaign.description,
          budget: campaign.budget.toString(),
          startDate: new Date(campaign.startDate).toISOString().split("T")[0],
          endDate: new Date(campaign.endDate).toISOString().split("T")[0],
          requirements: campaign.requirements,
          targetAudience: targetAudience,
          status: campaign.status,
        })
      } catch (error) {
        setError("Failed to load campaign data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaign()
  }, [id, user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTargetAudienceChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [category]: value,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      const response = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update campaign")
      }

      setSuccess("Campaign updated successfully")

      // Navigate back to campaign details after a short delay
      setTimeout(() => {
        navigate(`/campaign/${id}`)
      }, 1500)
    } catch (error) {
      setError(error.message || "An error occurred while updating the campaign")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(`/campaign/${id}`)} className="mr-3 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Edit Campaign</h1>
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
            <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  className="input-field"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (USD) *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="1"
                  required
                  className="input-field"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    className="input-field"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    className="input-field"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="input-field"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Campaign Requirements</h2>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Influencer Requirements *
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows="4"
                required
                className="input-field"
                placeholder="Describe what you expect from influencers (content type, deliverables, etc.)"
                value={formData.requirements}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Target Audience</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                <div className="flex flex-wrap gap-2">
                  {["13-17", "18-24", "25-34", "35-44", "45-54", "55+"].map((age) => (
                    <label key={age} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        checked={formData.targetAudience.ageRange.includes(age)}
                        onChange={(e) => {
                          const newAgeRange = e.target.checked
                            ? [...formData.targetAudience.ageRange, age]
                            : formData.targetAudience.ageRange.filter((a) => a !== age)
                          handleTargetAudienceChange("ageRange", newAgeRange)
                        }}
                      />
                      <span className="ml-2">{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex flex-wrap gap-4">
                  {["Male", "Female", "All"].map((gender) => (
                    <label key={gender} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        checked={formData.targetAudience.gender.includes(gender)}
                        onChange={(e) => {
                          const newGender = e.target.checked
                            ? [...formData.targetAudience.gender, gender]
                            : formData.targetAudience.gender.filter((g) => g !== gender)
                          handleTargetAudienceChange("gender", newGender)
                        }}
                      />
                      <span className="ml-2">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Fashion",
                    "Beauty",
                    "Fitness",
                    "Travel",
                    "Food",
                    "Technology",
                    "Gaming",
                    "Lifestyle",
                    "Business",
                    "Entertainment",
                  ].map((interest) => (
                    <label key={interest} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        checked={formData.targetAudience.interests.includes(interest)}
                        onChange={(e) => {
                          const newInterests = e.target.checked
                            ? [...formData.targetAudience.interests, interest]
                            : formData.targetAudience.interests.filter((i) => i !== interest)
                          handleTargetAudienceChange("interests", newInterests)
                        }}
                      />
                      <span className="ml-2">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/campaign/${id}`)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center" disabled={isSaving}>
              {isSaving ? (
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCampaign
