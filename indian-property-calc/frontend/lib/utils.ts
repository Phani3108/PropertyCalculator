import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupee format
 * @param amount Amount in rupees
 * @returns Formatted string
 */
export function formatIndianRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format large numbers in Indian format with words (lakhs, crores)
 * @param amount Amount to format
 * @returns Formatted string
 */
export function formatIndianAmount(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Convert flat or house parameters to query string
 * @param params Parameters object
 * @returns Query string
 */
export function paramsToQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return `${encodeURIComponent(key)}=${value ? '1' : '0'}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

/**
 * Get text color based on background color
 * @param bgColorClass Tailwind background color class
 * @returns Text color class (white or black)
 */
export function getTextColorForBackground(bgColorClass: string): string {
  const darkColors = [
    'bg-primary', 
    'bg-destructive', 
    'bg-slate-800', 
    'bg-slate-900',
    'bg-gray-800',
    'bg-gray-900',
    'bg-zinc-800',
    'bg-zinc-900'
  ];
  
  return darkColors.some(color => bgColorClass.includes(color)) 
    ? 'text-white' 
    : 'text-slate-900';
}

/**
 * Get color for city region
 * @param region Region name
 * @returns Tailwind color class
 */
export function getRegionColor(region: string): string {
  const regionColors: Record<string, string> = {
    'North': 'bg-blue-500',
    'South': 'bg-green-500',
    'East': 'bg-yellow-500',
    'West': 'bg-purple-500',
    'Central': 'bg-red-500'
  };
  
  return regionColors[region] || 'bg-gray-500';
}

/**
 * Get a color for a city's tier
 * @param tier Tier (1, 2, 3)
 * @returns Tailwind color class
 */
export function getTierColor(tier: string): string {
  const tierColors: Record<string, string> = {
    '1': 'bg-indigo-600',
    '2': 'bg-indigo-400',
    '3': 'bg-indigo-200'
  };
  
  return tierColors[tier] || 'bg-gray-500';
}

export function formatCurrency(amount: number): string {
  return formatIndianAmount(amount);
}
