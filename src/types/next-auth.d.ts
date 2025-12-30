import 'next-auth'
import { UserRole } from '@/lib/db/models/user.model'

declare module 'next-auth' {
  interface User {
    id: string
    corbezId?: string  // Unique portable ID (CB-XXXXXX)
    email: string
    firstName?: string
    lastName?: string
    profileImage?: string
    role: UserRole
    isEmailVerified: boolean
  }

  interface Session {
    user: {
      id: string
      corbezId?: string  // Unique portable ID (CB-XXXXXX)
      email: string
      name?: string
      firstName?: string
      lastName?: string
      profileImage?: string
      role: string
      isEmailVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    odberMongoId: string
    odberCorbezId?: string
    firstName?: string
    lastName?: string
    profileImage?: string
    role: string
    isEmailVerified: boolean
  }
}
