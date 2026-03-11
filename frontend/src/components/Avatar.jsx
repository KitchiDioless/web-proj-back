import React from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Avatar = ({ src, alt, className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <div
      className={cn(
        "rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={cn(
          "text-muted-foreground",
          size === "sm" && "h-4 w-4",
          size === "md" && "h-5 w-5",
          size === "lg" && "h-6 w-6",
          size === "xl" && "h-8 w-8"
        )} />
      )}
    </div>
  )
}

