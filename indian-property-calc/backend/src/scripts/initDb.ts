import database from '../services/database.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadJsonFile(filename: string) {
  const filePath = join(__dirname, '../data', filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await database.initialize();

    // Load and insert seed data
    console.log('Loading seed data...');
    
    // Load cities
    const cities = await loadJsonFile('city-costs.json');
    for (const city of cities) {
      await database.run(
        'INSERT INTO cities (id, name, state, tier) VALUES (?, ?, ?, ?)',
        [city.id, city.name, city.state, city.tier]
      );

      // Insert construction costs
      for (const quality of ['basic', 'standard', 'luxury']) {
        await database.run(
          'INSERT INTO construction_costs (id, city_id, quality_level, base_rate) VALUES (?, ?, ?, ?)',
          [crypto.randomUUID(), city.id, quality, city.construction_costs[quality]]
        );
      }

      // Insert land costs
      for (const location of ['cityCore', 'suburb']) {
        await database.run(
          'INSERT INTO land_costs (id, city_id, location_type, rate_per_sqft) VALUES (?, ?, ?, ?)',
          [crypto.randomUUID(), city.id, location, city.land_costs[location]]
        );
      }

      // Insert labor costs
      for (const labor of ['skilled', 'unskilled']) {
        await database.run(
          'INSERT INTO labor_costs (id, city_id, labor_type, daily_rate) VALUES (?, ?, ?, ?)',
          [crypto.randomUUID(), city.id, labor, city.labor_costs[labor]]
        );
      }
    }

    // Load materials
    const materials = await loadJsonFile('materials.json');
    for (const material of materials) {
      const materialId = crypto.randomUUID();
      await database.run(
        'INSERT INTO materials (id, name, unit, base_cost) VALUES (?, ?, ?, ?)',
        [materialId, material.name, material.unit, material.base_cost]
      );

      // Insert quality multipliers
      for (const [quality, multiplier] of Object.entries(material.quality_multipliers)) {
        await database.run(
          'INSERT INTO material_quality_multipliers (id, material_id, quality_level, multiplier) VALUES (?, ?, ?, ?)',
          [crypto.randomUUID(), materialId, quality, multiplier]
        );
      }
    }

    // Load stamp duty
    const stampDuty = await loadJsonFile('stamp-duty.json');
    for (const state of Object.keys(stampDuty)) {
      for (const type of ['residential', 'commercial']) {
        const stampDutyId = crypto.randomUUID();
        await database.run(
          'INSERT INTO stamp_duty (id, state, property_type, base_rate) VALUES (?, ?, ?, ?)',
          [stampDutyId, state, type, stampDuty[state][type].base_rate]
        );

        // Insert additional charges
        for (const [charge, rate] of Object.entries(stampDuty[state][type].additional_charges || {})) {
          await database.run(
            'INSERT INTO additional_charges (id, stamp_duty_id, charge_type, rate) VALUES (?, ?, ?, ?)',
            [crypto.randomUUID(), stampDutyId, charge, rate]
          );
        }
      }
    }

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 