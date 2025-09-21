import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bookingId = params.id
    const { cleanerId } = await req.json()

    // Check if user is admin or the booking belongs to them
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Only admins can assign cleaners, or users can request assignment
    if (session.user.role !== "ADMIN" && booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to assign cleaner to this booking" },
        { status: 403 }
      )
    }

    // Check if cleaner exists and is available
    const cleaner = await db.user.findUnique({
      where: { id: cleanerId },
      include: { cleanerProfile: true }
    })

    if (!cleaner || cleaner.role !== "CLEANER") {
      return NextResponse.json(
        { error: "Cleaner not found" },
        { status: 404 }
      )
    }

    if (!cleaner.cleanerProfile?.isAvailable) {
      return NextResponse.json(
        { error: "Cleaner is not available" },
        { status: 400 }
      )
    }

    // Assign cleaner to booking
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { 
        cleanerId,
        status: "CONFIRMED" // Auto-confirm when cleaner is assigned
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
        },
        cleaner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cleanerProfile: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Cleaner assigned successfully",
      booking: updatedBooking
    })

  } catch (error) {
    console.error("Cleaner assignment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}