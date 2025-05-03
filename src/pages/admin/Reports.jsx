"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, BarChart2, Download, Calendar, Filter } from 'lucide-react'
import AdminSidebar from "./components/AdminSidebar"

const AdminReports = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("users")
  const [timeRange, setTimeRange] = useState("month")
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState("")
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
          // Fetch initial report data
          fetchReportData(reportType, timeRange)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        navigate("/login")
      }
    }

    checkAdmin()
  }, [navigate])

  useEffect(() => {
    // Fetch report data when type or time range changes
    fetchReportData(reportType, timeRange)
  }, [reportType, timeRange])

  const fetchReportData = async (type, range) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports?type=${type}&range=${range}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch report data")
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      setError("Failed to load report data")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportTypeChange = (type) => {
    setReportType(type)
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/download?type=${reportType}&range=${timeRange}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to download report")
      }

      // Create a blob from the response
      const blob = await response.blob()
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${reportType}-report-${timeRange}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError("Failed to download report")
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activePage="reports" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-emerald-600 mr-3" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Report Settings</h2>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Report Type:</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-md ${
                    reportType === "users" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleReportTypeChange("users")}
                >
                  User Growth
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    reportType === "campaigns" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleReportTypeChange("campaigns")}
                >
                  Campaigns
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    reportType === "verifications" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleReportTypeChange("verifications")}
                >
                  Verifications
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Time Range:</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-md ${
                    timeRange === "week" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleTimeRangeChange("week")}
                >
                  Last Week
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    timeRange === "month" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleTimeRangeChange("month")}
                >
                  Last Month
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    timeRange === "year" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleTimeRangeChange("year")}
                >
                  Last Year
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {reportType === "users" && "User Growth Report"}
            {reportType === "campaigns" && "Campaign Performance Report"}
            {reportType === "verifications" && "Verification Status Report"}
          </h2>

          {reportData ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.summary.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    {stat.change !== undefined && (
                      <p className={`text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change >= 0 ? '+' : ''}{stat.change}% from previous period
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="border border-gray-200 rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would appear here</p>
                  <p className="text-sm text-gray-400">
                    (In a production environment, this would display a chart based on the report data)
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div>
                <h3 className="text-md font-medium mb-2">Detailed Data</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportData.columns.map((column, index) => (
                          <th 
                            key={index}
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No report data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReports
