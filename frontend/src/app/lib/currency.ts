// Currency configuration per country
export interface CurrencyConfig {
  code: string;       // ISO 4217
  symbol: string;
  locale: string;     // for Intl.NumberFormat
  position: 'prefix' | 'suffix';
}

const currencyMap: Record<string, CurrencyConfig> = {
  India:     { code: 'INR', symbol: '₹',  locale: 'en-IN', position: 'prefix' },
  UAE:       { code: 'AED', symbol: 'AED', locale: 'en-AE', position: 'prefix' },
  USA:       { code: 'USD', symbol: '$',   locale: 'en-US', position: 'prefix' },
  UK:        { code: 'GBP', symbol: '£',   locale: 'en-GB', position: 'prefix' },
  Singapore: { code: 'SGD', symbol: 'S$',  locale: 'en-SG', position: 'prefix' },
  Australia: { code: 'AUD', symbol: 'A$',  locale: 'en-AU', position: 'prefix' },
  Canada:    { code: 'CAD', symbol: 'C$',  locale: 'en-CA', position: 'prefix' },
  Germany:   { code: 'EUR', symbol: '€',   locale: 'de-DE', position: 'suffix' },
  Japan:     { code: 'JPY', symbol: '¥',   locale: 'ja-JP', position: 'prefix' },
  Qatar:     { code: 'QAR', symbol: 'QR',  locale: 'ar-QA', position: 'prefix' },
  Oman:      { code: 'OMR', symbol: 'OMR', locale: 'ar-OM', position: 'prefix' },
};

export function getCurrencyForCountry(country?: string): CurrencyConfig {
  return currencyMap[country || 'India'] || currencyMap['India'];
}

export function formatCurrency(amount: number, country?: string): string {
  const cfg = getCurrencyForCountry(country);
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      maximumFractionDigits: cfg.code === 'JPY' ? 0 : 0,
    }).format(amount);
  } catch {
    // Fallback
    const formatted = amount.toLocaleString();
    return cfg.position === 'prefix' ? `${cfg.symbol}${formatted}` : `${formatted} ${cfg.symbol}`;
  }
}

export function getCurrencySymbol(country?: string): string {
  return getCurrencyForCountry(country).symbol;
}

export function getAllCurrencies(): Record<string, CurrencyConfig> {
  return { ...currencyMap };
}
