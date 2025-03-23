import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null | undefined, currency = 'EGP'): string {
  // Convert to number and handle null/undefined
  const numAmount = amount !== null && amount !== undefined ? Number(amount) : 0;
  
  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return `${currency} 0.00`;
  }
  
  return `${currency} ${numAmount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function getCurrentMonth(): string {
  const date = new Date();
  return getMonthName(date.getMonth());
}

export function getPreviousMonths(count: number): string[] {
  const date = new Date();
  const months: string[] = [];
  
  for (let i = 0; i < count; i++) {
    date.setMonth(date.getMonth() - 1);
    months.push(getMonthName(date.getMonth()));
  }
  
  return months;
}
