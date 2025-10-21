import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton loading component for better perceived performance
 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
    none: '',
  }

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  )
}

/**
 * Feature Card Skeleton for homepage features section
 */
export function FeatureCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8">
      <Skeleton variant="rounded" width={56} height={56} className="mb-6" />
      <Skeleton width="80%" height={32} className="mb-3" />
      <Skeleton width="100%" height={16} className="mb-2" />
      <Skeleton width="100%" height={16} className="mb-2" />
      <Skeleton width="60%" height={16} className="mb-6" />
      <Skeleton width="40%" height={20} />
    </div>
  )
}

/**
 * Testimonial Card Skeleton
 */
export function TestimonialCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center mb-4 gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="circular" width={20} height={20} />
        ))}
      </div>
      <Skeleton width="100%" height={16} className="mb-2" />
      <Skeleton width="100%" height={16} className="mb-2" />
      <Skeleton width="80%" height={16} className="mb-6" />
      <div className="h-px bg-gray-200 mb-6" />
      <div className="flex items-center">
        <Skeleton variant="circular" width={48} height={48} className="mr-4" />
        <div className="flex-1">
          <Skeleton width="60%" height={20} className="mb-2" />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
    </div>
  )
}

/**
 * Hero Section Skeleton
 */
export function HeroSkeleton() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50/30 py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Skeleton width="80%" height={64} className="mx-auto mb-6" />
          <Skeleton width="90%" height={32} className="mx-auto mb-12" />
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-2xl p-8 sm:p-12">
              <Skeleton width="100%" height={24} className="mb-8" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Skeleton width={240} height={56} className="rounded-lg" />
                <Skeleton width={180} height={56} className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Pricing Card Skeleton
 */
export function PricingCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-500 shadow-2xl p-8 sm:p-10">
      <Skeleton width="50%" height={48} className="mb-2" />
      <Skeleton width="30%" height={24} className="mb-8" />
      
      <div className="space-y-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start">
            <Skeleton variant="circular" width={24} height={24} className="mr-4" />
            <Skeleton width="80%" height={20} />
          </div>
        ))}
      </div>
      
      <Skeleton width="100%" height={56} className="rounded-xl mb-6" />
      
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} width="100%" height={20} />
        ))}
      </div>
    </div>
  )
}

/**
 * Stats Section Skeleton
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton width={100} height={40} className="mx-auto mb-2" />
          <Skeleton width={120} height={16} className="mx-auto" />
        </div>
      ))}
    </div>
  )
}

/**
 * Chat Interface Skeleton
 */
export function ChatSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton variant="circular" width={12} height={12} className="mr-2 bg-white/30" />
            <Skeleton width={150} height={20} className="bg-white/30" />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="circular" width={12} height={12} className="bg-white/30" />
            <Skeleton variant="circular" width={12} height={12} className="bg-white/30" />
            <Skeleton variant="circular" width={12} height={12} className="bg-white/30" />
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4 bg-gray-50 min-h-[400px]">
        <div className="flex justify-end">
          <Skeleton width="60%" height={60} className="rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton width="70%" height={120} className="rounded-2xl" />
        </div>
      </div>
      
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <Skeleton width="100%" height={48} className="rounded-xl" />
      </div>
    </div>
  )
}

// Add shimmer animation to global styles
export const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background-size: 1000px 100%;
  }
`

