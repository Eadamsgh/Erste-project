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
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const serviceId = params.id
    const { isActive } = await req.json()

    const updatedService = await db.service.update({
      where: { id: serviceId },
      data: { isActive }
    })

    return NextResponse.json({
      message: "Service status updated successfully",
      service: updatedService
    })

  } catch (error) {
    console.error("Service toggle error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}