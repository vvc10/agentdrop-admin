import * as React from "react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

const variantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  default: "border border-gray-200 bg-white text-gray-900",
  destructive: "border border-red-200 bg-red-50 text-red-800",
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div className={cn("rounded-lg p-4", variantClasses[variant], className)} {...props} />
  )
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm", className)} {...props} />
}
