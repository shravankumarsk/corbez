import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          // Find user in MongoDB with password field included
          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase(),
          }).select('+password')

          if (!user) {
            return null
          }

          // Use bcrypt comparison via model method
          const isPasswordValid = await user.comparePassword(credentials.password as string)
          if (!isPasswordValid) {
            return null
          }

          // Return user object with id field (required by NextAuth)
          return {
            id: user._id.toString(),
            corbezId: user.userId,  // Unique portable ID (CB-XXXXXX)
            email: user.email,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            role: user.role,
            isEmailVerified: user.emailVerified,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.odberMongoId = user.id
        token.odberCorbezId = user.corbezId
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.profileImage = user.profileImage
        token.role = user.role
        token.isEmailVerified = user.isEmailVerified
      }
      // Handle session update (e.g., after profile update)
      if (trigger === 'update' && session) {
        if (session.firstName) token.firstName = session.firstName
        if (session.lastName) token.lastName = session.lastName
        if (session.profileImage) token.profileImage = session.profileImage
      }
      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.odberMongoId as string
        session.user.corbezId = token.odberCorbezId as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.profileImage = token.profileImage as string
        session.user.role = token.role as 'EMPLOYEE' | 'MERCHANT' | 'COMPANY_ADMIN' | 'PLATFORM_ADMIN'
        session.user.isEmailVerified = token.isEmailVerified as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  trustHost: true,
} satisfies NextAuthConfig
