import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all counts
    const [totalUsers, totalCleaners, totalBookings, pendingBookings, completedBookings] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "CLEANER" } }),
      db.booking.count(),
      db.booking.count({ where: { status: "PENDING" } }),
      db.booking.count({ where: { status: "COMPLETED" } })
    ])

    // Get total revenue from completed bookings
    const completedBookingData = await db.booking.findMany({
      where: { status: "COMPLETED" },
      select: { totalPrice: true }
    })

    const totalRevenue = completedBookingData.reduce((sum, booking) => sum + booking.totalPrice, 0)

    const stats = {
      totalUsers,
      totalCleaners,
      totalBookings,
      totalRevenue,
      pendingBookings,
      completedBookings
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}