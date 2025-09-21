"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Booking {
  id: string
  service: {
    name: string
    description: string
    category: string
  }
  address: string
  city: string
  date: string
  timeSlot: string
  status: string
  totalPrice: number
  notes?: string
  cleaner?: {
    id: string
    name: string
    email: string
    phone: string
    cleanerProfile?: {
      rating: number
      experience?: number
    }
  }
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800"
}

const statusLabels = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show"
}

export default function MyBookings() {
  const { data: session } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchBookings()
  }, [session, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setError("Failed to fetch bookings")
      }
    } catch (error) {
      setError("An error occurred while fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PUT"
      })
      
      if (response.ok) {
        fetchBookings() // Refresh the bookings list
      } else {
        setError("Failed to cancel booking")
      }
    } catch (error) {
      setError("An error occurred while cancelling the booking")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <img
                  src="/osucleen-logo.png"
                  alt="OsuCleen"
                  className="h-10 w-auto"
                />
              </Link>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">My Bookings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/book-service">
                <Button>Book New Service</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h2>
          <p className="text-gray-600">Manage your cleaning service bookings</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
              <Link href="/book-service">
                <Button>Book Your First Service</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.service.name}</CardTitle>
                    <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                      {statusLabels[booking.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <CardDescription>{booking.service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Date & Time:</span>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-sm text-gray-600">
                        {booking.address}, {booking.city}
                      </p>
                    </div>
                    
                    {booking.cleaner && (
                      <div>
                        <span className="font-medium">Cleaner:</span>
                        <p className="text-sm text-gray-600">
                          {booking.cleaner.name}
                          {booking.cleaner.cleanerProfile?.rating && (
                            <span className="ml-2 text-yellow-600">
                              ★ {booking.cleaner.cleanerProfile.rating.toFixed(1)}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {booking.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-lg font-bold text-blue-600">₵{booking.totalPrice}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3">
                      {booking.status === "PENDING" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => cancelBooking(booking.id)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      )}
                      
                      {booking.status === "COMPLETED" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          Rate Service
                        </Button>
                      )}
                      
                      <Link href={`/booking/${booking.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          Track Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}