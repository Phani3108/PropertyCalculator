import { NextResponse } from 'next/server';
import { cities } from '../../lib/rules';

export async function GET() {
  return NextResponse.json(cities);
}

