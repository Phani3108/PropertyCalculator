import { v4 as uuidv4 } from 'uuid';
import db from '../services/database.js';

type QualityLevel = 'basic' | 'standard' | 'luxury';
type LocationType = 'cityCore' | 'suburb';
type LaborType = 'skilled' | 'unskilled';
type PropertyType = 'residential' | 'commercial';

async function seedData() {
  try {
    // Get existing cities
    const cities = await db.all('SELECT id, name FROM cities');
    const cityMap = new Map(cities.map(city => [city.name, city.id]));

    // Insert construction costs for each city
    const qualityLevels: QualityLevel[] = ['basic', 'standard', 'luxury'];
    const baseRates: Record<QualityLevel, number> = { basic: 2000, standard: 3000, luxury: 4500 };
    
    for (const city of cities) {
      for (const quality of qualityLevels) {
        await db.run(
          'INSERT OR IGNORE INTO construction_costs (id, city_id, quality_level, base_rate) VALUES (?, ?, ?, ?)',
          [uuidv4(), city.id, quality, baseRates[quality]]
        );
      }

      // Insert land costs for each city
      const locationTypes: LocationType[] = ['cityCore', 'suburb'];
      const landRates: Record<LocationType, number> = { cityCore: 10000, suburb: 5000 };
      
      for (const locationType of locationTypes) {
        await db.run(
          'INSERT OR IGNORE INTO land_costs (id, city_id, location_type, rate_per_sqft) VALUES (?, ?, ?, ?)',
          [uuidv4(), city.id, locationType, landRates[locationType]]
        );
      }

      // Insert labor costs for each city
      const laborTypes: LaborType[] = ['skilled', 'unskilled'];
      const laborRates: Record<LaborType, number> = { skilled: 1000, unskilled: 500 };
      
      for (const laborType of laborTypes) {
        await db.run(
          'INSERT OR IGNORE INTO labor_costs (id, city_id, labor_type, daily_rate) VALUES (?, ?, ?, ?)',
          [uuidv4(), city.id, laborType, laborRates[laborType]]
        );
      }
    }

    // Insert stamp duty rates for each state
    const states = await db.all('SELECT DISTINCT state FROM cities');
    const propertyTypes: PropertyType[] = ['residential', 'commercial'];
    
    for (const state of states) {
      for (const propertyType of propertyTypes) {
        const stampDutyId = uuidv4();
        
        await db.run(
          'INSERT OR IGNORE INTO stamp_duty (id, state, property_type, base_rate) VALUES (?, ?, ?, ?)',
          [stampDutyId, state.state, propertyType, propertyType === 'residential' ? 5 : 6]
        );

        // Insert additional charges for stamp duty
        await db.run(
          'INSERT OR IGNORE INTO additional_charges (id, stamp_duty_id, charge_type, rate) VALUES (?, ?, ?, ?)',
          [uuidv4(), stampDutyId, 'registration', 1]
        );
      }
    }

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 