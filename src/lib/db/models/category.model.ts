import mongoose, { Document, Schema, Types } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  icon?: string
  parentCategory?: Types.ObjectId
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: String,
    icon: String,
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Category =
  mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)
