"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Calendar, 
  Star, 
  Clock, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface Booking {
  id: string
  service: {
    name: string
    category: string
  }
  address: string
  city: string
  date: string
  timeSlot: string
  status: string
  totalPrice: number
  user: {
    name: string
    phone: string
  }
}

interface CleanerProfile {
  id: string
  bio?: string
  experience?: number
  rating: number
  isAvailable: boolean
  user: {
    name: string
    email: string
    phone: string
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

export default function CleanerDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cleanerProfile, setCleanerProfile] = useState<CleanerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [profileForm, setProfileForm] = useState({
    bio: "",
    experience: "",
    isAvailable: true
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check if user is a cleaner
    if (session.user?.role !== "CLEANER") {
      router.push("/dashboard")
      return
    }

    fetchCleanerData()
  }, [session, router])

  const fetchCleanerData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        fetch("/api/cleaner/bookings"),
        fetch("/api/cleaner/profile")
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setCleanerProfile(profileData)
        setProfileForm({
          bio: profileData.bio || "",
          experience: profileData.experience?.toString() || "",
          isAvailable: profileData.isAvailable
        })
      }
    } catch (error) {
      setError("Failed to fetch cleaner data")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/cleaner/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bio: profileForm.bio,
          experience: profileForm.experience ? parseInt(profileForm.experience) : null,
          isAvailable: profileForm.isAvailable
        })
      })

      if (response.ok) {
        fetchCleanerData()
        setError("")
      } else {
        setError("Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred while updating profile")
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/cleaner/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchCleanerData()
      } else {
        setError("Failed to update booking status")
      }
    } catch (error) {
      setError("An error occurred while updating booking status")
    }
  }

  const getStats = () => {
    const pending = bookings.filter(b => b.status === "PENDING").length
    const confirmed = bookings.filter(b => b.status === "CONFIRMED").length
    const inProgress = bookings.filter(b => b.status === "IN_PROGRESS").length
    const completed = bookings.filter(b => b.status === "COMPLETED").length
    
    return { pending, confirmed, inProgress, completed }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading cleaner dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "CLEANER") {
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
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Cleaner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={cleanerProfile?.isAvailable ? "default" : "secondary"}>
                {cleanerProfile?.isAvailable ? "Available" : "Unavailable"}
              </Badge>
              <Link href="/dashboard">
                <Button variant="outline">Main Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.confirmed}</div>
                  <p className="text-xs text-muted-foreground">Ready to start</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Currently working</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">Jobs finished</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest cleaning jobs</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-500">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{booking.service.name}</h3>
                            <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                              {statusLabels[booking.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {booking.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {booking.city}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">₵{booking.totalPrice}</span>
                          <Link href={`/booking/${booking.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage your cleaning assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-500">No bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">{booking.service.name}</h3>
                              <p className="text-sm text-gray-600">{booking.service.category.replace('_', ' ')}</p>
                            </div>
                            <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                              {statusLabels[booking.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{booking.timeSlot}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="text-sm">{booking.user.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">{booking.user.phone}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">{booking.address}, {booking.city}</p>
                              <p className="font-bold text-blue-600">₵{booking.totalPrice}</p>
                            </div>
                            <div className="flex gap-2">
                              {booking.status === "PENDING" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                                  >
                                    Decline
                                  </Button>
                                </>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, "IN_PROGRESS")}
                                >
                                  Start Job
                                </Button>
                              )}
                              {booking.status === "IN_PROGRESS" && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                                >
                                  Complete
                                </Button>
                              )}
                              <Link href={`/booking/${booking.id}`}>
                                <Button variant="outline" size="sm">Details</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cleaner Profile</CardTitle>
                <CardDescription>Manage your professional profile and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell customers about yourself, your experience, and the services you offer..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={profileForm.experience}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="Number of years"
                        min="0"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="available"
                        checked={profileForm.isAvailable}
                        onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, isAvailable: checked }))}
                      />
                      <Label htmlFor="available">Available for new bookings</Label>
                    </div>
                  </div>
                  
                  <Button type="submit">Update Profile</Button>
                </form>
              </CardContent>
            </Card>

            {cleanerProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-gray-600">{cleanerProfile.user.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600">{cleanerProfile.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-gray-600">{cleanerProfile.user.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-600">★</span>
                        <span className="text-sm text-gray-600">{cleanerProfile.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {cleanerProfile.experience && (
                    <div>
                      <Label className="text-sm font-medium">Experience</Label>
                      <p className="text-sm text-gray-600">{cleanerProfile.experience} years</p>
                    </div>
                  )}
                  
                  {cleanerProfile.bio && (
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-sm text-gray-600">{cleanerProfile.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}