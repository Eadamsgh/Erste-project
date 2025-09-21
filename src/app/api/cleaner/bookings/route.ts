import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "CLEANER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bookings = await db.booking.findMany({
      where: { cleanerId: session.user.id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(bookings)

  } catch (error) {
    console.error("Cleaner bookings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}