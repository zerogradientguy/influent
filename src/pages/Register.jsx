"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, AlertCircle, UserPlus, Building, User } from "lucide-react"

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate role selection
    if (!formData.role) {
      setError("Please select your role")
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      setUser(data.user)

      // Redirect based on user role
      if (data.user.role === "brand") {
        navigate("/brand/dashboard")
      } else {
        navigate("/influencer/dashboard")
      }
    } catch (error) {
      setError(error.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-2 bg-emerald-50 rounded-full">
              <img
                src="/logo.svg"
                alt="Influne Logo"
                className="h-12 w-12 transform transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start animate-fadeIn">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am registering as:</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  formData.role === "brand"
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500"
                    : "border-gray-300 hover:border-emerald-300"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, role: "brand" }))}
              >
                <input
                  id="role-brand"
                  name="role"
                  type="radio"
                  value="brand"
                  className="sr-only"
                  checked={formData.role === "brand"}
                  onChange={handleChange}
                />
                <div className="flex flex-col items-center">
                  <Building
                    className={`h-8 w-8 mb-2 ${formData.role === "brand" ? "text-emerald-600" : "text-gray-400"}`}
                  />
                  <label
                    htmlFor="role-brand"
                    className={`block text-sm font-medium ${formData.role === "brand" ? "text-emerald-700" : "text-gray-700"}`}
                  >
                    Brand
                  </label>
                  <p className="mt-1 text-xs text-gray-500">For companies and businesses</p>
                </div>
              </div>

              <div
                className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  formData.role === "influencer"
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500"
                    : "border-gray-300 hover:border-emerald-300"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, role: "influencer" }))}
              >
                <input
                  id="role-influencer"
                  name="role"
                  type="radio"
                  value="influencer"
                  className="sr-only"
                  checked={formData.role === "influencer"}
                  onChange={handleChange}
                />
                <div className="flex flex-col items-center">
                  <User
                    className={`h-8 w-8 mb-2 ${formData.role === "influencer" ? "text-emerald-600" : "text-gray-400"}`}
                  />
                  <label
                    htmlFor="role-influencer"
                    className={`block text-sm font-medium ${formData.role === "influencer" ? "text-emerald-700" : "text-gray-700"}`}
                  >
                    Influencer
                  </label>
                  <p className="mt-1 text-xs text-gray-500">For content creators</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 font-medium"
              disabled={isLoading}
            >
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create account
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          By signing up, you agree to our{" "}
          <a href="#" className="text-emerald-600 hover:text-emerald-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-emerald-600 hover:text-emerald-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
