import { getDefaultLandRatePerSqft, getStateRuleForCity, regionPathForCity } from './rules';
import { loadRule } from '../utils/ruleLoader';

export interface FlatRequest {
  cityId: string;
  builtUpSqft: number;
  budgetQuality: 'basic' | 'standard' | 'luxury';
  gender: 'male' | 'female';
  pmayToggle: boolean;
  gstToggle: boolean;
  includeLoan: boolean;
  loanPercent?: number; // 0..90
  interestRate?: number; // annual %
  loanTenureYears?: number;
}

export interface HouseRequest {
  cityId: string;
  plotSqft: number;
  builtUpSqft: number;
  landLocation: 'cityCore' | 'suburb' | 'custom';
  customLandRate?: number;
  quality: 'basic' | 'standard' | 'luxury';
  gender?: 'male' | 'female';
  includePermits: boolean;
  includeLoan: boolean;
  loanPercent?: number;
  interestRate?: number;
  loanTenureYears?: number;
}

export interface CalculationResult {
  baseCost: number;
  gst?: number;
  stampDuty: number;
  registration: number;
  totalPayable: number;
  emi?: number;
  subsidySavings?: number;
  loanAmount?: number;
  downPayment?: number;
  loanTenureYears?: number;
  stateInfo: {
    state: string;
    dutyPercent: number;
    femaleRebate?: number;
    registrationPercent: number;
    note?: string;
  };
}

export function validateFlatRequest(input: any): FlatRequest {
  const required = ['cityId', 'builtUpSqft', 'budgetQuality', 'gender', 'pmayToggle', 'gstToggle'];
  for (const key of required) {
    if (input[key] === undefined || input[key] === null) throw new Error(`Missing ${key}`);
  }
  const includeLoan = Boolean(input.includeLoan);
  const payload: FlatRequest = {
    cityId: String(input.cityId),
    builtUpSqft: Number(input.builtUpSqft),
    budgetQuality: input.budgetQuality,
    gender: input.gender,
    pmayToggle: Boolean(input.pmayToggle),
    gstToggle: Boolean(input.gstToggle),
    includeLoan,
  };
  if (includeLoan) {
    const loanRequired = ['loanPercent', 'interestRate', 'loanTenureYears'];
    for (const key of loanRequired) {
      if (input[key] === undefined || input[key] === null) throw new Error(`Missing ${key}`);
    }
    payload.loanPercent = Number(input.loanPercent);
    payload.interestRate = Number(input.interestRate);
    payload.loanTenureYears = Number(input.loanTenureYears);
  }
  return payload;
}

export function validateHouseRequest(input: any): HouseRequest {
  const required = ['cityId', 'plotSqft', 'builtUpSqft', 'landLocation', 'quality', 'includePermits'];
  for (const key of required) {
    if (input[key] === undefined || input[key] === null) throw new Error(`Missing ${key}`);
  }
  const includeLoan = Boolean(input.includeLoan);
  const payload: HouseRequest = {
    cityId: String(input.cityId),
    plotSqft: Number(input.plotSqft),
    builtUpSqft: Number(input.builtUpSqft),
    landLocation: input.landLocation,
    customLandRate: input.customLandRate !== undefined ? Number(input.customLandRate) : undefined,
    quality: input.quality,
    gender: input.gender || 'male',
    includePermits: Boolean(input.includePermits),
    includeLoan,
  };
  if (includeLoan) {
    const loanRequired = ['loanPercent', 'interestRate', 'loanTenureYears'];
    for (const key of loanRequired) {
      if (input[key] === undefined || input[key] === null) throw new Error(`Missing ${key}`);
    }
    payload.loanPercent = Number(input.loanPercent);
    payload.interestRate = Number(input.interestRate);
    payload.loanTenureYears = Number(input.loanTenureYears);
  }
  return payload;
}

export async function getStateInfoAsync(cityId: string, gender: 'male' | 'female') {
  // Prefer regional rule JSON if available
  const path = regionPathForCity(cityId);
  if (path) {
    try {
      const regional = await loadRule(path as any);
      const dutyPercent = Math.max(0, (regional.stamp_duty ?? 0) * 100 - (gender === 'female' ? ((regional.female_rebate ?? 0) * 100) : 0));
      const registrationPercent = (regional.registration_fee ?? 0) * 100;
      return {
        state: regional.region,
        dutyPercent,
        femaleRebate: (regional.female_rebate ?? 0) * 100,
        registrationPercent,
        note: regional.notes,
      };
    } catch {}
  }
  // Fallback to internal state-based rules
  const rule = getStateRuleForCity(cityId);
  const dutyPercent = Math.max(0, rule.stampDutyPercent - (gender === 'female' ? (rule.femaleRebatePercent ?? 0) : 0));
  return {
    state: rule.state,
    dutyPercent,
    femaleRebate: rule.femaleRebatePercent,
    registrationPercent: rule.registrationPercent,
    note: rule.note,
  };
}

function getConstructionCostPerSqft(quality: 'basic' | 'standard' | 'luxury'): number {
  if (quality === 'basic') return 1800;
  if (quality === 'luxury') return 3200;
  return 2400;
}

export async function calculateFlatCostAsync(req: FlatRequest): Promise<Omit<CalculationResult, 'stateInfo'>> {
  const constructionCost = getConstructionCostPerSqft(req.budgetQuality) * req.builtUpSqft;

  // Prefer regional rules for GST
  let gstPercent = 0.05;
  const path = regionPathForCity(req.cityId);
  if (path) {
    try {
      const r = await loadRule(path as any);
      gstPercent = r.gst_applicable ? 0.05 : 0;
    } catch {}
  }
  const gst = req.gstToggle ? Math.round(constructionCost * gstPercent) : 0;

  let stampDutyRaw = 0;
  let registration = 0;
  if (path) {
    try {
      const r = await loadRule(path as any);
      const duty = Math.max(0, (r.stamp_duty ?? 0) - (req.gender === 'female' ? (r.female_rebate ?? 0) : 0));
      stampDutyRaw = Math.round(constructionCost * duty);
      registration = Math.round(constructionCost * (r.registration_fee ?? 0));
    } catch {
      const state = getStateRuleForCity(req.cityId);
      stampDutyRaw = Math.round(constructionCost * (Math.max(0, state.stampDutyPercent - (req.gender === 'female' ? (state.femaleRebatePercent ?? 0) : 0)) / 100));
      registration = Math.round(constructionCost * (state.registrationPercent / 100));
    }
  } else {
    const state = getStateRuleForCity(req.cityId);
    stampDutyRaw = Math.round(constructionCost * (Math.max(0, state.stampDutyPercent - (req.gender === 'female' ? (state.femaleRebatePercent ?? 0) : 0)) / 100));
    registration = Math.round(constructionCost * (state.registrationPercent / 100));
  }

  let subsidySavings = 0;
  if (req.pmayToggle) {
    subsidySavings = Math.round(0.02 * constructionCost);
  }

  const baseCost = Math.round(constructionCost);
  const totalBeforeLoan = baseCost + gst + stampDutyRaw + registration - subsidySavings;

  const result: Omit<CalculationResult, 'stateInfo'> = {
    baseCost,
    gst,
    stampDuty: stampDutyRaw,
    registration,
    totalPayable: totalBeforeLoan,
    subsidySavings,
  };
  if (req.includeLoan && req.loanPercent !== undefined && req.interestRate !== undefined && req.loanTenureYears !== undefined) {
    const loanAmount = Math.round((req.loanPercent / 100) * totalBeforeLoan);
    const downPayment = totalBeforeLoan - loanAmount;
    const monthlyRate = req.interestRate / 12 / 100;
    const n = req.loanTenureYears * 12;
    const emi = Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1));
    result.emi = emi;
    result.loanAmount = loanAmount;
    result.downPayment = downPayment;
    result.loanTenureYears = req.loanTenureYears;
  }
  return result;
}

export async function calculateHouseCostAsync(req: HouseRequest): Promise<Omit<CalculationResult, 'stateInfo'>> {
  const constructionCost = getConstructionCostPerSqft(req.quality) * req.builtUpSqft;
  const landRate = req.landLocation === 'custom' && req.customLandRate ? req.customLandRate : getDefaultLandRatePerSqft(req.cityId, req.landLocation === 'cityCore' ? 'cityCore' : 'suburb');
  const landCost = landRate * req.plotSqft;
  const permits = req.includePermits ? 0.03 * constructionCost : 0;

  const baseCost = Math.round(constructionCost + landCost + permits);

  let stampDuty = 0;
  let registration = 0;
  const path = regionPathForCity(req.cityId);
  if (path) {
    try {
      const r = await loadRule(path as any);
      const gender = req.gender ?? 'male';
      const duty = Math.max(0, (r.stamp_duty ?? 0) - (gender === 'female' ? (r.female_rebate ?? 0) : 0));
      stampDuty = Math.round(baseCost * duty);
      registration = Math.round(baseCost * (r.registration_fee ?? 0));
    } catch {
      const state = getStateRuleForCity(req.cityId);
      const gender = req.gender ?? 'male';
      stampDuty = Math.round(baseCost * (Math.max(0, state.stampDutyPercent - (gender === 'female' ? (state.femaleRebatePercent ?? 0) : 0)) / 100));
      registration = Math.round(baseCost * (state.registrationPercent / 100));
    }
  } else {
    const state = getStateRuleForCity(req.cityId);
    const gender = req.gender ?? 'male';
    stampDuty = Math.round(baseCost * (Math.max(0, state.stampDutyPercent - (gender === 'female' ? (state.femaleRebatePercent ?? 0) : 0)) / 100));
    registration = Math.round(baseCost * (state.registrationPercent / 100));
  }

  const totalPayable = baseCost + stampDuty + registration;

  const result: Omit<CalculationResult, 'stateInfo'> = {
    baseCost,
    stampDuty,
    registration,
    totalPayable,
  };
  if (req.includeLoan && req.loanPercent !== undefined && req.interestRate !== undefined && req.loanTenureYears !== undefined) {
    const loanAmount = Math.round((req.loanPercent / 100) * totalPayable);
    const downPayment = totalPayable - loanAmount;
    const monthlyRate = req.interestRate / 12 / 100;
    const n = req.loanTenureYears * 12;
    const emi = Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1));
    result.emi = emi;
    result.loanAmount = loanAmount;
    result.downPayment = downPayment;
    result.loanTenureYears = req.loanTenureYears;
  }
  return result;
}

