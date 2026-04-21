import { Decimal } from 'decimal.js';
import fs from 'fs';
import path from 'path';

// Type definitions
export type FlatParams = {
  city: string;
  builtUpSqft: number;
  budgetQuality: 'basic' | 'standard' | 'luxury';
  gender: 'male' | 'female';
  pmayToggle: boolean;
  gstToggle: boolean;
  loanPercent?: number;
  interestRate?: number;
  loanTenureYears?: number;
};

export type FlatResult = {
  baseCost: number;
  gst: number;
  stampDuty: number;
  registration: number;
  totalPayable: number;
  emi: number;
  subsidySavings?: number;
  stateInfo?: {
    state: string;
    dutyPercent: number;
    femaleRebate: number;
    registrationPercent: number;
    note: string;
  };
  cityInfo?: any;
  additionalCosts?: {
    brokerageLegalFees: number;
    furnishingSetupCosts: number;
    maintenance: number;
    propertyTax: number;
  };
};

/**
 * Estimate the cost of purchasing a flat
 * 
 * @param params Parameters for flat purchase calculation
 * @returns Calculation result with cost breakdown
 */
export function estimateFlatPurchase(params: FlatParams): FlatResult {
  const {
    city,
    builtUpSqft,
    budgetQuality,
    gender,
    pmayToggle,
    gstToggle,
    loanPercent = 80,
    interestRate = 8.5,
    loanTenureYears = 20
  } = params;

  // Load unified config data
  const configPath = path.join(__dirname, '../data/config.json');
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const cityCostsData = configData.cities;
  const stampDutyData = configData.stampDuty;

  // Get city data or fall back to nearest tier average
  const cityData = cityCostsData.find((c: any) => c.name === city) || getFallbackCityData(city, cityCostsData);

  // Get state from city data
  const state = cityData.state;

  // Get stamp duty data for the state
  const stateStampDuty = (stampDutyData.find((s: any) => s.state === state)?.rates[0]) || {
    rate: 5,
    additionalCharges: {},
    note: "Default values used as state data not available"
  };
  
  // Get quality multiplier
  const qualityMultiplier = getQualityMultiplier(budgetQuality);
  
  // Calculate base cost
  // For flats, we use city's average construction cost × quality multiplier × sqft × developer margin
  const developerMargin = 1.25; // 25% developer margin for flats
  const constructionCostPerSqft = cityData.construction.avg * qualityMultiplier;
  const baseCost = constructionCostPerSqft * builtUpSqft * developerMargin;
  
  // Calculate GST
  // 1% if affordable housing (< 45L) and GST toggle is on, else 5%
  const isAffordable = baseCost < 4500000 && gstToggle;
  const gstRate = isAffordable ? 0.01 : 0.05;
  const gst = gstToggle ? baseCost * gstRate : 0;
  
  // Calculate stamp duty with gender-based rebate
  const dutyPercent = stateStampDuty.dutyPercent;
  const femaleRebate = gender === 'female' ? stateStampDuty.femaleRebate : 0;
  const effectiveDutyPercent = Math.max(0, dutyPercent - femaleRebate);
  const stampDuty = baseCost * (effectiveDutyPercent / 100);
  
  // Calculate registration charges
  const registrationPercent = stateStampDuty.registrationPercent;
  const registration = baseCost * (registrationPercent / 100);
  
  // Calculate total payable
  const totalPayable = baseCost + gst + stampDuty + registration;
  
  // Calculate loan amount and EMI
  const loanAmount = totalPayable * (loanPercent / 100);
  const loanTenureMonths = loanTenureYears * 12;
  
  // Import EMI calculation function
  const { calcEmi } = require('./emiEngine');
  const emiResult = calcEmi(
    loanAmount,
    interestRate,
    loanTenureMonths,
    pmayToggle,
    baseCost,
    builtUpSqft
  );
  
  // Calculate additional costs
  const brokerageLegalFees = totalPayable * cityData.brokerageLegalFees;
  const furnishingSetupCosts = totalPayable * cityData.furnishingSetupCosts;
  const maintenance = builtUpSqft * cityData.maintenancePerSqftPerMonth * 12 * 20;
  const propertyTax = builtUpSqft * cityData.propertyTaxRate[city] * 20;

  // Update total payable to include additional costs
  const totalPayableWithExtras = totalPayable + brokerageLegalFees + furnishingSetupCosts + maintenance + propertyTax;

  return {
    baseCost,
    gst,
    stampDuty,
    registration,
    totalPayable: totalPayableWithExtras,
    emi: emiResult.emi,
    subsidySavings: emiResult.subsidySavings,
    stateInfo: {
      state,
      dutyPercent,
      femaleRebate: stateStampDuty.femaleRebate,
      registrationPercent,
      note: stateStampDuty.note
    },
    cityInfo: cityData,
    additionalCosts: {
      brokerageLegalFees,
      furnishingSetupCosts,
      maintenance,
      propertyTax
    }
  };
}

/**
 * Get quality multiplier based on budget quality
 * 
 * @param quality Budget quality level
 * @returns Multiplier value
 */
function getQualityMultiplier(quality: 'basic' | 'standard' | 'luxury'): number {
  const multipliers = {
    'basic': 0.8,
    'standard': 1.0,
    'luxury': 1.3
  };
  
  return multipliers[quality];
}

/**
 * Get fallback city data if the requested city is not found
 * 
 * @param requestedCity Name of the requested city
 * @param citiesData Complete city data
 * @returns Fallback city data
 */
function getFallbackCityData(requestedCity: string, citiesData: any): any {
  console.warn(`City data not found for ${requestedCity}, using fallback data.`);
  
  // Try to determine region or state from the name
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  // Use hardcoded states or extract from config if needed
  const states = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu',
    'Gujarat', 'West Bengal', 'Uttar Pradesh'
  ];
  
  let fallbackRegion = '';
  let fallbackState = '';
  
  // Check if city name contains any region or state hint
  for (const region of regions) {
    if (requestedCity.toLowerCase().includes(region.toLowerCase())) {
      fallbackRegion = region;
      break;
    }
  }
  
  for (const state of states) {
    if (requestedCity.toLowerCase().includes(state.toLowerCase())) {
      fallbackState = state;
      break;
    }
  }
  
  // Find cities in the same region or state to average from
  const similarCities = Object.entries(citiesData).filter(([_, data]: [string, any]) => {
    return (
      (fallbackRegion && data.region === fallbackRegion) ||
      (fallbackState && data.state === fallbackState)
    );
  });
  
  if (similarCities.length > 0) {
    // Average the values from similar cities
    const avgData = {
      construction: {
        min: 0,
        avg: 0,
        max: 0
      },
      laborIndex: 0,
      materialIndex: 0,
      permitPercent: 0,
      timelineMonthsPer1000Sqft: 0,
      timelineHighriseMonths: 0,
      land: {
        cityCore: 0,
        suburb: 0
      },
      tier: "generic",
      state: fallbackState || "Unknown",
      region: fallbackRegion || "Unknown"
    };
    
    similarCities.forEach(([_, data]: [string, any]) => {
      avgData.construction.min += data.construction.min;
      avgData.construction.avg += data.construction.avg;
      avgData.construction.max += data.construction.max;
      avgData.laborIndex += data.laborIndex;
      avgData.materialIndex += data.materialIndex;
      avgData.permitPercent += data.permitPercent;
      avgData.timelineMonthsPer1000Sqft += data.timelineMonthsPer1000Sqft;
      avgData.timelineHighriseMonths += data.timelineHighriseMonths;
      avgData.land.cityCore += data.land.cityCore;
      avgData.land.suburb += data.land.suburb;
      
      // Take the first city's state and region if not already determined
      if (!fallbackState) avgData.state = data.state;
      if (!fallbackRegion) avgData.region = data.region;
    });
    
    // Calculate averages
    const count = similarCities.length;
    avgData.construction.min /= count;
    avgData.construction.avg /= count;
    avgData.construction.max /= count;
    avgData.laborIndex /= count;
    avgData.materialIndex /= count;
    avgData.permitPercent /= count;
    avgData.timelineMonthsPer1000Sqft /= count;
    avgData.timelineHighriseMonths /= count;
    avgData.land.cityCore /= count;
    avgData.land.suburb /= count;
    
    avgData.tier = determineTier(avgData);
    
    return {
      ...(avgData as object),
      _fallbackNote: `Generic Tier-${avgData.tier} ${avgData.region} data (averaged from similar cities)`
    };
  }
  
  // If no similar cities found, use a default tier-2 city
  const defaultCity = Object.entries(citiesData).find(([_, data]: [string, any]) => data.tier === "2");
  
  if (defaultCity) {
    const [cityName, cityData] = defaultCity;
    return {
      ...(cityData as object),
      _fallbackNote: `Fallback to ${cityName} data as no similar city found`
    };
  }
  
  // Last resort: average all cities
  const avgAllCities = averageAllCitiesData(citiesData);
  return {
    ...(avgAllCities as object),
    _fallbackNote: "Generic averaged data from all cities"
  };
}

/**
 * Determine tier based on city data
 * 
 * @param cityData City data
 * @returns Tier classification
 */
function determineTier(cityData: any): string {
  // Use construction costs and land prices to determine tier
  if (
    cityData.construction.avg > 2500 ||
    cityData.land.cityCore > 25000
  ) {
    return "1";
  } else if (
    cityData.construction.avg > 2000 ||
    cityData.land.cityCore > 15000
  ) {
    return "2";
  } else {
    return "3";
  }
}

/**
 * Average all cities data
 * 
 * @param citiesData Complete city data
 * @returns Averaged data
 */
function averageAllCitiesData(citiesData: any): any {
  const avgData = {
    construction: {
      min: 0,
      avg: 0,
      max: 0
    },
    laborIndex: 0,
    materialIndex: 0,
    permitPercent: 0,
    timelineMonthsPer1000Sqft: 0,
    timelineHighriseMonths: 0,
    land: {
      cityCore: 0,
      suburb: 0
    },
    tier: "generic",
    state: "Unknown",
    region: "Unknown"
  };
  
  const cities = Object.entries(citiesData);
  
  cities.forEach(([_, data]: [string, any]) => {
    avgData.construction.min += data.construction.min;
    avgData.construction.avg += data.construction.avg;
    avgData.construction.max += data.construction.max;
    avgData.laborIndex += data.laborIndex;
    avgData.materialIndex += data.materialIndex;
    avgData.permitPercent += data.permitPercent;
    avgData.timelineMonthsPer1000Sqft += data.timelineMonthsPer1000Sqft;
    avgData.timelineHighriseMonths += data.timelineHighriseMonths;
    avgData.land.cityCore += data.land.cityCore;
    avgData.land.suburb += data.land.suburb;
  });
  
  // Calculate averages
  const count = cities.length;
  avgData.construction.min /= count;
  avgData.construction.avg /= count;
  avgData.construction.max /= count;
  avgData.laborIndex /= count;
  avgData.materialIndex /= count;
  avgData.permitPercent /= count;
  avgData.timelineMonthsPer1000Sqft /= count;
  avgData.timelineHighriseMonths /= count;
  avgData.land.cityCore /= count;
  avgData.land.suburb /= count;
  
  return avgData;
}

export default estimateFlatPurchase;
