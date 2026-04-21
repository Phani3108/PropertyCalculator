import { calculateFlatCostAsync, getStateInfoAsync, validateFlatRequest } from '../../lib/calculators';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateFlatRequest(body);
    const result = await calculateFlatCostAsync(parsed);
    const stateInfo = await getStateInfoAsync(parsed.cityId, parsed.gender);
    return new Response(JSON.stringify({ ...result, stateInfo }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const message = error?.message ?? 'Invalid request';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

