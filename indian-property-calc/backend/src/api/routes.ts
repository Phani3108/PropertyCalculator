import express from 'express';
import { z } from 'zod';
import estimateFlatPurchase, { FlatParams } from '../engines/flatEngine.js';
import estimateHouseBuild, { HouseParams } from '../engines/houseEngine.js';
import compareCities, { ComparisonParams } from '../engines/comparisonEngine.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get all cities
router.get('/cities', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../data/config.json');
    const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const cityData = configData.cities;

    // Transform data to match frontend expectations
    const cities = cityData.map((city: any) => ({
      id: uuidv4(), // Generate a unique ID for each city
      name: city.name,
      state: city.state,
      tier: city.tier
    }));

    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities data' });
  }
});

// Get construction costs
router.get('/construction-costs', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../data/config.json');
    const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const cityData = configData.cities;

    const constructionCosts = cityData.flatMap((city: any) => 
      ['basic', 'standard', 'luxury'].map(quality => ({
        id: uuidv4(),
        city_id: city.name, // Using city name as ID since that's what we have
        quality_level: quality,
        base_rate: city.costs[quality]
      }))
    );

    res.json(constructionCosts);
  } catch (error) {
    console.error('Error fetching construction costs:', error);
    res.status(500).json({ error: 'Failed to fetch construction costs data' });
  }
});

// Get land costs
router.get('/land-costs', async (req, res) => {
  try {
    const cityCostsPath = path.join(__dirname, '../data/city-costs.json');
    const cityData = JSON.parse(await fs.readFile(cityCostsPath, 'utf-8'));
    
    const landCosts = cityData.flatMap((city: any) => 
      ['cityCore', 'suburb'].map(location => ({
        id: uuidv4(),
        city_id: city.name, // Using city name as ID since that's what we have
        location_type: location,
        rate_per_sqft: city.landCosts[location]
      }))
    );
    
    res.json(landCosts);
  } catch (error) {
    console.error('Error fetching land costs:', error);
    res.status(500).json({ error: 'Failed to fetch land costs data' });
  }
});

// Calculate property cost
router.post('/calculate', async (req, res) => {
  try {
    const calculationSchema = z.object({
      city_id: z.string(),
      property_type: z.enum(['residential', 'commercial']),
      quality_level: z.enum(['basic', 'standard', 'luxury']),
      location_type: z.enum(['cityCore', 'suburb']),
      land_area: z.string().transform(Number),
      built_up_area: z.string().transform(Number)
    });

    const data = calculationSchema.parse(req.body);
    
    // Read city data
    const cityCostsPath = path.join(__dirname, '../data/city-costs.json');
    const cityData = JSON.parse(await fs.readFile(cityCostsPath, 'utf-8'));
    const city = cityData.find((c: any) => c.name === data.city_id);
    
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Calculate costs
    const constructionRate = city.costs[data.quality_level];
    const landRate = city.landCosts[data.location_type];
    const laborRate = city.wages.skilled; // Using skilled labor rate
    
    const construction_cost = constructionRate * Number(data.built_up_area);
    const land_cost = landRate * Number(data.land_area);
    const labor_cost = laborRate * Number(data.built_up_area) * 0.3; // Assuming labor is 30% of built-up area cost
    const material_cost = construction_cost * 0.7; // Assuming materials are 70% of construction cost
    const stamp_duty = (land_cost + construction_cost) * 0.06; // Assuming 6% stamp duty
    
    const result = {
      construction_cost,
      land_cost,
      labor_cost,
      material_cost,
      stamp_duty,
      total_cost: construction_cost + land_cost + labor_cost + stamp_duty
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating property cost:', error);
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to calculate property cost' });
  }
});

// Flat purchase estimation
router.post('/flat', (req, res) => {
  try {
    // Define validation schema
    const flatParamsSchema = z.object({
      city: z.string(),
      builtUpSqft: z.number().min(100).max(10000),
      budgetQuality: z.enum(['basic', 'standard', 'luxury']),
      gender: z.enum(['male', 'female']),
      pmayToggle: z.boolean(),
      gstToggle: z.boolean(),
      loanPercent: z.number().min(0).max(100).optional(),
      interestRate: z.number().min(4).max(20).optional(),
      loanTenureYears: z.number().min(1).max(30).optional()
    });
    
    // Validate request body
    const validatedParams = flatParamsSchema.parse(req.body);
    
    // Set processing start time
    const startTime = Date.now();
    
    // Call estimation function
    const result = estimateFlatPurchase(validatedParams);
    
    // Check if processing took too long
    const processingTime = Date.now() - startTime;
    const stale = processingTime > 2000;
    
    res.json({
      ...result,
      stale
    });
  } catch (error) {
    console.error('Error estimating flat purchase:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(422).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to estimate flat purchase' });
  }
});

// House build estimation
router.post('/house', (req, res) => {
  try {
    // Define validation schema
    const houseParamsSchema = z.object({
      city: z.string(),
      plotSqft: z.number().min(100).max(100000),
      builtUpSqft: z.number().min(100).max(10000),
      landLocation: z.enum(['cityCore', 'suburb', 'custom']),
      customLandRate: z.number().optional(),
      quality: z.enum(['basic', 'standard', 'luxury']),
      includePermits: z.boolean()
    });
    
    // Validate request body
    const validatedParams = houseParamsSchema.parse(req.body);
    
    // Validate customLandRate is provided when landLocation is 'custom'
    if (validatedParams.landLocation === 'custom' && validatedParams.customLandRate === undefined) {
      return res.status(422).json({ 
        error: 'Validation error', 
        details: [{ 
          path: ['customLandRate'], 
          message: 'customLandRate is required when landLocation is custom' 
        }] 
      });
    }
    
    // Set processing start time
    const startTime = Date.now();
    
    // Call estimation function
    const result = estimateHouseBuild(validatedParams);
    
    // Check if processing took too long
    const processingTime = Date.now() - startTime;
    const stale = processingTime > 2000;
    
    res.json({
      ...result,
      stale
    });
  } catch (error) {
    console.error('Error estimating house build:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(422).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to estimate house build' });
  }
});

// City comparison
router.get('/compare', (req, res) => {
  try {
    // Extract cities from query param
    const citiesParam = req.query.cities as string;
    
    if (!citiesParam) {
      return res.status(422).json({ 
        error: 'Validation error', 
        details: [{ 
          path: ['cities'], 
          message: 'cities parameter is required' 
        }] 
      });
    }
    
    const cities = citiesParam.split(',');
    
    // Get other optional parameters
    const builtUpSqft = req.query.builtUpSqft ? parseInt(req.query.builtUpSqft as string) : undefined;
    const plotSqft = req.query.plotSqft ? parseInt(req.query.plotSqft as string) : undefined;
    const quality = req.query.quality as 'basic' | 'standard' | 'luxury' | undefined;
    const comparisonType = req.query.type as 'flat' | 'house' | 'both' | undefined;
    
    // Define comparison parameters
    const comparisonParams: ComparisonParams = {
      cities,
      builtUpSqft,
      plotSqft,
      quality,
      comparisonType
    };
    
    // Set processing start time
    const startTime = Date.now();
    
    // Call comparison function
    const result = compareCities(comparisonParams);
    
    // Check if processing took too long
    const processingTime = Date.now() - startTime;
    const stale = processingTime > 2000;
    
    res.json({
      ...result,
      stale
    });
  } catch (error) {
    console.error('Error comparing cities:', error);
    res.status(500).json({ error: 'Failed to compare cities' });
  }
});

export default router;
