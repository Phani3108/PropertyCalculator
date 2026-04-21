import fs from 'fs';
import path from 'path';

// Type definitions
export type HouseParams = {
  city: string;
  plotSqft: number;
  builtUpSqft: number;
  landLocation: 'cityCore' | 'suburb' | 'custom';
  customLandRate?: number;
  quality: 'basic' | 'standard' | 'luxury';
  includePermits: boolean;
};

export type HouseResult = {
  materialCost: number;
  labourCost: number;
  permitCost?: number;
  landCost?: number;
  totalBuildCost: number;
  timelineMonths: number;
  stateInfo?: {
    state: string;
    unskilled: number;
    skilled: number;
  };
  cityInfo?: any;
  permitList?: string[];
  materialsBreakdown?: {
    cement?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
    steel?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
    sand?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
    bricks?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
  };
};

/**
 * Estimate the cost of building a house
 * 
 * @param params Parameters for house building calculation
 * @returns Calculation result with cost breakdown
 */
export function estimateHouseBuild(params: HouseParams): HouseResult {
  const {
    city,
    plotSqft,
    builtUpSqft,
    landLocation,
    customLandRate,
    quality,
    includePermits
  } = params;

  // Load unified config data and other files
  const configPath = path.join(__dirname, '../data/config.json');
  const wagesPath = path.join(__dirname, '../data/wages.json');
  const materialsPath = path.join(__dirname, '../data/materials.json');

  const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const cityCostsData = configData.cities;
  const wagesData = JSON.parse(fs.readFileSync(wagesPath, 'utf-8'));
  const materialsData = JSON.parse(fs.readFileSync(materialsPath, 'utf-8'));
  
  // Get city data or fall back to nearest tier average
  const cityData = cityCostsData[city] || getFallbackCityData(city, cityCostsData);
  
  // Get state from city data
  const state = cityData.state;
  
  // Get wages data for the state
  const stateWages = wagesData[state] || {
    unskilled: 650,
    skilled: 780
  };
  
  // Get quality multiplier
  const qualityMultiplier = materialsData.qualityMultipliers[quality];
  
  // Get construction rate per sqft based on city and quality
  const rate = cityData.construction.avg * qualityMultiplier;
  
  // Material vs Labor split (40:60 by default)
  const materialRatio = 0.4;
  const labourRatio = 0.6;
  
  // Calculate material and labor costs
  const materialCost = rate * materialRatio * builtUpSqft * cityData.materialIndex;
  const labourCost = rate * labourRatio * builtUpSqft * cityData.laborIndex;
  
  // Calculate permit costs if included
  let permitCost = 0;
  if (includePermits) {
    permitCost = (materialCost + labourCost) * cityData.permitPercent;
  }
  
  // Calculate land cost if not custom
  let landCost;
  if (landLocation !== 'custom') {
    landCost = cityData.land[landLocation] * plotSqft;
  } else if (customLandRate) {
    landCost = customLandRate * plotSqft;
  }
  
  // Calculate total build cost
  let totalBuildCost = materialCost + labourCost + permitCost;
  if (landCost) {
    totalBuildCost += landCost;
  }
  
  // Calculate timeline
  const timelineMonths = Math.ceil(builtUpSqft / 1000) * cityData.timelineMonthsPer1000Sqft;
  
  // Get permit list for the state
  const permitList = materialsData.permits[state] || materialsData.permits.default;
  
  // Calculate materials breakdown
  const materialsBreakdown = calculateMaterialsBreakdown(state, builtUpSqft, materialsData);
  
  return {
    materialCost,
    labourCost,
    permitCost: includePermits ? permitCost : undefined,
    landCost,
    totalBuildCost,
    timelineMonths,
    stateInfo: {
      state,
      unskilled: stateWages.unskilled,
      skilled: stateWages.skilled
    },
    cityInfo: cityData,
    permitList: includePermits ? permitList : undefined,
    materialsBreakdown
  };
}

/**
 * Calculate detailed breakdown of material costs
 * 
 * @param state State name
 * @param builtUpSqft Built-up area in square feet
 * @param materialsData Material data with prices
 * @returns Breakdown of material quantities and costs
 */
function calculateMaterialsBreakdown(state: string, builtUpSqft: number, materialsData: any) {
  // Approximations for materials needed per 100 sqft of construction
  // These are rough estimates and will vary based on design, structure, etc.
  const cementPerSqft = 0.4; // bags per 100 sqft
  const steelPerSqft = 0.07; // tons per 100 sqft
  const sandPerSqft = 5; // cft per 100 sqft
  const bricksPerSqft = 60; // bricks per 100 sqft
  
  // Calculate quantities
  const cementQuantity = (builtUpSqft / 100) * cementPerSqft;
  const steelQuantity = (builtUpSqft / 100) * steelPerSqft;
  const sandQuantity = (builtUpSqft / 100) * sandPerSqft;
  const bricksQuantity = (builtUpSqft / 100) * bricksPerSqft;
  
  // Get prices based on state or default
  const cementPrice = materialsData.materials.cement.pricePerBag[state] || 
                     materialsData.materials.cement.pricePerBag.default;
  
  const steelPrice = materialsData.materials.steel.pricePerTon[state] || 
                     materialsData.materials.steel.pricePerTon.default;
  
  const sandPrice = materialsData.materials.sand.pricePerCft[state] || 
                   materialsData.materials.sand.pricePerCft.default;
  
  const bricksPrice = materialsData.materials.bricks.pricePerPiece[state] || 
                     materialsData.materials.bricks.pricePerPiece.default;
  
  // Calculate costs
  const cementCost = cementQuantity * cementPrice;
  const steelCost = steelQuantity * steelPrice;
  const sandCost = sandQuantity * sandPrice;
  const bricksCost = bricksQuantity * bricksPrice;
  
  return {
    cement: {
      quantity: cementQuantity,
      cost: cementCost,
      pricePerUnit: cementPrice,
      unit: materialsData.materials.cement.unit
    },
    steel: {
      quantity: steelQuantity,
      cost: steelCost,
      pricePerUnit: steelPrice,
      unit: materialsData.materials.steel.unit
    },
    sand: {
      quantity: sandQuantity,
      cost: sandCost,
      pricePerUnit: sandPrice,
      unit: materialsData.materials.sand.unit
    },
    bricks: {
      quantity: bricksQuantity,
      cost: bricksCost,
      pricePerUnit: bricksPrice,
      unit: materialsData.materials.bricks.unit
    }
  };
}

/**
 * Get fallback city data if the requested city is not found
 * (This function is similar to the one in flatEngine.ts but included here for completeness)
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
    
    return {
      ...(avgData as object),
      _fallbackNote: `Generic ${avgData.region} data (averaged from similar cities)`
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

export default estimateHouseBuild;
