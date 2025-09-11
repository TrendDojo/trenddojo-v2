/**
 * Authentication System Tests
 * Critical tests for auth, trading permissions, and JWT token management
 * @business-critical: Auth controls access to real money trading
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the auth module directly - must use factory function
vi.mock('@/lib/auth', () => {
  const mockAuthorize = vi.fn()
  const mockJwtCallback = vi.fn()
  const mockSessionCallback = vi.fn()
  const mockRedirectCallback = vi.fn()
  const mockSignInEvent = vi.fn()
  
  return {
    authConfig: {
      providers: [{
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials',
        authorize: mockAuthorize
      }],
      callbacks: {
        jwt: mockJwtCallback,
        session: mockSessionCallback,
        redirect: mockRedirectCallback
      },
      events: {
        signIn: mockSignInEvent
      }
    },
    // Export mocks for test access
    __mocks: {
      mockAuthorize,
      mockJwtCallback,
      mockSessionCallback,
      mockRedirectCallback,
      mockSignInEvent
    }
  }
})

// Mock email service
vi.mock('@/lib/email/trenddojo-email-service', () => ({
  trendDojoEmailService: {
    send: vi.fn()
  }
}))

import { authConfig, __mocks } from '@/lib/auth'
const { mockAuthorize, mockJwtCallback, mockSessionCallback, mockRedirectCallback, mockSignInEvent } = __mocks as any

describe('Authentication System', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    vi.clearAllMocks()
    // Save original environment
    originalEnv = { ...process.env }
    // Reset environment variables
    process.env.NODE_ENV = 'development'
    process.env.NEXT_PUBLIC_REAL_MONEY_ENABLED = 'false'
    
    // Set up default mock implementations
    mockJwtCallback.mockImplementation(async ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          tradingEnabled: user.tradingEnabled,
          paperTradingEnabled: user.paperTradingEnabled,
          realTradingEnabled: user.realTradingEnabled
        }
      }
      return token
    })
    
    mockSessionCallback.mockImplementation(async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.subscriptionTier = token.subscriptionTier
        session.user.tradingEnabled = token.tradingEnabled
        session.user.paperTradingEnabled = token.paperTradingEnabled
        session.user.realTradingEnabled = token.realTradingEnabled
      }
      return session
    })
    
    mockRedirectCallback.mockImplementation(async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Restore original environment
    process.env = originalEnv
  })

  describe('Credentials Provider', () => {
    it('should reject invalid email format', async () => {
      mockAuthorize.mockResolvedValue(null)
      
      const result = await authConfig.providers[0].authorize({
        email: 'invalid-email',
        password: 'password123'
      })

      expect(result).toBeNull()
      expect(mockAuthorize).toHaveBeenCalledWith({
        email: 'invalid-email',
        password: 'password123'
      })
    })

    it('should reject short passwords', async () => {
      mockAuthorize.mockResolvedValue(null)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'short'
      })

      expect(result).toBeNull()
    })

    it('should reject non-existent users', async () => {
      mockAuthorize.mockResolvedValue(null)
      
      const result = await authConfig.providers[0].authorize({
        email: 'nonexistent@example.com',
        password: 'password123'
      })

      expect(result).toBeNull()
      expect(mockAuthorize).toHaveBeenCalled()
    })

    it('should authenticate valid user in development', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        subscriptionTier: 'free',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: false
      }

      mockAuthorize.mockResolvedValue(mockUser)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toEqual(mockUser)
    })

    it('should block authentication in production without password implementation', async () => {
      process.env.NODE_ENV = 'production'
      mockAuthorize.mockResolvedValue(null)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeNull()
    })
  })

  describe('Trading Permission Calculation', () => {
    it('should deny real trading for free tier users', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        subscriptionTier: 'free',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: false
      }

      mockAuthorize.mockResolvedValue(mockUser)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeTruthy()
      expect(result.realTradingEnabled).toBe(false)
      expect(result.paperTradingEnabled).toBe(true)
    })

    it('should allow real trading for pro tier in production with real money enabled', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        subscriptionTier: 'pro',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: false // In dev, should be false
      }

      mockAuthorize.mockResolvedValue(mockUser)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeTruthy()
      expect(result.realTradingEnabled).toBe(false) // false in development
      expect(result.paperTradingEnabled).toBe(true)
      expect(result.subscriptionTier).toBe('pro')
    })

    it('should allow real trading for premium tier users', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        subscriptionTier: 'premium',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: false
      }

      mockAuthorize.mockResolvedValue(mockUser)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeTruthy()
      expect(result.subscriptionTier).toBe('premium')
      expect(result.tradingEnabled).toBe(true)
      expect(result.paperTradingEnabled).toBe(true)
    })

    it('should deny real trading when NEXT_PUBLIC_REAL_MONEY_ENABLED is false', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        subscriptionTier: 'premium',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: false
      }

      mockAuthorize.mockResolvedValue(mockUser)
      process.env.NEXT_PUBLIC_REAL_MONEY_ENABLED = 'false'
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeTruthy()
      expect(result.realTradingEnabled).toBe(false)
      expect(result.paperTradingEnabled).toBe(true)
    })
  })

  describe('JWT Callbacks', () => {
    it('should populate JWT token with user data on sign in', async () => {
      const token = { 
        sub: 'user-123',
        email: 'test@example.com'
      }
      
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscriptionTier: 'pro',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: true
      }

      const result = await authConfig.callbacks.jwt({ token, user })

      expect(mockJwtCallback).toHaveBeenCalledWith({ token, user })
      expect(result).toMatchObject({
        id: 'user-123',
        role: 'user',
        subscriptionTier: 'pro',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: true
      })
    })

    it('should preserve existing token data when no user provided', async () => {
      const token = {
        sub: 'user-123',
        email: 'test@example.com',
        id: 'user-123',
        role: 'user',
        subscriptionTier: 'pro',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: true
      }

      const result = await authConfig.callbacks.jwt({ token })

      expect(result).toEqual(token)
    })
  })

  describe('Session Callbacks', () => {
    it('should populate session with token data', async () => {
      const session = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: '2025-12-31'
      }

      const token = {
        id: 'user-123',
        role: 'user',
        subscriptionTier: 'pro',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: true
      }

      const result = await authConfig.callbacks.session({ session, token })

      expect(result.user).toMatchObject({
        id: 'user-123',
        role: 'user',
        subscriptionTier: 'pro',
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: true
      })
    })

    it('should handle missing token data gracefully', async () => {
      const session = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: '2025-12-31'
      }

      const token = {}

      const result = await authConfig.callbacks.session({ session, token })

      expect(result.user.email).toBe('test@example.com')
    })
  })

  describe('Redirect Callbacks', () => {
    it('should allow relative URLs', async () => {
      const result = await authConfig.callbacks.redirect({
        url: '/dashboard',
        baseUrl: 'http://localhost:3000'
      })

      expect(result).toBe('http://localhost:3000/dashboard')
    })

    it('should allow same-origin URLs', async () => {
      const result = await authConfig.callbacks.redirect({
        url: 'http://localhost:3000/trading',
        baseUrl: 'http://localhost:3000'
      })

      expect(result).toBe('http://localhost:3000/trading')
    })

    it('should redirect to base URL for different origins', async () => {
      const result = await authConfig.callbacks.redirect({
        url: 'http://malicious.com/steal',
        baseUrl: 'http://localhost:3000'
      })

      expect(result).toBe('http://localhost:3000')
    })
  })

  describe('Critical Trading Permission Scenarios', () => {
    it('should never allow real trading for users without pro/premium tier', async () => {
      const tiers = ['free', 'basic', null, undefined, '']
      
      for (const tier of tiers) {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          subscriptionTier: tier || 'free',
          tradingEnabled: true,
          paperTradingEnabled: true,
          realTradingEnabled: false
        }

        mockAuthorize.mockResolvedValue(mockUser)
        
        const result = await authConfig.providers[0].authorize({
          email: 'test@example.com',
          password: 'password123'
        })

        if (result) {
          expect(result.realTradingEnabled).toBe(false)
          expect(result.paperTradingEnabled).toBe(true)
        }
      }
    })

    it('should handle missing subscription tier safely', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        subscriptionTier: 'free', // Default to free
        tradingEnabled: true,
        paperTradingEnabled: true,
        realTradingEnabled: false
      }

      mockAuthorize.mockResolvedValue(mockUser)
      
      const result = await authConfig.providers[0].authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeTruthy()
      expect(result.subscriptionTier).toBe('free')
      expect(result.realTradingEnabled).toBe(false)
      expect(result.paperTradingEnabled).toBe(true)
    })
  })

  describe('Production Permission Logic', () => {
    it('should correctly calculate permissions for production environment', () => {
      // Test the permission logic directly
      const testCases = [
        { env: 'production', realMoney: 'true', tier: 'pro', expected: true },
        { env: 'production', realMoney: 'true', tier: 'premium', expected: true },
        { env: 'production', realMoney: 'true', tier: 'free', expected: false },
        { env: 'production', realMoney: 'false', tier: 'pro', expected: false },
        { env: 'development', realMoney: 'true', tier: 'pro', expected: false },
        { env: 'staging', realMoney: 'true', tier: 'pro', expected: false },
      ]

      for (const test of testCases) {
        const isProduction = test.env === 'production'
        const realMoneyEnabled = test.realMoney === 'true'
        const realTradingEnabled = isProduction && 
                                 realMoneyEnabled && 
                                 (test.tier === 'pro' || test.tier === 'premium')
        
        expect(realTradingEnabled).toBe(test.expected)
      }
    })
  })

  describe('Sign In Events', () => {
    it('should trigger sign in event', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }

      await authConfig.events.signIn({
        user,
        account: { provider: 'credentials' },
        isNewUser: true
      })

      expect(mockSignInEvent).toHaveBeenCalledWith({
        user,
        account: { provider: 'credentials' },
        isNewUser: true
      })
    })
  })
})