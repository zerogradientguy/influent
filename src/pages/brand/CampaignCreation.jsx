"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"

const CampaignCreation = ({ user }) => {
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
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

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
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/brand/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create campaign")
      }

      navigate(`/campaign/${data.campaign.id}`)
    } catch (error) {
      setError(error.message || "An error occurred while creating the campaign")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
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
            <button type="button" className="btn-secondary" onClick={() => navigate("/brand/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CampaignCreation
