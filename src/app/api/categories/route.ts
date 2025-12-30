import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Category } from '@/lib/db/models/category.model'

// GET - Get all active categories
export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find({ isActive: true })
      .select('_id name slug icon')
      .sort({ order: 1, name: 1 })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
