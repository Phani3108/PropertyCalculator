export type CityTier = 'tier1' | 'tier2' | 'tier3';

export interface Pincode {
  code: string;
  locality: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  tier: CityTier;
  country?: string;
  region?: string;
  pincodes?: Pincode[];
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
    { id: 'blr', name: 'Bengaluru', state: 'Karnataka', tier: 'tier1', country: 'India', region: 'Karnataka', pincodes: [
      { code: '560001', locality: 'MG Road / Brigade Road' }, { code: '560004', locality: 'Malleshwaram' },
      { code: '560008', locality: 'Shivajinagar' }, { code: '560034', locality: 'Koramangala' },
      { code: '560038', locality: 'Indiranagar' }, { code: '560066', locality: 'Whitefield' },
      { code: '560071', locality: 'Electronic City' }, { code: '560078', locality: 'Sarjapur Road' },
      { code: '560037', locality: 'Jayanagar' }, { code: '560103', locality: 'Yelahanka' },
    ]},
    { id: 'mum', name: 'Mumbai', state: 'Maharashtra', tier: 'tier1', country: 'India', region: 'Maharashtra', pincodes: [
      { code: '400001', locality: 'Fort / CST' }, { code: '400050', locality: 'Bandra West' },
      { code: '400053', locality: 'Andheri East' }, { code: '400058', locality: 'Andheri West' },
      { code: '400076', locality: 'Powai' }, { code: '400080', locality: 'Ghatkopar' },
      { code: '400093', locality: 'Mulund' }, { code: '400601', locality: 'Thane West' },
      { code: '400614', locality: 'Navi Mumbai – Vashi' }, { code: '400706', locality: 'Navi Mumbai – Kharghar' },
    ]},
    { id: 'hyd', name: 'Hyderabad', state: 'Telangana', tier: 'tier1', country: 'India', region: 'Telangana', pincodes: [
      { code: '500001', locality: 'Abids / GPO' }, { code: '500016', locality: 'Ameerpet' },
      { code: '500034', locality: 'Jubilee Hills' }, { code: '500038', locality: 'Banjara Hills' },
      { code: '500072', locality: 'Kukatpally' }, { code: '500081', locality: 'Gachibowli' },
      { code: '500084', locality: 'Madhapur / HITEC City' }, { code: '500090', locality: 'Kondapur' },
      { code: '500032', locality: 'Secunderabad' }, { code: '500008', locality: 'Begumpet' },
    ]},
    { id: 'pnq', name: 'Pune', state: 'Maharashtra', tier: 'tier1', country: 'India', region: 'Maharashtra', pincodes: [
      { code: '411001', locality: 'Shivajinagar' }, { code: '411004', locality: 'Kothrud' },
      { code: '411006', locality: 'Deccan Gymkhana' }, { code: '411014', locality: 'Hinjewadi' },
      { code: '411028', locality: 'Kharadi' }, { code: '411033', locality: 'Viman Nagar' },
      { code: '411038', locality: 'Wakad' }, { code: '411041', locality: 'Aundh' },
      { code: '411045', locality: 'Baner' }, { code: '411013', locality: 'Hadapsar' },
    ]},
    { id: 'del', name: 'Delhi', state: 'Delhi', tier: 'tier1', country: 'India', region: 'Delhi', pincodes: [
      { code: '110001', locality: 'Connaught Place' }, { code: '110003', locality: 'Civil Lines' },
      { code: '110017', locality: 'Hauz Khas' }, { code: '110019', locality: 'Lajpat Nagar' },
      { code: '110025', locality: 'Mayur Vihar' }, { code: '110030', locality: 'Vasant Vihar' },
      { code: '110048', locality: 'Saket' }, { code: '110057', locality: 'Vasant Kunj' },
      { code: '110075', locality: 'Dwarka' }, { code: '110092', locality: 'Shahdara' },
    ]},
    { id: 'chn', name: 'Chennai', state: 'Tamil Nadu', tier: 'tier1', country: 'India', region: 'TamilNadu', pincodes: [
      { code: '600001', locality: 'George Town / Parrys' }, { code: '600004', locality: 'Mylapore' },
      { code: '600006', locality: 'Nungambakkam' }, { code: '600017', locality: 'T. Nagar' },
      { code: '600040', locality: 'Anna Nagar' }, { code: '600020', locality: 'Adyar' },
      { code: '600042', locality: 'Velachery' }, { code: '600032', locality: 'Guindy' },
      { code: '600097', locality: 'OMR – Sholinganallur' }, { code: '600119', locality: 'Porur' },
    ]},
    { id: 'kol', name: 'Kolkata', state: 'West Bengal', tier: 'tier2', country: 'India', region: 'WestBengal', pincodes: [
      { code: '700001', locality: 'BBD Bagh / Dalhousie' }, { code: '700016', locality: 'Alipore' },
      { code: '700019', locality: 'Ballygunge' }, { code: '700020', locality: 'Park Street' },
      { code: '700029', locality: 'Gariahat' }, { code: '700064', locality: 'Salt Lake – Sector V' },
      { code: '700091', locality: 'Rajarhat' }, { code: '700156', locality: 'New Town' },
      { code: '700094', locality: 'EM Bypass / Anandapur' }, { code: '700034', locality: 'Behala' },
    ]},
    { id: 'amd', name: 'Ahmedabad', state: 'Gujarat', tier: 'tier2', country: 'India', region: 'Gujarat', pincodes: [
      { code: '380001', locality: 'Lal Darwaza / Old City' }, { code: '380006', locality: 'Navrangpura' },
      { code: '380009', locality: 'Paldi' }, { code: '380015', locality: 'Satellite' },
      { code: '380051', locality: 'Vastrapur' }, { code: '380054', locality: 'Bodakdev' },
      { code: '380058', locality: 'SG Highway' }, { code: '380059', locality: 'Prahlad Nagar' },
      { code: '380061', locality: 'Thaltej' }, { code: '382481', locality: 'Sanand / Gift City' },
    ]},
    { id: 'koc', name: 'Kochi', state: 'Kerala', tier: 'tier2', country: 'India', region: 'Kerala', pincodes: [
      { code: '682001', locality: 'Fort Kochi' }, { code: '682011', locality: 'Ernakulam South' },
      { code: '682016', locality: 'Edappally' }, { code: '682017', locality: 'Kaloor' },
      { code: '682019', locality: 'Kakkanad' }, { code: '682020', locality: 'Palarivattom' },
      { code: '682024', locality: 'Aluva' }, { code: '682030', locality: 'Tripunithura' },
      { code: '682037', locality: 'Maradu' }, { code: '682042', locality: 'Kalamassery' },
    ]},
    { id: 'jai', name: 'Jaipur', state: 'Rajasthan', tier: 'tier2', country: 'India', region: 'Rajasthan', pincodes: [
      { code: '302001', locality: 'MI Road / Pink City' }, { code: '302004', locality: 'Bani Park' },
      { code: '302012', locality: 'Raja Park' }, { code: '302015', locality: 'Malviya Nagar' },
      { code: '302017', locality: 'Jagatpura' }, { code: '302019', locality: 'Mansarovar' },
      { code: '302020', locality: 'Vaishali Nagar' }, { code: '302021', locality: 'Tonk Road' },
      { code: '302022', locality: 'Sitapura Industrial' }, { code: '302029', locality: 'Ajmer Road' },
    ]},
    { id: 'lko', name: 'Lucknow', state: 'Uttar Pradesh', tier: 'tier2', country: 'India', region: 'UttarPradesh', pincodes: [
      { code: '226001', locality: 'Hazratganj' }, { code: '226003', locality: 'Aminabad' },
      { code: '226010', locality: 'Gomti Nagar' }, { code: '226012', locality: 'Indira Nagar' },
      { code: '226016', locality: 'Aliganj' }, { code: '226020', locality: 'Mahanagar' },
      { code: '226021', locality: 'Vikas Nagar' }, { code: '226022', locality: 'Jankipuram' },
      { code: '226024', locality: 'Gomti Nagar Extension' }, { code: '226025', locality: 'Sushant Golf City' },
    ]},
    { id: 'chd', name: 'Chandigarh', state: 'Chandigarh', tier: 'tier2', country: 'India', region: 'Chandigarh', pincodes: [
      { code: '160001', locality: 'Sector 1–7' }, { code: '160009', locality: 'Sector 9' },
      { code: '160011', locality: 'Sector 11' }, { code: '160017', locality: 'Sector 17 (City Centre)' },
      { code: '160019', locality: 'Sector 19' }, { code: '160022', locality: 'Sector 22 (Market)' },
      { code: '160036', locality: 'Sector 36' }, { code: '160047', locality: 'Sector 47' },
      { code: '160055', locality: 'Sector 55 (Mohali border)' }, { code: '160062', locality: 'Manimajra' },
    ]},
    { id: 'cbr', name: 'Coimbatore', state: 'Tamil Nadu', tier: 'tier3', country: 'India', region: 'TamilNadu', pincodes: [
      { code: '641001', locality: 'Town Hall' }, { code: '641002', locality: 'RS Puram' },
      { code: '641004', locality: 'Peelamedu' }, { code: '641006', locality: 'Saibaba Colony' },
      { code: '641011', locality: 'Gandhipuram' }, { code: '641014', locality: 'Singanallur' },
      { code: '641018', locality: 'Ganapathy' }, { code: '641025', locality: 'Saravanampatti' },
      { code: '641035', locality: 'Kovaipudur' }, { code: '641045', locality: 'Vadavalli' },
    ]},
    { id: 'idr', name: 'Indore', state: 'Madhya Pradesh', tier: 'tier3', country: 'India', region: 'MadhyaPradesh', pincodes: [
      { code: '452001', locality: 'Rajwada / Old City' }, { code: '452002', locality: 'Palasia' },
      { code: '452003', locality: 'MG Road' }, { code: '452005', locality: 'Vijay Nagar' },
      { code: '452009', locality: 'Bhawarkuan' }, { code: '452010', locality: 'Scheme No. 54' },
      { code: '452011', locality: 'AB Road' }, { code: '452012', locality: 'Nipania' },
      { code: '452016', locality: 'Super Corridor' }, { code: '452020', locality: 'Rau' },
    ]},
    { id: 'viz', name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 'tier2', country: 'India', region: 'AndhraPradesh', pincodes: [
      { code: '530001', locality: 'One Town / Port Area' }, { code: '530002', locality: 'Two Town' },
      { code: '530003', locality: 'Dondaparthy' }, { code: '530004', locality: 'Seethammadhara' },
      { code: '530016', locality: 'NAD Junction' }, { code: '530017', locality: 'Gajuwaka' },
      { code: '530018', locality: 'MVP Colony' }, { code: '530020', locality: 'Rushikonda / Beach Road' },
      { code: '530040', locality: 'Madhurawada' }, { code: '530048', locality: 'Pendurthi' },
    ]},

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

