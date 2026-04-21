import { NextRequest, NextResponse } from 'next/server';
import { calculateFlatCostAsync, calculateHouseCostAsync } from '../../../lib/calculators';

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

// POST /api/v1/calculate — unified calculation endpoint
export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  try {
    const body = await req.json();
    const {
      propertyType = 'flat',
      cityId,
      areaInSqft,
      pricePerSqft,
      floorNumber,
      quality,
      includeLoan,
      loanPercent,
      interestRate,
      loanTenureYears,
    } = body;

    if (!cityId || !areaInSqft || !pricePerSqft) {
      return NextResponse.json(
        { error: 'cityId, areaInSqft, and pricePerSqft are required' },
        { status: 400 }
      );
    }

    let result;
    if (propertyType === 'house') {
      result = await calculateHouseCostAsync(
        cityId,
        Number(areaInSqft),
        Number(pricePerSqft),
        quality || 'standard',
        !!includeLoan,
        Number(loanPercent || 80),
        Number(interestRate || 8.5),
        Number(loanTenureYears || 20),
      );
    } else {
      result = await calculateFlatCostAsync(
        cityId,
        Number(areaInSqft),
        Number(pricePerSqft),
        Number(floorNumber || 1),
        !!includeLoan,
        Number(loanPercent || 80),
        Number(interestRate || 8.5),
        Number(loanTenureYears || 20),
      );
    }

    return NextResponse.json({ version: 'v1', propertyType, result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Calculation failed' },
      { status: 500 }
    );
  }
}
