"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Send, ArrowLeft, User, AlertCircle, Paperclip, ImageIcon, X } from "lucide-react"

const Conversation = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [attachments, setAttachments] = useState([])
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    const fetchConversation = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations/${id}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch conversation")
        }

        const data = await response.json()
        setConversation(data.conversation)
        setMessages(data.messages)
      } catch (error) {
        setError("Failed to load conversation")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversation()

    // Set up polling for new messages
    const interval = setInterval(() => {
      fetchNewMessages()
    }, 5000)

    return () => clearInterval(interval)
  }, [id, user, navigate])

  const fetchNewMessages = async () => {
    if (!messages.length) return

    try {
      const lastMessageId = messages[messages.length - 1].id
      const response = await fetch(`http://localhost:5000/api/conversations/${id}/messages?after=${lastMessageId}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages])
        }
      }
    } catch (error) {
      console.error("Failed to fetch new messages:", error)
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && attachments.length === 0) || isSending) return

    setIsSending(true)
    try {
      const formData = new FormData()
      formData.append("content", newMessage)

      attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      const response = await fetch(`http://localhost:5000/api/conversations/${id}/messages`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, data.message])
      setNewMessage("")
      setAttachments([])
    } catch (error) {
      setError("Failed to send message")
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files])
    }
    // Reset file input
    e.target.value = ""
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">Conversation not found or you don't have access to it.</p>
            <Link to="/messages" className="btn-primary">
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-64px)] flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="card mb-4 py-3">
          <div className="flex items-center">
            <button onClick={() => navigate("/messages")} className="mr-3 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
              {conversation.otherUser.profileImage ? (
                <img
                  src={`http://localhost:5000/uploads/${conversation.otherUser.profileImage}`}
                  alt={conversation.otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                  <User size={20} />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{conversation.otherUser.name}</h2>
              <p className="text-xs text-gray-500">
                {conversation.otherUser.role === "brand" ? "Brand" : "Influencer"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 card p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === user.id
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isCurrentUser
                          ? "bg-emerald-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, index) => {
                            const isImage = attachment.mimeType.startsWith("image/")
                            return (
                              <div key={index}>
                                {isImage ? (
                                  <a
                                    href={`http://localhost:5000/uploads/${attachment.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={`http://localhost:5000/uploads/${attachment.path}`}
                                      alt="Attachment"
                                      className="max-h-40 rounded-md"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={`http://localhost:5000/uploads/${attachment.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center p-2 rounded-md ${
                                      isCurrentUser ? "bg-emerald-600" : "bg-gray-200"
                                    }`}
                                  >
                                    <Paperclip size={16} className="mr-2" />
                                    <span className="text-sm truncate">{attachment.originalName}</span>
                                  </a>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${isCurrentUser ? "text-emerald-100" : "text-gray-500"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith("image/") ? (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-300">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt="Attachment preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center bg-gray-100 p-2 rounded-md">
                    <Paperclip size={16} className="mr-2" />
                    <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                    <button onClick={() => removeAttachment(index)} className="ml-2 text-red-500 hover:text-red-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />
          <button
            type="button"
            onClick={triggerFileInput}
            className="p-2 text-gray-500 hover:text-emerald-600 focus:outline-none"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              fileInputRef.current.accept = "image/*"
              triggerFileInput()
            }}
            className="p-2 text-gray-500 hover:text-emerald-600 focus:outline-none"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
            disabled={isSending}
          />
          <button
            type="submit"
            className="btn-primary p-2 rounded-full"
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Conversation
