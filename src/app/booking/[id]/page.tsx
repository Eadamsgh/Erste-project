"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, MapPin, User, Calendar, Phone } from "lucide-react"
import { io, Socket } from "socket.io-client"

interface Booking {
  id: string
  service: {
    name: string
    description: string
    category: string
    basePrice: number
    duration: number
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
      bio?: string
    }
  }
  payments?: Array<{
    id: string
    amount: number
    method: string
    status: string
    createdAt: string
  }>
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

const statusSteps = [
  { key: "PENDING", label: "Booking Confirmed", description: "Your booking has been received" },
  { key: "CONFIRMED", label: "Cleaner Assigned", description: "A professional cleaner has been assigned" },
  { key: "IN_PROGRESS", label: "Cleaning in Progress", description: "Your cleaner is on the way" },
  { key: "COMPLETED", label: "Service Completed", description: "Your space is now clean!" }
]

export default function BookingDetail() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchBooking()
    setupSocket()
    
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [session, router, params.id])

  const setupSocket = () => {
    const newSocket = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket")
      newSocket.emit("join-booking", params.id)
    })

    newSocket.on("booking-status-update", (data: { bookingId: string; status: string; message?: string }) => {
      if (data.bookingId === params.id) {
        fetchBooking() // Refresh booking data
        // Show notification
        if (data.message) {
          // You could use a toast notification here
          console.log("Status update:", data.message)
        }
      }
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket")
    })
  }

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      } else {
        setError("Failed to fetch booking details")
      }
    } catch (error) {
      setError("An error occurred while fetching booking details")
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}/cancel`, {
        method: "PUT"
      })
      
      if (response.ok) {
        fetchBooking()
      } else {
        setError("Failed to cancel booking")
      }
    } catch (error) {
      setError("An error occurred while cancelling the booking")
    }
  }

  const getCurrentStepIndex = (status: string) => {
    const stepIndex = statusSteps.findIndex(step => step.key === status)
    return stepIndex >= 0 ? stepIndex : 0
  }

  const getProgressPercentage = (status: string) => {
    const stepIndex = getCurrentStepIndex(status)
    return ((stepIndex + 1) / statusSteps.length) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!session || !booking) {
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
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Booking Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/my-bookings">
                <Button variant="outline">My Bookings</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Booking Status
                </CardTitle>
                <CardDescription>Track the progress of your cleaning service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status:</span>
                    <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                      {statusLabels[booking.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(getProgressPercentage(booking.status))}%</span>
                    </div>
                    <Progress value={getProgressPercentage(booking.status)} className="h-2" />
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const isCompleted = getCurrentStepIndex(booking.status) >= index
                      const isCurrent = getCurrentStepIndex(booking.status) === index
                      
                      return (
                        <div key={step.key} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-600"}`}>
                              {step.label}
                            </h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">{booking.service.name}</h3>
                    <p className="text-sm text-gray-600">{booking.service.description}</p>
                    <Badge variant="secondary" className="mt-2">
                      {booking.service.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="font-medium">{Math.floor(booking.service.duration / 60)}h {booking.service.duration % 60}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-medium">₵{booking.service.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="font-bold text-blue-600">₵{booking.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cleaner Information */}
            {booking.cleaner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Cleaner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{booking.cleaner.name}</h3>
                        {booking.cleaner.cleanerProfile?.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-600">★</span>
                            <span className="text-sm">{booking.cleaner.cleanerProfile.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Message
                        </Button>
                      </div>
                    </div>
                    
                    {booking.cleaner.cleanerProfile?.bio && (
                      <p className="text-sm text-gray-600">{booking.cleaner.cleanerProfile.bio}</p>
                    )}
                    
                    {booking.cleaner.cleanerProfile?.experience && (
                      <p className="text-sm text-gray-600">
                        {booking.cleaner.cleanerProfile.experience} years of experience
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">
                        {booking.address}, {booking.city}
                      </p>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div>
                      <p className="font-medium">Special Instructions</p>
                      <p className="text-sm text-gray-600">{booking.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">₵{booking.totalPrice}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {booking.status === "PENDING" && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={cancelBooking}
                    >
                      Cancel Booking
                    </Button>
                  )}
                  
                  {booking.status === "COMPLETED" && (
                    <Button className="w-full">
                      Rate Service
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    Download Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            {booking.payments && booking.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{payment.method.replace('_', ' ')}</span>
                        <Badge variant={payment.status === "COMPLETED" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">₵{payment.amount}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}