import { NextRequest, NextResponse } from 'next/server';
import { getTrendForCity, getYoYGrowth, getCAGR } from '../../../../lib/trends';
import { findCityById } from '../../../../lib/rules';
import { getCurrencyForCountry } from '../../../../lib/currency';

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

// GET /api/v1/trends?cityId=mumbai
export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId');

  if (!cityId) {
    return NextResponse.json({ error: 'cityId query param is required' }, { status: 400 });
  }

  const city = findCityById(cityId);
  if (!city) {
    return NextResponse.json({ error: `City '${cityId}' not found` }, { status: 404 });
  }

  const trend = getTrendForCity(cityId);
  const yoy = getYoYGrowth(cityId);
  const cagr = getCAGR(cityId);
  const currency = getCurrencyForCountry(city.country || 'India');

  return NextResponse.json({
    version: 'v1',
    cityId,
    cityName: city.name,
    country: city.country,
    currency: currency ? { code: currency.code, symbol: currency.symbol } : null,
    priceTrend: trend,
    yoyGrowthPercent: yoy,
    fiveYearCagrPercent: cagr,
  });
}
