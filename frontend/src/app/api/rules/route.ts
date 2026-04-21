import { NextResponse } from 'next/server';
import { activeRuleSet } from '../../lib/rules';
import { loadRule } from '../../utils/ruleLoader';

export async function GET() {
  // expose active rules metadata plus a peek at available regional rule sources
  let uae: any = null;
  try {
    uae = await loadRule('uae/dubai.json');
  } catch {}
  return NextResponse.json({ ...activeRuleSet.metadata, availableRegions: { uae: uae?.region ?? 'Dubai' } });
}

