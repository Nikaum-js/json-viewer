import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md touch-manipulation",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent active:bg-accent/80 active:scale-[0.98]",
        destructive:
          "border border-transparent bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive active:bg-destructive/80 active:scale-[0.98]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-[0.98]",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60 active:scale-[0.98]",
        ghost: "border border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
      },
      size: {
        default: "h-10 px-4 text-sm min-h-[44px]", // Ensures minimum touch target
        sm: "h-9 px-3 text-xs min-h-[40px]", // Still reasonably touch-friendly
        lg: "h-12 px-8 text-base min-h-[48px]", // Larger for better touch experience
        icon: "h-10 w-10 p-0 min-h-[44px] min-w-[44px]", // Touch-friendly icon buttons
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { buttonVariants }