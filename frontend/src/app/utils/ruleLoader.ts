export interface RuleJson {
  region: string;
  property_types: string[];
  stamp_duty: number;
  registration_fee: number;
  gst_applicable: boolean;
  female_rebate?: number;
  permit_fee?: number;
  loan: { max_ltv: number; interest_rate: number; tenure_years: number };
  freehold_allowed?: boolean;
  last_verified: string;
  source: string;
  updated_by: string;
  notes?: string;
  data_version?: string;
}

import { validateRule } from './validateRule';

const LOCAL_MAP: Record<string, string> = {
  'uae/dubai.json': '/rules/uae/dubai.json',
  'india/karnataka.json': '/rules/india/karnataka.json',
  'usa/texas.json': '/rules/usa/texas.json',
};

export async function loadRule(regionPath: keyof typeof LOCAL_MAP, base?: string): Promise<RuleJson> {
  const repo = base || process.env.NEXT_PUBLIC_RULE_REPO;
  // Try remote first if repo set
  if (repo) {
    try {
      const res = await fetch(`${repo.replace(/\/$/, '')}/${regionPath}`);
      if (res.ok) {
        const json = await res.json();
        if (!validateRule(json)) throw new Error('Invalid rule json');
        return json;
      }
    } catch {}
  }
  // Fallback to local bundled JSON
  const res = await fetch(LOCAL_MAP[regionPath]);
  if (!res.ok) throw new Error(`Failed to load rule for ${regionPath}`);
  const localJson = await res.json();
  if (!validateRule(localJson)) throw new Error('Invalid local rule json');
  return localJson;
}

