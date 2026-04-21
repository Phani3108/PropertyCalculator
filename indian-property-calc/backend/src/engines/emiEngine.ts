import { Decimal } from 'decimal.js';

/**
 * Calculate EMI (Equated Monthly Installment) for a loan
 * 
 * @param principal Principal loan amount in rupees
 * @param annualRate Annual interest rate (percentage)
 * @param months Loan tenure in months
 * @param pmayToggle Whether PMAY subsidy is applicable
 * @param baseCost Base cost of the property
 * @param builtUpSqft Built-up area in square feet
 * @returns Object containing EMI and subsidy savings (if applicable)
 */
export function calcEmi(
  principal: number,
  annualRate: number,
  months: number,
  pmayToggle: boolean = false,
  baseCost: number = 0,
  builtUpSqft: number = 0
): { emi: number; subsidySavings?: number } {
  // Convert to Decimal for precise calculations
  const p = new Decimal(principal);
  const r = new Decimal(annualRate).div(12).div(100); // Monthly interest rate
  const n = new Decimal(months);
  
  // Calculate EMI: P * r * (1+r)^n / ((1+r)^n - 1)
  const numerator = p.times(r).times(Decimal.pow(r.plus(1), n));
  const denominator = Decimal.pow(r.plus(1), n).minus(1);
  
  let emi = numerator.div(denominator);
  let subsidySavings: number | undefined;
  
  // Apply PMAY subsidy if toggled on and eligible
  if (pmayToggle && isEligibleForPmay(baseCost, builtUpSqft)) {
    const { subsidizedEmi, savings } = applyPmaySubsidy(principal, annualRate, months, baseCost);
    emi = new Decimal(subsidizedEmi);
    subsidySavings = savings;
  }
  
  return {
    emi: emi.toNumber(),
    subsidySavings
  };
}

/**
 * Check if property is eligible for PMAY subsidy
 * 
 * @param baseCost Base cost of the property
 * @param builtUpSqft Built-up area in square feet
 * @returns Boolean indicating eligibility
 */
function isEligibleForPmay(baseCost: number, builtUpSqft: number): boolean {
  // Convert built-up area to carpet area (approximate conversion)
  const carpetAreaSqm = (builtUpSqft * 0.7) * 0.0929; // 70% of built-up and convert to sqm
  
  // PMAY eligibility: carpet area <= 60 sqm and cost <= ₹45 lakhs
  return carpetAreaSqm <= 60 && baseCost <= 4500000;
}

/**
 * Apply PMAY subsidy to loan
 * 
 * @param principal Principal loan amount
 * @param annualRate Annual interest rate
 * @param months Loan tenure in months
 * @param baseCost Base cost of the property
 * @returns Object with subsidized EMI and savings
 */
function applyPmaySubsidy(
  principal: number,
  annualRate: number,
  months: number,
  baseCost: number
): { subsidizedEmi: number; savings: number } {
  let subsidyRate: number;
  let maxSubsidy: number;
  
  // Determine subsidy category based on property value
  if (baseCost <= 3500000) {
    // MIG I: 4% subsidy up to ₹9 lakhs
    subsidyRate = 4;
    maxSubsidy = 900000;
  } else {
    // MIG II: 3% subsidy up to ₹12 lakhs
    subsidyRate = 3;
    maxSubsidy = 1200000;
  }
  
  // Calculate subsidized principal amount
  const subsidyAmount = Math.min(maxSubsidy, principal) * (subsidyRate / 100);
  const npvSubsidy = calculateNPV(subsidyAmount, 9, months);
  const subsidizedPrincipal = principal - npvSubsidy;
  
  // Recalculate EMI with subsidized principal
  const p = new Decimal(subsidizedPrincipal);
  const r = new Decimal(annualRate).div(12).div(100);
  const n = new Decimal(months);
  
  const numerator = p.times(r).times(Decimal.pow(r.plus(1), n));
  const denominator = Decimal.pow(r.plus(1), n).minus(1);
  const subsidizedEmi = numerator.div(denominator).toNumber();
  
  // Calculate original EMI for comparison
  const origEmi = calcEmi(principal, annualRate, months).emi;
  const monthlySavings = origEmi - subsidizedEmi;
  const totalSavings = monthlySavings * months;
  
  return {
    subsidizedEmi,
    savings: totalSavings
  };
}

/**
 * Calculate Net Present Value
 * 
 * @param cashFlow Future cash flow
 * @param discountRate Discount rate percentage
 * @param periods Number of periods
 * @returns Net present value
 */
function calculateNPV(cashFlow: number, discountRate: number, periods: number): number {
  const r = new Decimal(discountRate).div(100);
  const npv = new Decimal(cashFlow).div(Decimal.pow(r.plus(1), new Decimal(periods).div(12)));
  return npv.toNumber();
}

export default calcEmi;
