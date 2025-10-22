import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-purple-500/30 placeholder:text-muted-foreground focus-visible:border-purple-500 focus-visible:ring-purple-500/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 bg-input flex field-sizing-content min-h-16 w-full rounded-lg border backdrop-blur-sm px-3 py-2 text-base text-foreground shadow-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:shadow-lg focus-visible:shadow-purple-500/20 hover:border-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
