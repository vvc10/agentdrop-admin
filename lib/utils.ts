import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateToThreeLines(text: string, maxChars: number = 150): string {
  if (!text) return "";
  
  // If text is shorter than maxChars, return as is
  if (text.length <= maxChars) return text;
  
  // Truncate to maxChars and add ellipsis
  return text.substring(0, maxChars).trim() + "...";
}
