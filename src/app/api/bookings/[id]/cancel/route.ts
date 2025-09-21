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

    // Check if the booking belongs to the current user
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

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to cancel this booking" },
        { status: 403 }
      )
    }

    // Check if booking can be cancelled (only PENDING or CONFIRMED bookings can be cancelled)
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "This booking cannot be cancelled" },
        { status: 400 }
      )
    }

    // Update booking status to CANCELLED
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
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
      message: "Booking cancelled successfully",
      booking: updatedBooking
    })

  } catch (error) {
    console.error("Booking cancellation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}