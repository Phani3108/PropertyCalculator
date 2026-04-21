import express from 'express';
import { z } from 'zod';
import { calculatorController } from '../controllers/calculatorController.js';

const router = express.Router();

// lightweight validator helper (since validateRequest was removed)
function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ error: 'Validation error', details: parsed.error.issues });
    }
    req.body = parsed.data as any;
    next();
  };
}

// Cities and static data
router.get('/cities', calculatorController.getCities);
router.get('/construction-costs', calculatorController.getConstructionCosts);
router.get('/land-costs', calculatorController.getLandCosts);

// Flat calculation
const flatCalculationSchema = z.object({
  city: z.string(),
  builtUpSqft: z.number().positive(),
  budgetQuality: z.enum(['basic', 'standard', 'luxury']),
  gender: z.enum(['male', 'female']),
  pmayToggle: z.boolean(),
  gstToggle: z.boolean(),
  loanPercent: z.number().optional(),
  interestRate: z.number().optional(),
  loanTenureYears: z.number().optional()
});

router.post('/flat', validateBody(flatCalculationSchema), calculatorController.calculateFlatCost);

// House calculation
const houseCalculationSchema = z.object({
  city: z.string(),
  plotSqft: z.number().positive(),
  builtUpSqft: z.number().positive(),
  landLocation: z.enum(['cityCore', 'suburb', 'custom']),
  customLandRate: z.number().optional(),
  quality: z.enum(['basic', 'standard', 'luxury']),
  includePermits: z.boolean()
});

router.post('/house', validateBody(houseCalculationSchema), calculatorController.calculateHouseCost);

export default router;
