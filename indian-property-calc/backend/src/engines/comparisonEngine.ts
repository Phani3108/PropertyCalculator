import fs from 'fs';
import path from 'path';
import { estimateFlatPurchase, FlatParams, FlatResult } from './flatEngine.js';
import { estimateHouseBuild, HouseParams, HouseResult } from './houseEngine.js';

// Types
export type ComparisonParams = {
  cities: string[];
  builtUpSqft?: number;
  plotSqft?: number;
  quality?: 'basic' | 'standard' | 'luxury';
  comparisonType?: 'flat' | 'house' | 'both';
};

export type ComparisonResult = {
  cities: {
    [city: string]: {
      flat?: {
        baseCost: number;
        totalPayable: number;
        emi: number;
        stampDuty: number;
        state: string;
        tier: string;
        region: string;
      };
      house?: {
        materialCost: number;
        labourCost: number;
        totalBuildCost: number;
        timelineMonths: number;
        state: string;
        tier: string;
        region: string;
      };
    };
  };
  stateWiseAnalysis?: {
    [state: string]: {
      avgFlatCost?: number;
      avgHouseCost?: number;
      avgStampDuty?: number;
      avgConstructionRate?: number;
      avgTimelineMonths?: number;
      avgLandRate?: number;
      cities: string[];
    };
  };
  regionWiseAnalysis?: {
    [region: string]: {
      avgFlatCost?: number;
      avgHouseCost?: number;
      states: string[];
    };
  };
  tierWiseAnalysis?: {
    [tier: string]: {
      avgFlatCost?: number;
      avgHouseCost?: number;
      cities: string[];
    };
  };
};

/**
 * Compare property costs across multiple cities
 * 
 * @param params Comparison parameters
 * @returns Comparison results
 */
export function compareCities(params: ComparisonParams): ComparisonResult {
  const {
    cities,
    builtUpSqft = 1000,
    plotSqft = 2000,
    quality = 'standard',
    comparisonType = 'both'
  } = params;

  // Load unified config data
  const configPath = path.join(__dirname, '../data/config.json');
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const cityCostsData = configData.cities;
  
  // Initialize result object
  const result: ComparisonResult = {
    cities: {},
    stateWiseAnalysis: {},
    regionWiseAnalysis: {},
    tierWiseAnalysis: {}
  };
  
  // Track states, regions, and tiers
  const stateData: { [state: string]: { cities: string[], flatCosts: number[], houseCosts: number[], stampDuties: number[], constructionRates: number[], timelines: number[], landRates: number[] } } = {};
  const regionData: { [region: string]: { states: string[], flatCosts: number[], houseCosts: number[] } } = {};
  const tierData: { [tier: string]: { cities: string[], flatCosts: number[], houseCosts: number[] } } = {};
  
  // Process each city
  for (const city of cities) {
    result.cities[city] = {};
    
    const cityData = cityCostsData[city];
    if (!cityData) {
      console.warn(`City data not found for ${city}, skipping.`);
      continue;
    }
    
    const state = cityData.state;
    const region = cityData.region;
    const tier = cityData.tier;
    
    // Initialize state data if not already
    if (!stateData[state]) {
      stateData[state] = {
        cities: [],
        flatCosts: [],
        houseCosts: [],
        stampDuties: [],
        constructionRates: [],
        timelines: [],
        landRates: []
      };
    }
    
    // Initialize region data if not already
    if (!regionData[region]) {
      regionData[region] = {
        states: [],
        flatCosts: [],
        houseCosts: []
      };
    }
    
    // Initialize tier data if not already
    if (!tierData[tier]) {
      tierData[tier] = {
        cities: [],
        flatCosts: [],
        houseCosts: []
      };
    }
    
    // Add city to state's list
    if (!stateData[state].cities.includes(city)) {
      stateData[state].cities.push(city);
    }
    
    // Add state to region's list
    if (!regionData[region].states.includes(state)) {
      regionData[region].states.push(state);
    }
    
    // Add city to tier's list
    if (!tierData[tier].cities.includes(city)) {
      tierData[tier].cities.push(city);
    }
    
    // Calculate flat costs if needed
    if (comparisonType === 'flat' || comparisonType === 'both') {
      const flatParams: FlatParams = {
        city,
        builtUpSqft,
        budgetQuality: quality,
        gender: 'male', // Default to male for comparison
        pmayToggle: false,
        gstToggle: true
      };
      
      const flatResult = estimateFlatPurchase(flatParams);
      
      result.cities[city].flat = {
        baseCost: flatResult.baseCost,
        totalPayable: flatResult.totalPayable,
        emi: flatResult.emi,
        stampDuty: flatResult.stampDuty,
        state,
        tier,
        region
      };
      
      // Add to state data
      stateData[state].flatCosts.push(flatResult.totalPayable);
      stateData[state].stampDuties.push(flatResult.stampDuty);
      
      // Add to region data
      regionData[region].flatCosts.push(flatResult.totalPayable);
      
      // Add to tier data
      tierData[tier].flatCosts.push(flatResult.totalPayable);
    }
    
    // Calculate house costs if needed
    if (comparisonType === 'house' || comparisonType === 'both') {
      const houseParams: HouseParams = {
        city,
        plotSqft,
        builtUpSqft,
        landLocation: 'suburb', // Default to suburb for comparison
        quality,
        includePermits: true
      };
      
      const houseResult = estimateHouseBuild(houseParams);
      
      result.cities[city].house = {
        materialCost: houseResult.materialCost,
        labourCost: houseResult.labourCost,
        totalBuildCost: houseResult.totalBuildCost,
        timelineMonths: houseResult.timelineMonths,
        state,
        tier,
        region
      };
      
      // Add to state data
      stateData[state].houseCosts.push(houseResult.totalBuildCost);
      stateData[state].constructionRates.push(cityData.construction.avg);
      stateData[state].timelines.push(houseResult.timelineMonths);
      stateData[state].landRates.push(cityData.land.suburb);
      
      // Add to region data
      regionData[region].houseCosts.push(houseResult.totalBuildCost);
      
      // Add to tier data
      tierData[tier].houseCosts.push(houseResult.totalBuildCost);
    }
  }
  
  // Calculate state-wise analysis
  result.stateWiseAnalysis = {};
  
  Object.entries(stateData).forEach(([state, data]) => {
    result.stateWiseAnalysis![state] = {
      cities: data.cities,
      avgFlatCost: data.flatCosts.length > 0 ? 
        data.flatCosts.reduce((sum, cost) => sum + cost, 0) / data.flatCosts.length : 
        undefined,
      avgHouseCost: data.houseCosts.length > 0 ? 
        data.houseCosts.reduce((sum, cost) => sum + cost, 0) / data.houseCosts.length : 
        undefined,
      avgStampDuty: data.stampDuties.length > 0 ? 
        data.stampDuties.reduce((sum, duty) => sum + duty, 0) / data.stampDuties.length : 
        undefined,
      avgConstructionRate: data.constructionRates.length > 0 ? 
        data.constructionRates.reduce((sum, rate) => sum + rate, 0) / data.constructionRates.length : 
        undefined,
      avgTimelineMonths: data.timelines.length > 0 ? 
        data.timelines.reduce((sum, time) => sum + time, 0) / data.timelines.length : 
        undefined,
      avgLandRate: data.landRates.length > 0 ? 
        data.landRates.reduce((sum, rate) => sum + rate, 0) / data.landRates.length : 
        undefined
    };
  });
  
  // Calculate region-wise analysis
  result.regionWiseAnalysis = {};
  
  Object.entries(regionData).forEach(([region, data]) => {
    result.regionWiseAnalysis![region] = {
      states: data.states,
      avgFlatCost: data.flatCosts.length > 0 ? 
        data.flatCosts.reduce((sum, cost) => sum + cost, 0) / data.flatCosts.length : 
        undefined,
      avgHouseCost: data.houseCosts.length > 0 ? 
        data.houseCosts.reduce((sum, cost) => sum + cost, 0) / data.houseCosts.length : 
        undefined
    };
  });
  
  // Calculate tier-wise analysis
  result.tierWiseAnalysis = {};
  
  Object.entries(tierData).forEach(([tier, data]) => {
    result.tierWiseAnalysis![tier] = {
      cities: data.cities,
      avgFlatCost: data.flatCosts.length > 0 ? 
        data.flatCosts.reduce((sum, cost) => sum + cost, 0) / data.flatCosts.length : 
        undefined,
      avgHouseCost: data.houseCosts.length > 0 ? 
        data.houseCosts.reduce((sum, cost) => sum + cost, 0) / data.houseCosts.length : 
        undefined
    };
  });
  
  return result;
}

export default compareCities;
