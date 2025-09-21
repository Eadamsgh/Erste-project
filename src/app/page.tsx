import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Shield, Star, Users } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  const services = [
    {
      name: "Home Cleaning",
      description: "Regular home cleaning for all living spaces",
      price: "₵80",
      duration: "2-3 hours",
      category: "HOME_CLEANING"
    },
    {
      name: "Deep Cleaning",
      description: "Thorough cleaning including hard-to-reach areas",
      price: "₵150",
      duration: "4-5 hours",
      category: "DEEP_CLEANING"
    },
    {
      name: "Office Cleaning",
      description: "Professional cleaning for commercial spaces",
      price: "₵120",
      duration: "3-4 hours",
      category: "OFFICE_CLEANING"
    },
    {
      name: "Carpet Cleaning",
      description: "Deep carpet and upholstery cleaning",
      price: "₵100",
      duration: "2-3 hours",
      category: "CARPET_CLEANING"
    },
    {
      name: "Window Cleaning",
      description: "Crystal clear window cleaning service",
      price: "₵60",
      duration: "1-2 hours",
      category: "WINDOW_CLEANING"
    },
    {
      name: "Laundry Service",
      description: "Wash, dry, and fold laundry service",
      price: "₵50",
      duration: "1 day",
      category: "LAUNDRY_SERVICE"
    }
  ]

  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Trusted Cleaners",
      description: "All our cleaners are background checked and professionally trained"
    },
    {
      icon: <Clock className="h-6 w-6 text-green-600" />,
      title: "On-Time Service",
      description: "Punctual and reliable cleaning service at your convenience"
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      title: "Quality Guaranteed",
      description: "100% satisfaction guarantee on all cleaning services"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Easy Booking",
      description: "Simple online booking process with instant confirmation"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Choose Service",
      description: "Select from our range of professional cleaning services"
    },
    {
      step: "2", 
      title: "Pick Date & Time",
      description: "Choose a convenient date and time slot for your cleaning"
    },
    {
      step: "3",
      title: "Book & Pay",
      description: "Complete your booking with secure mobile money payment"
    },
    {
      step: "4",
      title: "Enjoy Clean Space",
      description: "Sit back and relax while our professionals clean your space"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
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
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Link href="/book-service">
                    <Button>Book Service</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <img
                src="/osucleen-logo.png"
                alt="OsuCleen Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Home Cleaning
            <span className="text-blue-600"> in Ghana</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book trusted, professional cleaners at your convenience. 
            Quality service guaranteed with secure mobile money payments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/book-service">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Book Cleaning Now
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/#services">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Cleaning Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional cleaning services tailored to your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <Badge variant="secondary">{service.category.replace('_', ' ')}</Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                    <span className="text-sm text-gray-500">{service.duration}</span>
                  </div>
                  {session ? (
                    <Link href="/book-service">
                      <Button className="w-full" variant="outline">
                        Book Service
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full" variant="outline">
                        Sign Up to Book
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose OsuCleen?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our professional cleaning service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your space sparkling clean in 4 easy steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready for a Cleaner Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers across Ghana
          </p>
          {session ? (
            <Link href="/book-service">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Book Your Cleaning Now
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}