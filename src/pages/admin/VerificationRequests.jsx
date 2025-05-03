"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, AlertCircle, Eye } from 'lucide-react'
import AdminSidebar from "./components/AdminSidebar"

const VerificationRequests = ({ user }) => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/check-admin", {
          credentials: "include",
        })
        const data = await response.json()

        if (!data.isAdmin) {
          navigate("/login")
        } else {
          // Fetch verification requests
          fetchVerificationRequests(activeTab)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/login")
      }
    }

    checkAdmin()
  }, [activeTab, navigate])

  const fetchVerificationRequests = async (status) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/verification-requests?status=${status}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch verification requests")
      }

      const data = await response.json()
      setRequests(data.verificationRequests)
    } catch (error) {
      setError("Failed to load verification requests")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setAdminNotes("")
  }

  const handleCloseModal = () => {
    setSelectedRequest(null)
    setAdminNotes("")
  }

  const handleApprove = async () => {
    await processRequest("approve")
  }

  const handleReject = async () => {
    await processRequest("reject")
  }

  const processRequest = async (action) => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/verification-requests/${selectedRequest.id}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes }),
          credentials: "include",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to ${action} verification request`)
      }

      // Refresh the list
      fetchVerificationRequests(activeTab)
      setSelectedRequest(null)
    } catch (error) {
      setError(error.message || `An error occurred while ${action}ing the request`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activePage="verification" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-emerald-600 mr-3" />
          <h1 className="text-2xl font-bold">Verification Requests</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === "pending"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("pending")}
              >
                Pending
              </button>
              <button
                className={`${
                  activeTab === "approved"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("approved")}
              >
                Approved
              </button>
              <button
                className={`${
                  activeTab === "rejected"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange("rejected")}
              >
                Rejected
              </button>
            </nav>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="card text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No {activeTab} verification requests found.</p>
            <p className="text-gray-500 text-sm">
              {activeTab === "pending"
                ? "All verification requests have been processed."
                : `No ${activeTab} verification requests at this time.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Influencer</th>
                  <th className="py-3 px-4 text-left">Full Name</th>
                  <th className="py-3 px-4 text-left">Submitted</th>
                  <th className="py-3 px-4 text-left">Social Media</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{request.influencerName}</td>
                    <td className="py-3 px-4">{request.fullName}</td>
                    <td className="py-3 px-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {request.socialMediaLinks?.instagram && (
                          <a
                            href={request.socialMediaLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800"
                            title="Instagram"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                        {request.socialMediaLinks?.tiktok && (
                          <a
                            href={request.socialMediaLinks.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:text-gray-800"
                            title="TikTok"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M9 4.5a5 5 0 1 0 5 8.5v-5a1.5 1.5 0 0 1 1.5-1.5H17v-2h-1.5A1.5 1.5 0 0 1 14 3V1h-2v3.5a5 5 0 0 0-3 4.5v4a2.5 2.5 0 0 1-5 0V10H2v3a4.5 4.5 0 1 0 9 0v-5a7 7 0 0 0 7 7h2v-2h-2a5 5 0 0 1-5-5V4.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="text-emerald-600 hover:text-emerald-800 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for viewing request details */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Verification Request Details</h2>
                  <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Influencer Information</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Username:</span> {selectedRequest.influencerName}
                      </p>
                      <p>
                        <span className="font-medium">Full Name:</span> {selectedRequest.fullName}
                      </p>
                      <p>
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Social Media Profiles</h3>
                    <div className="space-y-2">
                      {selectedRequest.socialMediaLinks?.instagram && (
                        <p>
                          <span className="font-medium">Instagram:</span>{" "}
                          <a
                            href={selectedRequest.socialMediaLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            {selectedRequest.socialMediaLinks.instagram}
                          </a>
                        </p>
                      )}
                      {selectedRequest.socialMediaLinks?.tiktok && (
                        <p>
                          <span className="font-medium">TikTok:</span>{" "}
                          <a
                            href={selectedRequest.socialMediaLinks.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            {selectedRequest.socialMediaLinks.tiktok}
                          </a>
                        </p>
                      )}
                      {selectedRequest.socialMediaLinks?.youtube && (
                        <p>
                          <span className="font-medium">YouTube:</span>{" "}
                          <a
                            href={selectedRequest.socialMediaLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            {selectedRequest.socialMediaLinks.youtube}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Verification Information</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Additional Info:</span>
                      </p>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.additionalInfo || "None provided"}</p>
                      </div>
                    </div>

                    {selectedRequest.idDocumentPath && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">ID Document</h3>
                        <div className="border border-gray-200 rounded-md p-2">
                          <a 
                            href={`http://localhost:5000/uploads/${selectedRequest.idDocumentPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 flex items-center"
                          >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View ID Document
                          </a>
                        </div>
                      </div>
                    )}

                    {activeTab === "pending" && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Admin Notes</h3>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 h-24"
                          placeholder="Add notes about this verification request (optional)"
                        ></textarea>
                      </div>
                    )}

                    {(activeTab === "approved" || activeTab === "rejected") && selectedRequest.adminNotes && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Admin Notes</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.adminNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === "pending" && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Reject"}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Approve"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationRequests
