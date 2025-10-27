"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Lightweight, dependency-free tooltip shims to avoid build failures when
 * @radix-ui/react-tooltip is unavailable during static builds.
 * These components are API-compatible enough for common usage and simply
 * render children; TooltipContent renders a styled container around its children.
 */

type BasicProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }

const TooltipProvider: React.FC<BasicProps> = ({ children }) => <>{children}</>

const Tooltip: React.FC<BasicProps> = ({ children }) => <>{children}</>

const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button type="button" ref={ref} {...props}>
      {children}
    </button>
  )
)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, BasicProps & { sideOffset?: number }>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
