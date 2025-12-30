import 'next-auth'
import { DefaultSession } from 'next-auth'

type UserRole = 'EMPLOYEE' | 'MERCHANT' | 'COMPANY_ADMIN' | 'PLATFORM_ADMIN'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: UserRole
    isEmailVerified: boolean
    employeeId?: string
    merchantId?: string
    companyId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      role: UserRole
      isEmailVerified: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: UserRole
    isEmailVerified: boolean
    employeeId?: string
    merchantId?: string
    companyId?: string
  }
}
