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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  Calendar, 
  Star, 
  DollarSign, 
  TrendingUp,
  Search,
  Filter,
  UserPlus,
  Settings,
  LogOut
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  cleanerProfile?: {
    rating: number
    experience?: number
    isAvailable: boolean
  }
}

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
    email: string
  }
  cleaner?: {
    name: string
    email: string
  }
  createdAt: string
}

interface Service {
  id: string
  name: string
  description: string
  basePrice: number
  duration: number
  category: string
  isActive: boolean
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

const roleColors = {
  CUSTOMER: "bg-blue-100 text-blue-800",
  CLEANER: "bg-green-100 text-green-800",
  ADMIN: "bg-purple-100 text-purple-800"
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCleaners: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchAdminData()
  }, [session, router])

  const fetchAdminData = async () => {
    try {
      const [usersRes, bookingsRes, servicesRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/services"),
        fetch("/api/admin/stats")
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      setError("Failed to fetch admin data")
    } finally {
      setLoading(false)
    }
  }

  const assignCleaner = async (bookingId: string, cleanerId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cleanerId })
      })

      if (response.ok) {
        fetchAdminData()
      } else {
        setError("Failed to assign cleaner")
      }
    } catch (error) {
      setError("An error occurred while assigning cleaner")
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        fetchAdminData()
      } else {
        setError("Failed to update service status")
      }
    } catch (error) {
      setError("An error occurred while updating service status")
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
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
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default">Admin</Badge>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="cleaners">Cleaners</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cleaners</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCleaners}</div>
                  <p className="text-xs text-muted-foreground">Active cleaners</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{stats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">Need assignment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedBookings}</div>
                  <p className="text-xs text-muted-foreground">Successfully done</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{booking.service.name}</h4>
                              <Badge className={statusColors[booking.status as keyof typeof statusColors]} variant="secondary">
                                {statusLabels[booking.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{booking.user.name} - {booking.city}</p>
                          </div>
                          <span className="text-sm font-bold text-blue-600">₵{booking.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Users</CardTitle>
                  <CardDescription>Recently registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-gray-500">No users yet</p>
                  ) : (
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{user.name}</h4>
                              <Badge className={roleColors[user.role as keyof typeof roleColors]} variant="secondary">
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage and monitor all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cleaner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">{booking.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-gray-600">{booking.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.service.name}</p>
                            <p className="text-sm text-gray-600">{booking.city}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{new Date(booking.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{booking.timeSlot}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                            {statusLabels[booking.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.cleaner ? (
                            <p className="text-sm">{booking.cleaner.name}</p>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="font-bold">₵{booking.totalPrice}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!booking.cleaner && booking.status === "PENDING" && (
                              <Select onValueChange={(cleanerId) => assignCleaner(booking.id, cleanerId)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users.filter(u => u.role === "CLEANER").map((cleaner) => (
                                    <SelectItem key={cleaner.id} value={cleaner.id}>
                                      {cleaner.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Link href={`/booking/${booking.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.role === "CLEANER" && (
                              <Link href={`/cleaner-dashboard`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            )}
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
                <CardDescription>Manage cleaning services and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category.replace('_', ' ')}</TableCell>
                        <TableCell className="font-bold">₵{service.basePrice}</TableCell>
                        <TableCell>{Math.floor(service.duration / 60)}h {service.duration % 60}m</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleServiceStatus(service.id, !service.isActive)}
                            >
                              {service.isActive ? "Disable" : "Enable"}
                            </Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleaners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cleaner Management</CardTitle>
                <CardDescription>Manage cleaner profiles and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.role === "CLEANER").map((cleaner) => (
                    <Card key={cleaner.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {cleaner.name}
                          <Badge variant={cleaner.cleanerProfile?.isAvailable ? "default" : "secondary"}>
                            {cleaner.cleanerProfile?.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{cleaner.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-600">★</span>
                              <span className="text-sm">{cleaner.cleanerProfile?.rating?.toFixed(1) || "N/A"}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Experience:</span>
                            <span className="text-sm">{cleaner.cleanerProfile?.experience || "N/A"} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Phone:</span>
                            <span className="text-sm">{cleaner.phone || "N/A"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link href={`/cleaner-dashboard`}>
                            <Button variant="outline" size="sm" className="flex-1">
                              View Dashboard
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}