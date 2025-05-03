"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MessageSquare, Search, AlertCircle, User } from "lucide-react"

const Messages = ({ user }) => {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    const fetchConversations = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/conversations", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch conversations")
        }

        const data = await response.json()
        setConversations(data.conversations)
      } catch (error) {
        setError("Failed to load conversations")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [user, navigate])

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.lastMessage && conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <MessageSquare className="mr-2 h-6 w-6" />
          Messages
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="card text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have any conversations yet.</p>
            <p className="text-gray-500 text-sm">
              Start a conversation by messaging an influencer or brand from their profile.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">No conversations match your search.</p>
            <button className="btn-secondary mt-4" onClick={() => setSearchTerm("")}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/conversation/${conversation.id}`}
                className={`card flex items-start hover:shadow-md transition-shadow ${
                  conversation.unreadCount > 0 ? "border-l-4 border-emerald-500" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 mr-4 overflow-hidden">
                  {conversation.otherUser.profileImage ? (
                    <img
                      src={`http://localhost:5000/uploads/${conversation.otherUser.profileImage}`}
                      alt={conversation.otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">{conversation.otherUser.name}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(conversation.lastMessage?.timestamp || conversation.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm truncate mt-1">
                    {conversation.lastMessage ? conversation.lastMessage.content : "Start a conversation..."}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {conversation.otherUser.role === "brand" ? "Brand" : "Influencer"}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
