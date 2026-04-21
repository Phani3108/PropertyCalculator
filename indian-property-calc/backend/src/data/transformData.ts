import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function transformData() {
  try {
    // Transform materials data
    const materialsJson = await readFile(join(__dirname, 'materials.json'), 'utf8');
    const materialsData = JSON.parse(materialsJson);
    const transformedMaterials: MaterialData[] = Object.entries(materialsData.materials).map(([name, data]: [string, any]) => ({
      name,
      unit: data.unit,
      baseCost: data.basic.price,
      qualityMultipliers: {
        basic: 1,
        standard: data.standard.price / data.basic.price,
        luxury: data.luxury.price / data.basic.price
      }
    }));
    await writeFile(
      join(__dirname, 'transformed-materials.json'),
      JSON.stringify(transformedMaterials, null, 2)
    );

    // Transform stamp duty data
    const stampDutyJson = await readFile(join(__dirname, 'stamp-duty.json'), 'utf8');
    const stampDutyData = JSON.parse(stampDutyJson);
    const transformedStampDuty: StampDutyData[] = Object.entries(stampDutyData).flatMap(([state, data]: [string, any]) => [
      {
        state,
        propertyType: 'residential',
        ratePercentage: data.dutyPercent
      },
      {
        state,
        propertyType: 'commercial',
        ratePercentage: data.dutyPercent + 1 // Commercial usually has higher rates
      }
    ]);
    await writeFile(
      join(__dirname, 'transformed-stamp-duty.json'),
      JSON.stringify(transformedStampDuty, null, 2)
    );

    console.log('Data transformation completed successfully');
  } catch (error) {
    console.error('Error during data transformation:', error);
    throw error;
  }
}

// Run transformation
transformData().catch(console.error); 