import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-purple-500/50 focus-visible:ring-[3px] transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm",
        secondary:
          "border-purple-500/30 bg-gray-800/60 text-gray-300 backdrop-blur-sm",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 shadow-sm",
        outline:
          "text-gray-300 border-purple-500/30 bg-transparent backdrop-blur-sm [a&]:hover:bg-purple-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
