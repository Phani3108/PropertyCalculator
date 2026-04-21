// Freemium usage gating — tracks calculations per day in localStorage
const USAGE_KEY = 'prop_calc_usage_v1';
const FREE_DAILY_LIMIT = 10;
const FREE_COMPARE_LIMIT = 3;
const FREE_API_LIMIT = 50;

interface UsageData {
  date: string; // YYYY-MM-DD
  calculations: number;
  comparisons: number;
  apiCalls: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): UsageData {
  if (typeof window === 'undefined') {
    return { date: today(), calculations: 0, comparisons: 0, apiCalls: 0 };
  }
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as UsageData;
      if (data.date === today()) return data;
    }
  } catch {}
  return { date: today(), calculations: 0, comparisons: 0, apiCalls: 0 };
}

function saveUsage(data: UsageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
}

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('prop_calc_premium') === 'true';
}

export function setPremium(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem('prop_calc_premium', 'true');
  } else {
    localStorage.removeItem('prop_calc_premium');
  }
}

export function canCalculate(): { allowed: boolean; remaining: number; limit: number } {
  if (isPremium()) return { allowed: true, remaining: Infinity, limit: Infinity };
  const usage = getUsage();
  const remaining = Math.max(0, FREE_DAILY_LIMIT - usage.calculations);
  return { allowed: remaining > 0, remaining, limit: FREE_DAILY_LIMIT };
}

export function canCompare(): { allowed: boolean; remaining: number; limit: number } {
  if (isPremium()) return { allowed: true, remaining: Infinity, limit: Infinity };
  const usage = getUsage();
  const remaining = Math.max(0, FREE_COMPARE_LIMIT - usage.comparisons);
  return { allowed: remaining > 0, remaining, limit: FREE_COMPARE_LIMIT };
}

export function trackCalculation(): void {
  const usage = getUsage();
  usage.calculations += 1;
  saveUsage(usage);
}

export function trackComparison(): void {
  const usage = getUsage();
  usage.comparisons += 1;
  saveUsage(usage);
}

export function trackApiCall(): void {
  const usage = getUsage();
  usage.apiCalls += 1;
  saveUsage(usage);
}

export function getUsageSummary() {
  const usage = getUsage();
  return {
    ...usage,
    calcRemaining: isPremium() ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usage.calculations),
    compareRemaining: isPremium() ? Infinity : Math.max(0, FREE_COMPARE_LIMIT - usage.comparisons),
    apiRemaining: isPremium() ? Infinity : Math.max(0, FREE_API_LIMIT - usage.apiCalls),
  };
}
