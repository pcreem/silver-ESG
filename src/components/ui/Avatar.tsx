'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef, ReactNode } from 'react'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy'
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', status, children, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    }
    
    const statusColors = {
      online: 'bg-emerald-500',
      offline: 'bg-neutral-400',
      busy: 'bg-amber-500',
    }
    
    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className={cn(
              'object-cover rounded-full',
              sizes[size]
            )}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center rounded-full bg-primary-100 text-primary-600 font-medium',
              sizes[size]
            )}
          >
            {fallback || children || '?'}
          </div>
        )}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              statusColors[status],
              size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'
