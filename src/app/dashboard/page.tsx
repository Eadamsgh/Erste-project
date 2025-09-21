"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img
                src="/osucleen-logo.png"
                alt="OsuCleen"
                className="h-12 w-auto"
              />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
              <Badge variant="secondary">{session.user?.role}</Badge>
              <Button 
                variant="outline" 
                onClick={() => router.push("/api/auth/signout")}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {session.user?.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {session.user?.email}
                  </div>
                  {session.user?.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {session.user?.phone}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Role:</span> {session.user?.role}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => router.push("/book-service")}>
                    Book a Cleaning Service
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/my-bookings")}>
                    View My Bookings
                  </Button>
                  {session.user?.role === "CLEANER" && (
                    <Button variant="outline" className="w-full" onClick={() => router.push("/cleaner-dashboard")}>
                      Cleaner Dashboard
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">No recent activity</p>
                  <Button variant="link" className="p-0 h-auto text-sm">
                    View all activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role-specific Content */}
          <div className="mt-8">
            {session.user?.role === "CUSTOMER" && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Dashboard</CardTitle>
                  <CardDescription>Manage your cleaning services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">0</h3>
                      <p className="text-sm text-blue-700">Active Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900">0</h3>
                      <p className="text-sm text-green-700">Completed Services</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-900">₵0</h3>
                      <p className="text-sm text-purple-700">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {session.user?.role === "CLEANER" && (
              <Card>
                <CardHeader>
                  <CardTitle>Cleaner Dashboard</CardTitle>
                  <CardDescription>Manage your cleaning services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">0</h3>
                      <p className="text-sm text-blue-700">Pending Jobs</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900">0</h3>
                      <p className="text-sm text-green-700">Completed Jobs</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-900">0.0</h3>
                      <p className="text-sm text-purple-700">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}