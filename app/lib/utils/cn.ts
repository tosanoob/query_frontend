import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/**
 * Combines multiple class names together, handling conflicts with Tailwind CSS
 * @param inputs Array of class name values
 * @returns Merged and cleaned up class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 