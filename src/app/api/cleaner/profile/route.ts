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

    const cleanerProfile = await db.cleanerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
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

    if (!cleanerProfile) {
      return NextResponse.json(
        { error: "Cleaner profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(cleanerProfile)

  } catch (error) {
    console.error("Cleaner profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "CLEANER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { bio, experience, isAvailable } = await req.json()

    const updatedProfile = await db.cleanerProfile.update({
      where: { userId: session.user.id },
      data: {
        bio: bio || null,
        experience: experience ? parseInt(experience) : null,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      },
      include: {
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
      message: "Profile updated successfully",
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Cleaner profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}