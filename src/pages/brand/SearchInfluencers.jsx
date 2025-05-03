"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, Star, AlertCircle, Shield } from "lucide-react"

const SearchInfluencers = ({ user }) => {
  const [influencers, setInfluencers] = useState([])
  const [filteredInfluencers, setFilteredInfluencers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    niche: [],
    minFollowers: "",
    maxFollowers: "",
    minEngagementRate: "",
    location: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not logged in or not a brand
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "brand") {
      navigate("/influencer/dashboard")
      return
    }

    const fetchInfluencers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/influencers", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch influencers")
        }

        const data = await response.json()
        setInfluencers(data.influencers)
        setFilteredInfluencers(data.influencers)
      } catch (error) {
        setError("Failed to load influencers")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfluencers()
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

  const handleNicheChange = (niche) => {
    let updatedNiches
    if (filters.niche.includes(niche)) {
      updatedNiches = filters.niche.filter((n) => n !== niche)
    } else {
      updatedNiches = [...filters.niche, niche]
    }

    const updatedFilters = { ...filters, niche: updatedNiches }
    setFilters(updatedFilters)
    applyFilters(searchTerm, updatedFilters)
  }

  const applyFilters = (search, currentFilters) => {
    let result = influencers

    // Apply search term
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (influencer) =>
          influencer.name.toLowerCase().includes(searchLower) ||
          influencer.niche.toLowerCase().includes(searchLower) ||
          influencer.bio.toLowerCase().includes(searchLower),
      )
    }

    // Apply niche filter
    if (currentFilters.niche.length > 0) {
      result = result.filter((influencer) => currentFilters.niche.includes(influencer.niche))
    }

    // Apply followers range
    if (currentFilters.minFollowers) {
      result = result.filter((influencer) => influencer.followers >= Number.parseInt(currentFilters.minFollowers))
    }

    if (currentFilters.maxFollowers) {
      result = result.filter((influencer) => influencer.followers <= Number.parseInt(currentFilters.maxFollowers))
    }

    // Apply engagement rate
    if (currentFilters.minEngagementRate) {
      result = result.filter(
        (influencer) => influencer.engagementRate >= Number.parseFloat(currentFilters.minEngagementRate),
      )
    }

    // Apply location
    if (currentFilters.location) {
      const locationLower = currentFilters.location.toLowerCase()
      result = result.filter((influencer) => influencer.location.toLowerCase().includes(locationLower))
    }

    setFilteredInfluencers(result)
  }

  const resetFilters = () => {
    setFilters({
      niche: [],
      minFollowers: "",
      maxFollowers: "",
      minEngagementRate: "",
      location: "",
    })
    setSearchTerm("")
    setFilteredInfluencers(influencers)
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Find Influencers</h1>
          <p className="text-gray-600">Discover the perfect influencers for your campaign</p>
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
              placeholder="Search by name, niche, or keywords"
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
            <h2 className="text-lg font-semibold mb-4">Filter Influencers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niche</label>
                <div className="flex flex-wrap gap-2">
                  {["Fashion", "Beauty", "Fitness", "Travel", "Food", "Technology", "Gaming", "Lifestyle"].map(
                    (niche) => (
                      <label key={niche} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                          checked={filters.niche.includes(niche)}
                          onChange={() => handleNicheChange(niche)}
                        />
                        <span className="ml-2">{niche}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      name="minFollowers"
                      className="input-field"
                      placeholder="Min"
                      value={filters.minFollowers}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="maxFollowers"
                      className="input-field"
                      placeholder="Max"
                      value={filters.maxFollowers}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Engagement Rate (%)</label>
                <input
                  type="number"
                  name="minEngagementRate"
                  className="input-field"
                  placeholder="e.g. 2.5"
                  value={filters.minEngagementRate}
                  onChange={handleFilterChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  className="input-field"
                  placeholder="e.g. New York"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInfluencers.length === 0 ? (
          <div className="col-span-full card text-center py-8">
            <p className="text-gray-600 mb-4">No influencers found matching your criteria.</p>
            <button className="btn-primary" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredInfluencers.map((influencer) => (
            <div key={influencer.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg">{influencer.name}</h3>
                    {influencer.isVerified && (
                      <div className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{influencer.niche}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{influencer.bio}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Followers</p>
                  <p className="font-semibold">{influencer.followers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="font-semibold">{influencer.engagementRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{influencer.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-semibold">{influencer.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full" onClick={() => navigate(`/influencer/${influencer.id}`)}>
                View Profile
              </button>
              <button
                className="btn-secondary w-full mt-2"
                onClick={() => navigate(`/brand/influencer-analytics/${influencer.id}`)}
              >
                View Analytics
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SearchInfluencers
