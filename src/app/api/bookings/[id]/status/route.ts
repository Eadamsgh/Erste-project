import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServer } from "http"

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
    const { status, message } = await req.json()

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Check if booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        cleaner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to update this booking
    // Only the assigned cleaner, the booking owner (for cancellation), or admin can update
    const canUpdate = 
      session.user.role === "ADMIN" ||
      (session.user.role === "CLEANER" && booking.cleanerId === session.user.id) ||
      (session.user.id === booking.userId && status === "CANCELLED")

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Unauthorized to update this booking" },
        { status: 403 }
      )
    }

    // Update booking status
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
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

    // Emit WebSocket event for real-time updates
    try {
      const { io } = await import('@/lib/socket')
      const server = getServer()
      if (io) {
        io.to(`booking-${bookingId}`).emit('booking-status-update', {
          bookingId,
          status,
          message: message || `Booking status updated to ${status}`
        })
      }
    } catch (socketError) {
      console.error('WebSocket emit error:', socketError)
      // Don't fail the request if WebSocket fails
    }

    return NextResponse.json({
      message: "Booking status updated successfully",
      booking: updatedBooking
    })

  } catch (error) {
    console.error("Booking status update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}