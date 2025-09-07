/**
 * NextAuth Configuration for TrendDojo
 * Trading platform authentication with subscription tier support
 * Based on Controlla's auth patterns but adapted for trading needs
 */

import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { z } from "zod"
// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      role: string
      subscriptionTier: string
      tradingEnabled: boolean
      paperTradingEnabled: boolean
      realTradingEnabled: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    role: string
    subscriptionTier: string
    tradingEnabled: boolean
    paperTradingEnabled: boolean
    realTradingEnabled: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    subscriptionTier: string
    tradingEnabled: boolean
    paperTradingEnabled: boolean
    realTradingEnabled: boolean
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials)
          
          if (!parsed.success) {
            console.warn("[AUTH] Invalid credentials format")
            return null
          }

          const { email, password } = parsed.data

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
              subscription: true,
              tradingProfile: true
            }
          })

          if (!user) {
            console.warn("[AUTH] User not found:", email)
            return null
          }

          if (!user.emailVerified && process.env.NODE_ENV === 'production') {
            console.warn("[AUTH] Email not verified:", email)
            return null
          }

          if (!user.hashedPassword) {
            console.warn("[AUTH] No password set for user:", email)
            return null
          }

          const isPasswordValid = await compare(password, user.hashedPassword)

          if (!isPasswordValid) {
            console.warn("[AUTH] Invalid password for user:", email)
            return null
          }

          // Determine trading permissions based on subscription and environment
          const subscriptionTier = user.subscription?.tier || 'free'
          const isProduction = process.env.NODE_ENV === 'production'
          const realMoneyEnabled = process.env.NEXT_PUBLIC_REAL_MONEY_ENABLED === 'true'
          const realTradingEnabled = isProduction && 
                                   realMoneyEnabled && 
                                   (subscriptionTier === 'pro' || subscriptionTier === 'premium') &&
                                   user.tradingProfile?.realTradingEnabled === true

          const tradingUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            subscriptionTier,
            tradingEnabled: true, // Always allow some form of trading
            paperTradingEnabled: true, // Always allow paper trading
            realTradingEnabled
          }

          console.log(`[AUTH] User logged in: ${email} (${subscriptionTier}, real trading: ${realTradingEnabled})`)
          
          return tradingUser
        } catch (error) {
          console.error("[AUTH] Authorization error:", error)
          return null
        }
      }
    }),
    
    // Google OAuth (if configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Add profile callback to handle subscription data
        profile: async (profile) => {
          // When a user signs in with Google, create/update their profile
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
            include: { subscription: true, tradingProfile: true }
          })

          const subscriptionTier = existingUser?.subscription?.tier || 'free'
          
          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            role: 'user',
            subscriptionTier,
            tradingEnabled: true,
            paperTradingEnabled: true,
            realTradingEnabled: false // OAuth users need to verify real trading separately
          }
        }
      })
    ] : [])
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.subscriptionTier = user.subscriptionTier
        token.tradingEnabled = user.tradingEnabled
        token.paperTradingEnabled = user.paperTradingEnabled
        token.realTradingEnabled = user.realTradingEnabled
      }
      
      // Return previous token if the access token has not expired yet
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.subscriptionTier = token.subscriptionTier
        session.user.tradingEnabled = token.tradingEnabled
        session.user.paperTradingEnabled = token.paperTradingEnabled
        session.user.realTradingEnabled = token.realTradingEnabled
      }
      
      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    }
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/login?message=check-email", // (used for check email message)
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[AUTH] Sign in event:`, {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
        environment: process.env.NODE_ENV
      })
      
      // Send welcome email for new users (but not in development)
      if (isNewUser && process.env.NODE_ENV !== 'development') {
        try {
          const { trendDojoEmailService } = await import('@/lib/email/trenddojo-email-service')
          await trendDojoEmailService.send({
            to: user.email,
            templateType: 'welcome',
            data: {
              firstName: user.name?.split(' ')[0] || 'Trader',
              subscriptionTier: user.subscriptionTier || 'free'
            }
          })
        } catch (error) {
          console.error('[AUTH] Failed to send welcome email:', error)
        }
      }
    },
    
    async signOut({ token, session }) {
      console.log(`[AUTH] Sign out event:`, {
        userId: token?.id || session?.user?.id,
        email: token?.email || session?.user?.email,
        environment: process.env.NODE_ENV
      })
    }
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debug messages in non-production
}

export default NextAuth(authConfig)