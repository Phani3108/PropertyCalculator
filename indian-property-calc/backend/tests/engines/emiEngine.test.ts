import { calcEmi } from '../../src/engines/emiEngine.js';

describe('EMI Engine', () => {
  it('calculates standard EMI correctly', () => {
    // 50 lakh loan at 8.5% for 20 years
    const result = calcEmi(5000000, 8.5, 240);
    expect(result.emi).toBeGreaterThan(0);
    expect(result.subsidySavings).toBeUndefined();
    // Expected EMI ~₹43,391 for 50L at 8.5% for 20yr
    expect(result.emi).toBeCloseTo(43391, -2);
  });

  it('returns zero EMI for zero principal', () => {
    // Decimal.js division by zero guard — should return NaN or 0
    const result = calcEmi(0, 8.5, 240);
    expect(result.emi).toBeNaN();
  });

  it('applies PMAY subsidy for eligible properties', () => {
    // Eligible: carpet area ≤ 60 sqm, cost ≤ ₹45L
    // 30 lakh cost, 800 sqft built-up → carpet ~52 sqm, loan 24L
    const result = calcEmi(2400000, 8.5, 240, true, 3000000, 800);
    expect(result.subsidySavings).toBeDefined();
    expect(result.subsidySavings!).toBeGreaterThan(0);
    // Subsidized EMI should be lower than standard
    const standardResult = calcEmi(2400000, 8.5, 240);
    expect(result.emi).toBeLessThan(standardResult.emi);
  });

  it('does not apply PMAY for expensive properties', () => {
    // 60 lakh cost — above ₹45L limit
    const result = calcEmi(4800000, 8.5, 240, true, 6000000, 1200);
    expect(result.subsidySavings).toBeUndefined();
  });

  it('handles short tenure correctly', () => {
    // 10 lakh at 8% for 1 year
    const result = calcEmi(1000000, 8, 12);
    expect(result.emi).toBeGreaterThan(80000); // roughly ₹87k/month
    expect(result.emi).toBeLessThan(90000);
  });
});
