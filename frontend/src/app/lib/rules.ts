export type CityTier = 'tier1' | 'tier2' | 'tier3';

export interface City {
  id: string;
  name: string;
  state: string;
  tier: CityTier;
  country?: string;
  region?: string;
}

export interface StateRule {
  state: string;
  stampDutyPercent: number; // default, may vary by gender
  femaleRebatePercent?: number;
  registrationPercent: number;
  note?: string;
}

export interface RuleSetMetadata {
  version: string;
  source: string;
  validUntil?: string;
  verifiedBy?: string;
  lastUpdated: string;
}

export interface RuleSet {
  metadata: RuleSetMetadata;
  cities: City[];
  stateRules: StateRule[];
}

export const activeRuleSet: RuleSet = {
  metadata: {
    version: '2025.07.01',
    source: 'Curated internal dataset; references: state portals and RBI circulars',
    validUntil: '2025-12-31',
    verifiedBy: 'Ops Team',
    lastUpdated: '2025-07-01',
  },
  cities: [
    { id: 'blr', name: 'Bengaluru', state: 'Karnataka', tier: 'tier1', country: 'India', region: 'Karnataka' },
    { id: 'mum', name: 'Mumbai', state: 'Maharashtra', tier: 'tier1', country: 'India', region: 'Maharashtra' },
    { id: 'hyd', name: 'Hyderabad', state: 'Telangana', tier: 'tier1', country: 'India', region: 'Telangana' },
    { id: 'pnq', name: 'Pune', state: 'Maharashtra', tier: 'tier1', country: 'India', region: 'Maharashtra' },
    { id: 'del', name: 'Delhi', state: 'Delhi', tier: 'tier1', country: 'India', region: 'Delhi' },
    { id: 'chn', name: 'Chennai', state: 'Tamil Nadu', tier: 'tier1', country: 'India', region: 'TamilNadu' },
    { id: 'kol', name: 'Kolkata', state: 'West Bengal', tier: 'tier2', country: 'India', region: 'WestBengal' },
    { id: 'amd', name: 'Ahmedabad', state: 'Gujarat', tier: 'tier2', country: 'India', region: 'Gujarat' },
    { id: 'koc', name: 'Kochi', state: 'Kerala', tier: 'tier2', country: 'India', region: 'Kerala' },
    { id: 'jai', name: 'Jaipur', state: 'Rajasthan', tier: 'tier2', country: 'India', region: 'Rajasthan' },
    { id: 'lko', name: 'Lucknow', state: 'Uttar Pradesh', tier: 'tier2', country: 'India', region: 'UttarPradesh' },
    { id: 'chd', name: 'Chandigarh', state: 'Chandigarh', tier: 'tier2', country: 'India', region: 'Chandigarh' },
    { id: 'cbr', name: 'Coimbatore', state: 'Tamil Nadu', tier: 'tier3', country: 'India', region: 'TamilNadu' },
    { id: 'idr', name: 'Indore', state: 'Madhya Pradesh', tier: 'tier3', country: 'India', region: 'MadhyaPradesh' },
    { id: 'viz', name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 'tier2', country: 'India', region: 'AndhraPradesh' },

    // UAE
    { id: 'dubai_marina', name: 'Dubai Marina', state: 'Dubai', tier: 'tier1', country: 'UAE', region: 'Dubai' },
    { id: 'abudhabi', name: 'Abu Dhabi', state: 'Abu Dhabi', tier: 'tier1', country: 'UAE', region: 'AbuDhabi' },

    // USA
    { id: 'austin', name: 'Austin', state: 'Texas', tier: 'tier2', country: 'USA', region: 'Texas' },
    { id: 'nyc', name: 'New York', state: 'New York', tier: 'tier1', country: 'USA', region: 'NewYork' },
    { id: 'sfo', name: 'San Francisco', state: 'California', tier: 'tier1', country: 'USA', region: 'California' },
    { id: 'lax', name: 'Los Angeles', state: 'California', tier: 'tier1', country: 'USA', region: 'California' },

    // UK
    { id: 'london', name: 'London', state: 'England', tier: 'tier1', country: 'UK', region: 'England' },
    { id: 'manchester', name: 'Manchester', state: 'England', tier: 'tier2', country: 'UK', region: 'England' },

    // Singapore
    { id: 'sgcentral', name: 'Singapore Central', state: 'Singapore', tier: 'tier1', country: 'Singapore', region: 'Singapore' },
    { id: 'jurong', name: 'Jurong East', state: 'Singapore', tier: 'tier2', country: 'Singapore', region: 'Singapore' },

    // Australia
    { id: 'sydney', name: 'Sydney', state: 'NSW', tier: 'tier1', country: 'Australia', region: 'NSW' },
    { id: 'melbourne', name: 'Melbourne', state: 'Victoria', tier: 'tier1', country: 'Australia', region: 'Victoria' },

    // Canada
    { id: 'toronto', name: 'Toronto', state: 'Ontario', tier: 'tier1', country: 'Canada', region: 'Ontario' },
    { id: 'vancouver', name: 'Vancouver', state: 'BC', tier: 'tier1', country: 'Canada', region: 'BritishColumbia' },

    // Germany
    { id: 'berlin', name: 'Berlin', state: 'Berlin', tier: 'tier1', country: 'Germany', region: 'Berlin' },
    { id: 'munich', name: 'Munich', state: 'Bavaria', tier: 'tier1', country: 'Germany', region: 'Bavaria' },

    // Japan
    { id: 'tokyo', name: 'Tokyo', state: 'Tokyo', tier: 'tier1', country: 'Japan', region: 'Tokyo' },
    { id: 'osaka', name: 'Osaka', state: 'Osaka', tier: 'tier1', country: 'Japan', region: 'Osaka' },

    // Qatar
    { id: 'doha', name: 'Doha', state: 'Doha', tier: 'tier1', country: 'Qatar', region: 'Qatar' },

    // Oman
    { id: 'muscat', name: 'Muscat', state: 'Muscat', tier: 'tier1', country: 'Oman', region: 'Oman' },
  ],
  stateRules: [
    { state: 'Karnataka', stampDutyPercent: 5.0, femaleRebatePercent: 1.0, registrationPercent: 1.0 },
    { state: 'Maharashtra', stampDutyPercent: 5.0, femaleRebatePercent: 1.0, registrationPercent: 1.0 },
    { state: 'Telangana', stampDutyPercent: 6.0, registrationPercent: 1.0 },
    { state: 'Andhra Pradesh', stampDutyPercent: 5.0, registrationPercent: 1.0 },
    { state: 'Delhi', stampDutyPercent: 6.0, femaleRebatePercent: 2.0, registrationPercent: 1.0 },
    { state: 'Tamil Nadu', stampDutyPercent: 7.0, registrationPercent: 1.0 },
    { state: 'West Bengal', stampDutyPercent: 6.0, registrationPercent: 1.0 },
    { state: 'Gujarat', stampDutyPercent: 4.9, registrationPercent: 1.0 },
    { state: 'Kerala', stampDutyPercent: 8.0, registrationPercent: 2.0 },
    { state: 'Rajasthan', stampDutyPercent: 5.0, femaleRebatePercent: 1.0, registrationPercent: 1.0 },
    { state: 'Uttar Pradesh', stampDutyPercent: 7.0, femaleRebatePercent: 2.0, registrationPercent: 1.0 },
    { state: 'Chandigarh', stampDutyPercent: 6.0, femaleRebatePercent: 2.0, registrationPercent: 1.0 },
    { state: 'Madhya Pradesh', stampDutyPercent: 7.5, femaleRebatePercent: 1.0, registrationPercent: 1.0 },
  ],
};

export function findCityById(cityId: string): City | undefined {
  return activeRuleSet.cities.find(c => c.id === cityId);
}

export function getStateRuleForCity(cityId: string): StateRule {
  const city = findCityById(cityId);
  if (!city) throw new Error('Unknown city');
  const rule = activeRuleSet.stateRules.find(r => r.state === city.state);
  if (!rule) throw new Error('No rules configured for state');
  return rule;
}

export function getDefaultLandRatePerSqft(cityId: string, location: 'cityCore' | 'suburb'): number {
  const city = findCityById(cityId);
  if (!city) throw new Error('Unknown city');
  if (city.tier === 'tier1') {
    return location === 'cityCore' ? 10000 : 6000;
  }
  if (city.tier === 'tier2') {
    return location === 'cityCore' ? 6000 : 3500;
  }
  return location === 'cityCore' ? 3500 : 2000;
}

export const cities = activeRuleSet.cities;

export function regionPathForCity(cityId: string): string | undefined {
  const city = findCityById(cityId);
  if (!city) return undefined;
  const country = (city.country || 'India').toLowerCase();
  const region = city.region?.replace(/\s+/g, '').toLowerCase();
  if (!region) return undefined;
  return `${country}/${region}.json`;
}

