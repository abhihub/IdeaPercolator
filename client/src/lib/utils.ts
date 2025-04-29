import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Get the maturity label based on the rank
 */
export function getMatureLabel(rank: number): string {
  if (rank >= 8) return 'Mature';
  if (rank >= 5) return 'Developing';
  return 'Emerging';
}
