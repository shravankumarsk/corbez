import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { Category } from '../src/lib/db/models/category.model'

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf-8')
const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const MONGODB_URI = envVars.MONGODB_URI || process.env.MONGODB_URI

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

async function seedCategories() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    for (const category of categories) {
      await Category.findOneAndUpdate(
        { slug: category.slug },
        { ...category, isActive: true },
        { upsert: true, new: true }
      )
      console.log(`✓ ${category.name}`)
    }

    console.log(`\nSeeded ${categories.length} categories`)
    process.exit(0)
  } catch (error) {
    console.error('Error seeding categories:', error)
    process.exit(1)
  }
}

seedCategories()
