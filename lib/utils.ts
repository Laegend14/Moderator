import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes efficiently.
 * Used across components to handle conditional styling for 
 * case statuses (e.g., highlighting a 'Banned' verdict in red).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}