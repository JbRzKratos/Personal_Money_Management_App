"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])

  return isMobile
}

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  /** Extra class for the desktop DialogContent */
  dialogClassName?: string
}

/**
 * Renders as a bottom Sheet on mobile (<768px) and a centered Dialog on desktop.
 * Provides consistent open/close API and accessible header.
 */
function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  dialogClassName,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "max-h-[92vh] rounded-t-2xl px-4 pb-8",
            className
          )}
        >
          {(title || description) && (
            <SheetHeader className="px-0 pb-2 pt-1">
              {title && <SheetTitle className="text-lg">{title}</SheetTitle>}
              {description && (
                <SheetDescription className="text-sm">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          )}
          <ScrollArea className="max-h-[calc(92vh-6rem)] overflow-y-auto">
            <div className="pb-2">{children}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-[500px]", dialogClassName, className)}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { ResponsiveModal, useIsMobile }
