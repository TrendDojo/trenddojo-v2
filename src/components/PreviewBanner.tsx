/**
 * Preview deployment banner component
 * Shows when running in preview mode without database
 */

'use client'

import { useEffect, useState } from 'react'

export default function PreviewBanner() {
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    // Check if we're in preview mode client-side
    const isVercel = !!process.env.NEXT_PUBLIC_VERCEL_URL
    const isProduction = process.env.NODE_ENV === 'production'
    const isPreviewDeploy = isVercel && isProduction && window.location.hostname.includes('vercel.app')
    
    setIsPreview(isPreviewDeploy)
  }, [])

  if (!isPreview) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-black px-4 py-2 text-center text-sm font-medium backdrop-blur-sm">
      🚧 Preview Deployment - Running in demo mode without database
    </div>
  )
}