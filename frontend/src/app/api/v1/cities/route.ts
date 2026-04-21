import { NextRequest, NextResponse } from 'next/server';
import { cities, findCityById, stateRules, regionPathForCity } from '../../../lib/rules';
import { getCurrencyForCountry, formatCurrency } from '../../../lib/currency';
import { getTrendForCity, getYoYGrowth, getCAGR } from '../../../lib/trends';

// Simple API key validation — keys stored in env var as comma-separated list
function validateApiKey(req: NextRequest): boolean {
  const key = req.headers.get('x-api-key');
  if (!key) return false;
  const validKeys = (process.env.API_KEYS || 'demo-key-2024').split(',');
  return validKeys.includes(key.trim());
}

function unauthorized() {
  return NextResponse.json(
    { error: 'Missing or invalid API key. Pass x-api-key header.' },
    { status: 401 }
  );
}

// GET /api/v1/cities — list all cities with currency info
export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const tier = searchParams.get('tier');

  let filtered = cities;
  if (country) filtered = filtered.filter(c => c.country?.toLowerCase() === country.toLowerCase());
  if (tier) filtered = filtered.filter(c => c.tier === tier);

  const enriched = filtered.map(c => {
    const currency = getCurrencyForCountry(c.country || 'India');
    const trend = getTrendForCity(c.id);
    const yoy = getYoYGrowth(c.id);
    const cagr = getCAGR(c.id);
    return {
      id: c.id,
      name: c.name,
      state: c.state,
      tier: c.tier,
      country: c.country,
      currency: currency ? { code: currency.code, symbol: currency.symbol } : null,
      priceTrend: trend ? { latestPricePerSqft: trend[trend.length - 1]?.avgPricePerSqft, yoyGrowth: yoy, fiveYearCagr: cagr } : null,
    };
  });

  return NextResponse.json({
    version: 'v1',
    count: enriched.length,
    cities: enriched,
  });
}
