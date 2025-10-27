import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-orange-500/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-orange-500 hover:to-orange-600 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 hover:shadow-lg hover:shadow-red-500/50 active:scale-95",
        outline:
          "border-2 border-slate-500/40 bg-transparent hover:bg-orange-500/10 hover:border-orange-500/60 text-foreground backdrop-blur-sm active:scale-95 dark:border-slate-500/30 dark:text-gray-200",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border active:scale-95",
        ghost:
          "hover:bg-orange-500/10 hover:text-orange-500 active:scale-95",
        link: "text-orange-500 underline-offset-4 hover:underline hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-6 has-[>svg]:px-4 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
