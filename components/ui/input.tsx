import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-purple-500/30 selection:text-white bg-input border-purple-500/30 h-10 w-full min-w-0 rounded-lg border backdrop-blur-sm px-3 py-2 text-base text-foreground shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-purple-500 focus-visible:ring-purple-500/50 focus-visible:ring-[3px] focus-visible:shadow-lg focus-visible:shadow-purple-500/20",
        "hover:border-purple-500/50",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
