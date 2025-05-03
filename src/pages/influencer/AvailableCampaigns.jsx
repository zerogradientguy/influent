"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Filter, Calendar, DollarSign, AlertCircle } from "lucide-react"

const AvailableCampaigns = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
  const [filteredCampaigns, setFilteredCampaigns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    minBudget: "",
    maxBudget: "",
    category: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
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
        const response = await fetch("http://localhost:5000/api/influencer/available-campaigns", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch available campaigns")
        }

        const data = await response.json()
        setCampaigns(data.campaigns)
        setFilteredCampaigns(data.campaigns)
      } catch (error) {
        setError("Failed to load available campaigns")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [user, navigate])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    applyFilters(e.target.value, filters)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const updatedFilters = { ...filters, [name]: value }
    setFilters(updatedFilters)
    applyFilters(searchTerm, updatedFilters)
  }

  const handleCategoryChange = (category) => {
    let updatedCategories
    if (filters.category.includes(category)) {
      updatedCategories = filters.category.filter((c) => c !== category)
    } else {
      updatedCategories = [...filters.category, category]
    }

    const updatedFilters = { ...filters, category: updatedCategories }
    setFilters(updatedFilters)
    applyFilters(searchTerm, updatedFilters)
  }

  const applyFilters = (search, currentFilters) => {
    let result = campaigns

    // Apply search term
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchLower) ||
          campaign.brandName.toLowerCase().includes(searchLower) ||
          campaign.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply budget range
    if (currentFilters.minBudget) {
      result = result.filter((campaign) => campaign.budget >= Number(currentFilters.minBudget))
    }

    if (currentFilters.maxBudget) {
      result = result.filter((campaign) => campaign.budget <= Number(currentFilters.maxBudget))
    }

    // Apply category filter
    if (currentFilters.category.length > 0) {
      result = result.filter((campaign) => {
        const campaignInterests = campaign.targetAudience?.interests || []
        return currentFilters.category.some((category) => campaignInterests.includes(category))
      })
    }

    setFilteredCampaigns(result)
  }

  const resetFilters = () => {
    setFilters({
      minBudget: "",
      maxBudget: "",
      category: [],
    })
    setSearchTerm("")
    setFilteredCampaigns(campaigns)
  }

  // For demo purposes, create some sample campaigns if none are returned from the API
  useEffect(() => {
    if (!isLoading && campaigns.length === 0 && !error) {
      // Sample data for demonstration
      const sampleCampaigns = [
        {
          id: 1,
          name: "Summer Fashion Collection",
          brandName: "StyleBrand",
          description: "Promote our new summer fashion collection on your social media channels.",
          budget: 1500,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          targetAudience: {
            interests: ["Fashion", "Lifestyle"],
          },
        },
        {
          id: 2,
          name: "Fitness App Launch",
          brandName: "FitTech",
          description: "Help us launch our new fitness tracking app with authentic content about your fitness journey.",
          budget: 2000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          targetAudience: {
            interests: ["Fitness", "Health", "Technology"],
          },
        },
        {
          id: 3,
          name: "Organic Food Promotion",
          brandName: "NatureEats",
          description: "Create content showcasing our organic food products in your daily meals.",
          budget: 1200,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          targetAudience: {
            interests: ["Food", "Health", "Lifestyle"],
          },
        },
      ]

      setCampaigns(sampleCampaigns)
      setFilteredCampaigns(sampleCampaigns)
    }
  }, [isLoading, campaigns, error])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Available Campaigns</h1>
          <p className="text-gray-600">Discover campaigns that match your profile and interests</p>
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

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search campaigns by name, brand, or keywords"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            className="btn-secondary flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 card">
            <h2 className="text-lg font-semibold mb-4">Filter Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (USD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      name="minBudget"
                      className="input-field"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="maxBudget"
                      className="input-field"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {["Fashion", "Beauty", "Fitness", "Travel", "Food", "Technology", "Gaming", "Lifestyle"].map(
                    (category) => (
                      <label key={category} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                          checked={filters.category.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span className="ml-2">{category}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="btn-secondary" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600 mb-4">No campaigns found matching your criteria.</p>
          <button className="btn-primary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{campaign.description}</p>

              <div className="text-sm text-gray-600 mb-2">By {campaign.brandName}</div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-medium">${campaign.budget}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-medium">{new Date(campaign.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {campaign.targetAudience?.interests?.map((interest) => (
                  <span key={interest} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <Link to={`/campaign/${campaign.id}`} className="btn-secondary flex-1 text-center">
                  View Details
                </Link>
                <Link to={`/campaign/${campaign.id}`} className="btn-primary flex-1 text-center">
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvailableCampaigns
