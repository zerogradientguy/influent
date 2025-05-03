"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Upload, AlertCircle, ArrowLeft, CheckCircle, X, FileText } from "lucide-react"

const ContentSubmission = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [campaignInfluencer, setCampaignInfluencer] = useState(null)
  const [contentItems, setContentItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    platform: "",
    contentType: "",
    url: "",
    description: "",
    files: [],
  })
  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "influencer") {
      navigate("/brand/dashboard")
      return
    }

    const fetchData = async () => {
      try {
        const [campaignRes, contentRes] = await Promise.all([
          fetch(`http://localhost:5000/api/campaigns/${id}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:5000/api/campaigns/${id}/content`, {
            credentials: "include",
          }),
        ])

        if (!campaignRes.ok || !contentRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const campaignData = await campaignRes.json()
        const contentData = await contentRes.json()

        setCampaign(campaignData.campaign)
        setCampaignInfluencer(campaignData.campaignInfluencer)
        setContentItems(contentData.contentItems)
      } catch (error) {
        setError("Failed to load campaign data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...files] }))

    // Create preview URLs for the files
    const newPreviewUrls = files.map((file) => {
      if (file.type.startsWith("image/")) {
        return { type: "image", url: URL.createObjectURL(file) }
      } else {
        return { type: "file", name: file.name, size: file.size }
      }
    })

    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormData({
      platform: "",
      contentType: "",
      url: "",
      description: "",
      files: [],
    })
    setPreviewUrls([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setSuccess("")
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.platform || !formData.contentType || (!formData.url && formData.files.length === 0)) {
      setError("Please fill in all required fields and provide either a URL or upload files")
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("platform", formData.platform)
      formDataToSend.append("contentType", formData.contentType)
      formDataToSend.append("url", formData.url)
      formDataToSend.append("description", formData.description)

      formData.files.forEach((file) => {
        formDataToSend.append("files", file)
      })

      const response = await fetch(`http://localhost:5000/api/campaigns/${id}/content`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to submit content")
      }

      const data = await response.json()
      setContentItems((prev) => [...prev, data.contentItem])
      setSuccess("Content submitted successfully!")
      resetForm()
    } catch (error) {
      setError(error.message || "An error occurred while submitting content")
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

  if (!campaign || !campaignInfluencer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">Campaign not found or you are not approved for this campaign.</p>
            <Link to="/influencer/campaigns" className="btn-primary">
              Back to My Campaigns
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (campaignInfluencer.status !== "approved") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">You need to be approved for this campaign before submitting content.</p>
            <Link to="/influencer/campaigns" className="btn-primary">
              Back to My Campaigns
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to={`/campaign/${id}`} className="mr-3 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Submit Content for {campaign.name}</h1>
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
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Campaign Requirements</h2>
          <p className="text-gray-700 whitespace-pre-line">{campaign.requirements}</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit New Content</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type *
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  required
                  className="input-field"
                  value={formData.contentType}
                  onChange={handleChange}
                >
                  <option value="">Select Content Type</option>
                  <option value="post">Post</option>
                  <option value="story">Story</option>
                  <option value="reel">Reel</option>
                  <option value="video">Video</option>
                  <option value="tweet">Tweet</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Content URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                className="input-field"
                placeholder="https://example.com/your-content"
                value={formData.url}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Provide a link to your content (e.g., Instagram post URL)</p>
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
                placeholder="Describe your content and how it meets the campaign requirements..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                multiple
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload screenshots, images, or other files related to your content
              </p>
            </div>

            {previewUrls.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative">
                    {preview.type === "image" ? (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                        <img
                          src={preview.url || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex items-center bg-gray-100 p-2 rounded-md">
                        <FileText size={16} className="mr-2" />
                        <span className="text-sm truncate max-w-[120px]">{preview.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" className="btn-primary flex items-center">
                <Upload size={18} className="mr-2" />
                Submit Content
              </button>
            </div>
          </form>
        </div>

        {contentItems.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Submitted Content</h2>
            <div className="space-y-4">
              {contentItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-emerald-600 mr-2">
                          {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 inline-block"
                        >
                          View Content
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {item.files && item.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.files.map((file, index) => (
                        <a
                          key={index}
                          href={`http://localhost:5000/uploads/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {file.mimeType.startsWith("image/") ? (
                            <img
                              src={`http://localhost:5000/uploads/${file.path}`}
                              alt="Content"
                              className="h-20 w-20 object-cover rounded-md border border-gray-200"
                            />
                          ) : (
                            <div className="flex items-center bg-gray-100 p-2 rounded-md">
                              <FileText size={16} className="mr-2" />
                              <span className="text-sm truncate max-w-[120px]">{file.originalName}</span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentSubmission
