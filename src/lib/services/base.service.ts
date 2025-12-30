import { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import { connectDB } from '@/lib/db/mongoose'
import { cache } from '@/lib/cache/redis'

/**
 * Base service class with common CRUD operations
 */
export abstract class BaseService<T extends Document> {
  protected model: Model<T>
  protected cacheTTL: number
  protected cachePrefix: string

  constructor(model: Model<T>, cachePrefix: string, cacheTTL = 300) {
    this.model = model
    this.cachePrefix = cachePrefix
    this.cacheTTL = cacheTTL
  }

  /**
   * Ensure database connection
   */
  protected async ensureConnection(): Promise<void> {
    await connectDB()
  }

  /**
   * Generate cache key
   */
  protected getCacheKey(id: string, suffix?: string): string {
    return suffix ? `${this.cachePrefix}:${id}:${suffix}` : `${this.cachePrefix}:${id}`
  }

  /**
   * Find a single document by ID
   */
  async findById(id: string, useCache = true): Promise<T | null> {
    if (useCache) {
      const cached = await cache.get<T>(this.getCacheKey(id))
      if (cached) return cached
    }

    await this.ensureConnection()
    const doc = await this.model.findById(id).lean()

    if (doc && useCache) {
      await cache.set(this.getCacheKey(id), doc, this.cacheTTL)
    }

    return doc as T | null
  }

  /**
   * Find a single document by filter
   */
  async findOne(filter: FilterQuery<T>, useCache = false): Promise<T | null> {
    await this.ensureConnection()
    return this.model.findOne(filter).lean() as Promise<T | null>
  }

  /**
   * Find multiple documents
   */
  async find(
    filter: FilterQuery<T>,
    options?: {
      limit?: number
      skip?: number
      sort?: Record<string, 1 | -1>
      select?: string
    }
  ): Promise<T[]> {
    await this.ensureConnection()

    let query = this.model.find(filter)

    if (options?.sort) query = query.sort(options.sort)
    if (options?.skip) query = query.skip(options.skip)
    if (options?.limit) query = query.limit(options.limit)
    if (options?.select) query = query.select(options.select)

    return query.lean() as Promise<T[]>
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    await this.ensureConnection()
    const doc = await this.model.create(data)
    return doc.toObject() as T
  }

  /**
   * Update a document by ID
   */
  async updateById(
    id: string,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    await this.ensureConnection()
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true, ...options })
      .lean()

    if (doc) {
      await cache.del(this.getCacheKey(id))
    }

    return doc as T | null
  }

  /**
   * Update a document by filter
   */
  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    await this.ensureConnection()
    return this.model
      .findOneAndUpdate(filter, update, { new: true, ...options })
      .lean() as Promise<T | null>
  }

  /**
   * Delete a document by ID
   */
  async deleteById(id: string): Promise<boolean> {
    await this.ensureConnection()
    const result = await this.model.findByIdAndDelete(id)

    if (result) {
      await cache.del(this.getCacheKey(id))
    }

    return !!result
  }

  /**
   * Count documents matching filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    await this.ensureConnection()
    return this.model.countDocuments(filter)
  }

  /**
   * Check if a document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    await this.ensureConnection()
    const result = await this.model.exists(filter)
    return !!result
  }

  /**
   * Invalidate cache for an entity
   */
  async invalidateCache(id: string): Promise<void> {
    await cache.invalidate(`${this.cachePrefix}:${id}:*`)
    await cache.del(this.getCacheKey(id))
  }
}
