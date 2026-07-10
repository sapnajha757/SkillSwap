"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-sage-dim text-on-primary shadow-[0_0_20px_rgba(182,222,195,0.2)] hover:shadow-[0_0_30px_rgba(182,222,195,0.35)] hover:brightness-105",
        destructive:
          "bg-error-container text-on-error-container border border-error/30 hover:bg-error/20",
        outline:
          "border border-border-strong bg-transparent text-on-surface hover:bg-surface-container hover:border-primary/40",
        secondary:
          "bg-secondary text-on-secondary shadow-[0_0_15px_rgba(206,190,249,0.2)] hover:shadow-[0_0_25px_rgba(206,190,249,0.35)] hover:brightness-105",
        ghost:
          "hover:bg-surface-container text-text-muted hover:text-text-primary",
        glass:
          "glass-panel text-text-primary hover:border-primary/40 hover:shadow-[0_0_20px_rgba(182,222,195,0.1)]",
        tertiary:
          "bg-tertiary text-on-tertiary shadow-[0_0_15px_rgba(221,212,191,0.2)] hover:brightness-105",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        whileHover={shouldReduceMotion ? {} : { scale: 1.015, y: -0.5 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98, y: 0 }}
        transition={{ type: "spring", stiffness: 550, damping: 24, mass: 0.7 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
