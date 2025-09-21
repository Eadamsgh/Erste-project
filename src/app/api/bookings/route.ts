import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { serviceId, date, timeSlot, address, city, notes, totalPrice } = await req.json()

    if (!serviceId || !date || !timeSlot || !address || !city || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the service exists
    const service = await db.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        userId: session.user.id,
        serviceId,
        address,
        city,
        date: new Date(date),
        timeSlot,
        totalPrice,
        notes: notes || null,
        status: "PENDING"
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Booking created successfully",
      booking
    })

  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const userId = session.user.id

    const bookings = await db.booking.findMany({
      where: { userId },
      include: {
        service: true,
        cleaner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cleanerProfile: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(bookings)

  } catch (error) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}