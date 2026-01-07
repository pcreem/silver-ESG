import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, ...props }, ref) => {
    const variants = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-gray-200',
          variants[variant],
          className
        )}
        style={{
          width: width || (variant === 'text' ? '100%' : undefined),
          height: height || (variant === 'text' ? '1em' : undefined),
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

export const CardSkeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4', className)}
        {...props}
      >
        <Skeleton variant="text" width="60%" height="1.5rem" />
        <Skeleton variant="text" width="80%" height="1rem" />
        <Skeleton variant="text" width="40%" height="1rem" />
      </div>
    )
  }
)
CardSkeleton.displayName = 'CardSkeleton'

export const MenuCardSkeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}
        {...props}
      >
        <Skeleton variant="rectangular" width="100%" height="160px" />
        <div className="p-4 space-y-3">
          <Skeleton variant="text" width="70%" height="1.25rem" />
          <Skeleton variant="text" width="50%" height="1rem" />
          <Skeleton variant="text" width="30%" height="1.5rem" />
        </div>
      </div>
    )
  }
)
MenuCardSkeleton.displayName = 'MenuCardSkeleton'
