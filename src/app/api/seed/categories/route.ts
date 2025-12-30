import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Category } from '@/lib/db/models/category.model'

const categories = [
  { name: 'American', slug: 'american', icon: '🍔', order: 1 },
  { name: 'Italian', slug: 'italian', icon: '🍝', order: 2 },
  { name: 'Mexican', slug: 'mexican', icon: '🌮', order: 3 },
  { name: 'Chinese', slug: 'chinese', icon: '🥡', order: 4 },
  { name: 'Japanese', slug: 'japanese', icon: '🍣', order: 5 },
  { name: 'Thai', slug: 'thai', icon: '🍜', order: 6 },
  { name: 'Indian', slug: 'indian', icon: '🍛', order: 7 },
  { name: 'Mediterranean', slug: 'mediterranean', icon: '🥙', order: 8 },
  { name: 'Vietnamese', slug: 'vietnamese', icon: '🍲', order: 9 },
  { name: 'Korean', slug: 'korean', icon: '🥘', order: 10 },
  { name: 'Pizza', slug: 'pizza', icon: '🍕', order: 11 },
  { name: 'Burgers', slug: 'burgers', icon: '🍔', order: 12 },
  { name: 'Sandwiches & Deli', slug: 'sandwiches-deli', icon: '🥪', order: 13 },
  { name: 'Salads & Healthy', slug: 'salads-healthy', icon: '🥗', order: 14 },
  { name: 'Seafood', slug: 'seafood', icon: '🦐', order: 15 },
  { name: 'BBQ & Grill', slug: 'bbq-grill', icon: '🍖', order: 16 },
  { name: 'Breakfast & Brunch', slug: 'breakfast-brunch', icon: '🥞', order: 17 },
  { name: 'Cafe & Coffee', slug: 'cafe-coffee', icon: '☕', order: 18 },
  { name: 'Bakery & Desserts', slug: 'bakery-desserts', icon: '🧁', order: 19 },
  { name: 'Vegetarian & Vegan', slug: 'vegetarian-vegan', icon: '🥬', order: 20 },
  { name: 'Fast Casual', slug: 'fast-casual', icon: '🍟', order: 21 },
  { name: 'Fine Dining', slug: 'fine-dining', icon: '🍽️', order: 22 },
  { name: 'Food Truck', slug: 'food-truck', icon: '🚚', order: 23 },
  { name: 'Other', slug: 'other', icon: '🍴', order: 99 },
]

// POST - Seed categories (only in development)
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Not allowed in production' },
      { status: 403 }
    )
  }

  try {
    await connectDB()

    const results = []
    for (const category of categories) {
      const result = await Category.findOneAndUpdate(
        { slug: category.slug },
        { ...category, isActive: true },
        { upsert: true, new: true }
      )
      results.push(result.name)
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} categories`,
      categories: results,
    })
  } catch (error) {
    console.error('Failed to seed categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed categories' },
      { status: 500 }
    )
  }
}

// GET - List seeded categories
export async function GET() {
  try {
    await connectDB()
    const count = await Category.countDocuments({ isActive: true })
    const categories = await Category.find({ isActive: true }).select('name slug icon')

    return NextResponse.json({
      success: true,
      count,
      categories,
    })
  } catch (error) {
    console.error('Failed to get categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get categories' },
      { status: 500 }
    )
  }
}
