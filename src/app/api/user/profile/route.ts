import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'

// GET - Fetch current user profile
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(session.user.id).select('-password')

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      odberCorbezId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      personalEmail: user.personalEmail,
      phoneNumber: user.phoneNumber,
      personalEmailVerified: user.personalEmailVerified,
      phoneVerified: user.phoneVerified,
      role: user.role,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update profile (including profile image as base64)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, profileImage, personalEmail, phoneNumber } = await request.json()

    await connectDB()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName

    // Handle personal email
    if (personalEmail !== undefined) {
      if (personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
        return NextResponse.json({ message: 'Invalid personal email format' }, { status: 400 })
      }
      // If email changed, mark as unverified
      if (personalEmail !== user.personalEmail) {
        user.personalEmail = personalEmail || undefined
        user.personalEmailVerified = false
      }
    }

    // Handle phone number
    if (phoneNumber !== undefined) {
      // Basic phone validation
      if (phoneNumber && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(phoneNumber)) {
        return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 })
      }
      // If phone changed, mark as unverified
      if (phoneNumber !== user.phoneNumber) {
        user.phoneNumber = phoneNumber || undefined
        user.phoneVerified = false
      }
    }

    // Handle profile image (base64 or URL)
    if (profileImage !== undefined) {
      // Validate image size (max 500KB for base64)
      if (profileImage && profileImage.startsWith('data:image')) {
        const base64Size = (profileImage.length * 3) / 4
        if (base64Size > 500 * 1024) {
          return NextResponse.json(
            { message: 'Image too large. Maximum size is 500KB' },
            { status: 400 }
          )
        }
      }
      user.profileImage = profileImage
    }

    await user.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        odberCorbezId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        personalEmail: user.personalEmail,
        phoneNumber: user.phoneNumber,
        personalEmailVerified: user.personalEmailVerified,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
