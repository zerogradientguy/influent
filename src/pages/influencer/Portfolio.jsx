"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Briefcase, Plus, Trash2, Edit, AlertCircle, ExternalLink, ImageIcon } from "lucide-react"

const InfluencerPortfolio = ({ user }) => {
  const [portfolioItems, setPortfolioItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isEditingItem, setIsEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "",
    url: "",
    image: null,
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "influencer") {
      navigate("/brand/dashboard")
      return
    }

    fetchPortfolioItems()
  }, [user, navigate])

  const fetchPortfolioItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/influencer/portfolio", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio items")
      }

      const data = await response.json()
      setPortfolioItems(data.portfolioItems)
    } catch (error) {
      setError("Failed to load portfolio items")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      platform: "",
      url: "",
      image: null,
    })
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("platform", formData.platform)
      formDataToSend.append("url", formData.url)

      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      let url = "http://localhost:5000/api/influencer/portfolio"
      let method = "POST"

      if (isEditingItem) {
        url = `http://localhost:5000/api/influencer/portfolio/${isEditingItem}`
        method = "PUT"
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to save portfolio item")
      }

      // Refresh portfolio items
      await fetchPortfolioItems()

      // Reset form and state
      resetForm()
      setIsAddingItem(false)
      setIsEditingItem(null)
    } catch (error) {
      setError(error.message || "An error occurred while saving the portfolio item")
      console.error(error)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      platform: item.platform,
      url: item.url,
      image: null,
    })

    if (item.image_url) {
      setPreviewUrl(`http://localhost:5000/uploads/${item.image_url}`)
    } else {
      setPreviewUrl(null)
    }

    setIsEditingItem(item.id)
    setIsAddingItem(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/influencer/portfolio/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete portfolio item")
      }

      // Refresh portfolio items
      await fetchPortfolioItems()
    } catch (error) {
      setError(error.message || "An error occurred while deleting the portfolio item")
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Briefcase className="mr-2 h-6 w-6" />
            My Portfolio
          </h1>
          {!isAddingItem && (
            <button
              onClick={() => {
                resetForm()
                setIsAddingItem(true)
                setIsEditingItem(null)
              }}
              className="btn-primary flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Portfolio Item
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isAddingItem ? (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isEditingItem ? "Edit Portfolio Item" : "Add New Portfolio Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input-field"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Platform *
                </label>
                <select
                  id="platform"
                  name="platform"
                  required
                  className="input-field"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  <option value="">Select Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  required
                  className="input-field"
                  placeholder="https://example.com/your-content"
                  value={formData.url}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="input-field"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="h-40 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    resetForm()
                    setIsAddingItem(false)
                    setIsEditingItem(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditingItem ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {portfolioItems.length === 0 && !isAddingItem ? (
          <div className="card text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't added any portfolio items yet.</p>
            <button
              onClick={() => {
                resetForm()
                setIsAddingItem(true)
              }}
              className="btn-primary inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Portfolio Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <div key={item.id} className="card hover:shadow-lg transition-shadow">
                <div className="relative">
                  {item.image_url ? (
                    <img
                      src={`http://localhost:5000/uploads/${item.image_url}`}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 bg-white rounded-full shadow-md text-gray-700 hover:text-emerald-600 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-white rounded-full shadow-md text-gray-700 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-emerald-600 mb-2">{item.platform}</p>
                  {item.description && <p className="text-gray-600 text-sm mb-3">{item.description}</p>}
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
  )
}

export default InfluencerPortfolio
