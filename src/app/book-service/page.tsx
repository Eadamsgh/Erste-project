"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface Service {
  id: string
  name: string
  description: string
  basePrice: number
  duration: number
  category: string
}

const services: Service[] = [
  {
    id: "1",
    name: "Home Cleaning",
    description: "Regular home cleaning for all living spaces",
    basePrice: 80,
    duration: 180,
    category: "HOME_CLEANING"
  },
  {
    id: "2",
    name: "Deep Cleaning",
    description: "Thorough cleaning including hard-to-reach areas",
    basePrice: 150,
    duration: 300,
    category: "DEEP_CLEANING"
  },
  {
    id: "3",
    name: "Office Cleaning",
    description: "Professional cleaning for commercial spaces",
    basePrice: 120,
    duration: 240,
    category: "OFFICE_CLEANING"
  },
  {
    id: "4",
    name: "Carpet Cleaning",
    description: "Deep carpet and upholstery cleaning",
    basePrice: 100,
    duration: 180,
    category: "CARPET_CLEANING"
  },
  {
    id: "5",
    name: "Window Cleaning",
    description: "Crystal clear window cleaning service",
    basePrice: 60,
    duration: 120,
    category: "WINDOW_CLEANING"
  },
  {
    id: "6",
    name: "Laundry Service",
    description: "Wash, dry, and fold laundry service",
    basePrice: 50,
    duration: 1440,
    category: "LAUNDRY_SERVICE"
  }
]

const timeSlots = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00"
]

const cities = [
  "Accra",
  "Kumasi",
  "Tamale",
  "Takoradi",
  "Cape Coast",
  "Tema",
  "Ashaiman",
  "Madina"
]

export default function BookService() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    setSelectedService(service || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!selectedService || !selectedDate || !selectedTimeSlot || !formData.address || !formData.city) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate.toISOString(),
          timeSlot: selectedTimeSlot,
          address: formData.address,
          city: formData.city,
          notes: formData.notes,
          totalPrice: selectedService.basePrice
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Booking created successfully!")
        setTimeout(() => {
          router.push("/my-bookings")
        }, 2000)
      } else {
        setError(data.error || "Failed to create booking")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to book a service.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
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
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Book Service</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select a Service</CardTitle>
                <CardDescription>Choose the cleaning service you need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?.id === service.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleServiceSelect(service.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="secondary">{service.category.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">₵{service.basePrice}</span>
                        <span className="text-sm text-gray-500">{Math.floor(service.duration / 60)}h {service.duration % 60}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            {selectedService && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Fill in your booking information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <Label htmlFor="date">Select Date</Label>
                      <div className="mt-2">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <Label htmlFor="timeSlot">Select Time Slot</Label>
                      <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Selection */}
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Address */}
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your full address"
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special instructions or notes for the cleaner"
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating Booking..." : "Confirm Booking"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your booking details</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedService ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{selectedService.name}</h3>
                      <p className="text-sm text-gray-600">{selectedService.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Service Price:</span>
                        <span className="font-medium">₵{selectedService.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="font-medium">{Math.floor(selectedService.duration / 60)}h {selectedService.duration % 60}m</span>
                      </div>
                      {selectedDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date:</span>
                          <span className="font-medium">{format(selectedDate, 'PPP')}</span>
                        </div>
                      )}
                      {selectedTimeSlot && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="font-medium">{selectedTimeSlot}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold text-blue-600">₵{selectedService.basePrice}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Select a service to see the booking summary</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}