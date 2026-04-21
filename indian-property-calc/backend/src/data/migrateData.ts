import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CityData {
  name: string;
  state: string;
  tier: string;
  costs: {
    basic: number;
    standard: number;
    luxury: number;
  };
  landCosts: {
    cityCore: number;
    suburb: number;
  };
  wages: {
    skilled: number;
    unskilled: number;
  };
}

interface MaterialData {
  name: string;
  unit: string;
  baseCost: number;
  qualityMultipliers: {
    basic: number;
    standard: number;
    luxury: number;
  };
}

interface StampDutyData {
  state: string;
  propertyType: string;
  ratePercentage: number;
}

async function migrateData() {
  try {
    console.log('Starting database migration...');
    
    // Read schema file
    const schemaSQL = await readFile(join(__dirname, 'schema.sql'), 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const stmt of statements) {
      try {
        await db.exec(stmt);
      } catch (error) {
        console.error('Error executing statement:', stmt);
        console.error('Error details:', error);
        throw error;
      }
    }

    console.log('Schema created successfully');

    // Read data files
    const citiesData: CityData[] = JSON.parse(
      await readFile(join(__dirname, 'city-costs.json'), 'utf8')
    );
    const materialsData: MaterialData[] = JSON.parse(
      await readFile(join(__dirname, 'transformed-materials.json'), 'utf8')
    );
    const stampDutyData: StampDutyData[] = JSON.parse(
      await readFile(join(__dirname, 'transformed-stamp-duty.json'), 'utf8')
    );

    // Insert cities and related data
    for (const city of citiesData) {
      const cityId = uuidv4();
      
      // Insert city
      await db.run(
        'INSERT OR IGNORE INTO cities (id, name, state, tier) VALUES (?, ?, ?, ?)',
        [cityId, city.name, city.state, city.tier]
      );

      // Insert construction costs
      for (const [quality, cost] of Object.entries(city.costs)) {
        await db.run(
          'INSERT OR IGNORE INTO construction_costs (id, city_id, quality_type, cost_per_sqft) VALUES (?, ?, ?, ?)',
          [uuidv4(), cityId, quality, cost]
        );
      }

      // Insert land costs
      for (const [locationType, cost] of Object.entries(city.landCosts)) {
        await db.run(
          'INSERT OR IGNORE INTO land_costs (id, city_id, location_type, cost_per_sqft) VALUES (?, ?, ?, ?)',
          [uuidv4(), cityId, locationType, cost]
        );
      }

      // Insert labor wages
      for (const [laborType, wage] of Object.entries(city.wages)) {
        await db.run(
          'INSERT OR IGNORE INTO labor_wages (id, city_id, labor_type, daily_wage) VALUES (?, ?, ?, ?)',
          [uuidv4(), cityId, laborType, wage]
        );
      }
    }

    console.log('Cities and related data inserted successfully');

    // Insert materials
    for (const material of materialsData) {
      await db.run(
        `INSERT OR IGNORE INTO material_costs 
         (id, material_name, unit, base_cost, 
          quality_multiplier_basic, quality_multiplier_standard, quality_multiplier_luxury)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          material.name,
          material.unit,
          material.baseCost,
          material.qualityMultipliers.basic,
          material.qualityMultipliers.standard,
          material.qualityMultipliers.luxury
        ]
      );
    }

    console.log('Materials data inserted successfully');

    // Insert stamp duty rates
    for (const rate of stampDutyData) {
      await db.run(
        'INSERT OR IGNORE INTO stamp_duty_rates (id, state, property_type, rate_percentage) VALUES (?, ?, ?, ?)',
        [uuidv4(), rate.state, rate.propertyType, rate.ratePercentage]
      );
    }

    console.log('Stamp duty rates inserted successfully');

    // Log successful migration
    await db.run(
      'INSERT INTO data_refresh_log (id, data_type, status) VALUES (?, ?, ?)',
      [uuidv4(), 'initial_migration', 'success']
    );

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    
    // Log migration failure
    try {
      await db.run(
        'INSERT INTO data_refresh_log (id, data_type, status, error_message) VALUES (?, ?, ?, ?)',
        [uuidv4(), 'initial_migration', 'failed', String(error)]
      );
    } catch (logError) {
      console.error('Failed to log migration error:', logError);
    }
    
    throw error;
  }
}

// Run migration
migrateData().catch(error => {
  console.error('Migration script failed:', error);
  process.exit(1);
}); 