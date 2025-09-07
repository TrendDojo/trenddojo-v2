/**
 * NextAuth API Route Handler for TrendDojo
 * Handles all authentication endpoints
 */

import NextAuth from '@/lib/auth'

// Export the NextAuth handlers for all HTTP methods
const handler = NextAuth

export { handler as GET, handler as POST }