import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import estimateFlatPurchase from '../engines/flatEngine.js';
import estimateHouseBuild from '../engines/houseEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readJsonFile(relativePath: string) {
  const fullPath = path.join(__dirname, relativePath);
  return JSON.parse(await fs.readFile(fullPath, 'utf-8'));
}

export const calculatorController = {
  async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const configData = await readJsonFile('../data/config.json');
      const cities = configData.cities.map((city: any, i: number) => ({
        id: city.name.toLowerCase().replace(/\s+/g, '-'),
        name: city.name,
        state: city.state,
        tier: city.tier,
      }));
      res.json(cities);
    } catch (err) {
      next(err);
    }
  },

  async getConstructionCosts(req: Request, res: Response, next: NextFunction) {
    try {
      const configData = await readJsonFile('../data/config.json');
      const costs = configData.cities.flatMap((city: any) =>
        (['basic', 'standard', 'luxury'] as const).map(quality => ({
          city: city.name,
          quality,
          ratePerSqft: city.costs[quality],
        }))
      );
      res.json(costs);
    } catch (err) {
      next(err);
    }
  },

  async getLandCosts(req: Request, res: Response, next: NextFunction) {
    try {
      const cityData = await readJsonFile('../data/city-costs.json');
      const costs = cityData.flatMap((city: any) =>
        (['cityCore', 'suburb'] as const).map(loc => ({
          city: city.name,
          location: loc,
          ratePerSqft: city.landCosts[loc],
        }))
      );
      res.json(costs);
    } catch (err) {
      next(err);
    }
  },

  calculateFlatCost(req: Request, res: Response, next: NextFunction) {
    try {
      const startTime = Date.now();
      const result = estimateFlatPurchase(req.body);
      const stale = Date.now() - startTime > 2000;
      res.json({ ...result, stale });
    } catch (err) {
      next(err);
    }
  },

  calculateHouseCost(req: Request, res: Response, next: NextFunction) {
    try {
      const startTime = Date.now();
      const result = estimateHouseBuild(req.body);
      const stale = Date.now() - startTime > 2000;
      res.json({ ...result, stale });
    } catch (err) {
      next(err);
    }
  },
};
