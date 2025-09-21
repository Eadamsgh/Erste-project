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
    
    if (!session || session.user?.role !== "CLEANER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bookingId = params.id
    const { status } = await req.json()

    // Check if the booking belongs to this cleaner
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { cleaner: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    if (booking.cleanerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this booking" },
        { status: 403 }
      )
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["CONFIRMED", "CANCELLED"],
      "CONFIRMED": ["IN_PROGRESS", "CANCELLED"],
      "IN_PROGRESS": ["COMPLETED", "NO_SHOW"],
      "COMPLETED": [],
      "CANCELLED": [],
      "NO_SHOW": []
    }

    const currentStatus = booking.status
    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
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
            phone: true
          }
        }
      }
    })

    // Emit real-time update via WebSocket
    if (global.io) {
      global.io.to(`booking-${bookingId}`).emit("booking-status-update", {
        bookingId,
        status,
        message: `Booking status updated to ${status}`
      })
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