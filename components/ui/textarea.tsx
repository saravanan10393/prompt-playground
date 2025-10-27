import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border placeholder:text-muted-foreground focus-visible:border-orange-500 focus-visible:ring-orange-500/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 bg-input text-foreground flex field-sizing-content min-h-16 w-full rounded-lg border backdrop-blur-sm px-3 py-2 text-base shadow-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:shadow-lg focus-visible:shadow-orange-500/20 hover:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
