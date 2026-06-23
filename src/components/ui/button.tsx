import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-warm-500 text-white shadow-sm hover:bg-warm-600",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm hover:bg-[hsl(var(--secondary))/80]",
        ghost:
          "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        link: "text-warm-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-[0.625rem] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-button)] px-8 text-base",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
