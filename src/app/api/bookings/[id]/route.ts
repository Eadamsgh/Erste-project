import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
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

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
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
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if the booking belongs to the current user
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to access this booking" },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)

  } catch (error) {
    console.error("Booking fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}