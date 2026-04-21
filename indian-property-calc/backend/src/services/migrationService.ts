import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from './database.js';

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

interface StampDutyRate {
  state: string;
  rates: Array<{
    propertyType: string;
    rate: number;
    additionalCharges: {
      [key: string]: number;
    };
  }>;
}

export class MigrationService {
  private static async readJsonFile<T>(filename: string): Promise<T> {
    const content = await readFile(join(__dirname, '../data', filename), 'utf8');
    return JSON.parse(content);
  }

  private static async executeSchema(): Promise<void> {
    console.log('Creating database schema...');
    const schemaSQL = await readFile(join(__dirname, '../data/schema.sql'), 'utf8');
    
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    await db.transaction(async () => {
      for (const stmt of statements) {
        try {
          await db.run(stmt + ';');
        } catch (error) {
          console.error('Error executing SQL:', stmt);
          console.error('Error:', error);
          throw error;
        }
      }
    });
    console.log('Schema created successfully');
  }

  private static async insertCities(citiesData: CityData[]): Promise<void> {
    console.log('Inserting cities data...');
    await db.transaction(async () => {
      for (const city of citiesData) {
        const cityId = uuidv4();
        
        // Insert city
        await db.run(
          'INSERT INTO cities (id, name, state, tier) VALUES (?, ?, ?, ?)',
          [cityId, city.name, city.state, city.tier]
        );

        // Insert construction costs
        for (const [quality, cost] of Object.entries(city.costs)) {
          await db.run(
            'INSERT INTO construction_costs (id, city_id, quality_level, base_rate) VALUES (?, ?, ?, ?)',
            [uuidv4(), cityId, quality, cost]
          );
        }

        // Insert land costs
        for (const [locationType, cost] of Object.entries(city.landCosts)) {
          await db.run(
            'INSERT INTO land_costs (id, city_id, location_type, rate_per_sqft) VALUES (?, ?, ?, ?)',
            [uuidv4(), cityId, locationType, cost]
          );
        }

        // Insert labor costs
        for (const [laborType, wage] of Object.entries(city.wages)) {
          await db.run(
            'INSERT INTO labor_costs (id, city_id, labor_type, daily_rate) VALUES (?, ?, ?, ?)',
            [uuidv4(), cityId, laborType, wage]
          );
        }
      }
    });
    console.log('Cities data inserted successfully');
  }

  private static async insertMaterials(materialsData: MaterialData[]): Promise<void> {
    console.log('Inserting materials data...');
    await db.transaction(async () => {
      for (const material of materialsData) {
        const materialId = uuidv4();
        
        // Insert material
        await db.run(
          'INSERT INTO materials (id, name, unit, base_cost) VALUES (?, ?, ?, ?)',
          [materialId, material.name, material.unit, material.baseCost]
        );

        // Insert quality multipliers
        for (const [quality, multiplier] of Object.entries(material.qualityMultipliers)) {
          await db.run(
            'INSERT INTO material_quality_multipliers (id, material_id, quality_level, multiplier) VALUES (?, ?, ?, ?)',
            [uuidv4(), materialId, quality, multiplier]
          );
        }
      }
    });
    console.log('Materials data inserted successfully');
  }

  private static async insertStampDutyRates(stampDutyData: StampDutyRate[]): Promise<void> {
    console.log('Inserting stamp duty rates...');
    await db.transaction(async () => {
      for (const state of stampDutyData) {
        for (const rate of state.rates) {
          // Insert stamp duty rate
          const stampDutyId = uuidv4();
          await db.run(
            'INSERT INTO stamp_duty (id, state, property_type, base_rate) VALUES (?, ?, ?, ?)',
            [stampDutyId, state.state, rate.propertyType, rate.rate]
          );

          // Insert additional charges
          for (const [chargeType, chargeRate] of Object.entries(rate.additionalCharges)) {
            await db.run(
              'INSERT INTO additional_charges (id, stamp_duty_id, charge_type, rate) VALUES (?, ?, ?, ?)',
              [uuidv4(), stampDutyId, chargeType, chargeRate]
            );
          }
        }
      }
    });
    console.log('Stamp duty rates inserted successfully');
  }

  public static async migrate(): Promise<void> {
    try {
      console.log('Starting database migration...');
      
      // Create schema
      await this.executeSchema();

      // Read data files
      const citiesData = await this.readJsonFile<CityData[]>('city-costs.json');
      const materialsData = await this.readJsonFile<MaterialData[]>('materials.json');
      const stampDutyData = await this.readJsonFile<StampDutyRate[]>('stamp-duty.json');

      // Insert data
      await this.insertCities(citiesData);
      await this.insertMaterials(materialsData);
      await this.insertStampDutyRates(stampDutyData);

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
} 