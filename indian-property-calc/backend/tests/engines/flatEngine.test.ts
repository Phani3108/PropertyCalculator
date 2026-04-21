import estimateFlatPurchase from '../../src/engines/flatEngine.js';
import type { FlatParams } from '../../src/engines/flatEngine.js';

describe('Flat Engine', () => {
  const baseParams: FlatParams = {
    city: 'Mumbai',
    builtUpSqft: 1000,
    budgetQuality: 'standard',
    gender: 'male',
    pmayToggle: false,
    gstToggle: true,
  };

  it('returns all required cost fields', () => {
    const result = estimateFlatPurchase(baseParams);
    expect(result).toHaveProperty('baseCost');
    expect(result).toHaveProperty('gst');
    expect(result).toHaveProperty('stampDuty');
    expect(result).toHaveProperty('registration');
    expect(result).toHaveProperty('totalPayable');
    expect(result).toHaveProperty('emi');
    expect(result.baseCost).toBeGreaterThan(0);
    expect(result.totalPayable).toBeGreaterThan(result.baseCost);
  });

  it('applies lower stamp duty for female buyers', () => {
    const maleResult = estimateFlatPurchase({ ...baseParams, gender: 'male' });
    const femaleResult = estimateFlatPurchase({ ...baseParams, gender: 'female' });
    expect(femaleResult.stampDuty).toBeLessThanOrEqual(maleResult.stampDuty);
  });

  it('excludes GST when toggle is off', () => {
    const result = estimateFlatPurchase({ ...baseParams, gstToggle: false });
    expect(result.gst).toBe(0);
  });

  it('quality affects base cost', () => {
    const basicResult = estimateFlatPurchase({ ...baseParams, budgetQuality: 'basic' });
    const luxuryResult = estimateFlatPurchase({ ...baseParams, budgetQuality: 'luxury' });
    expect(luxuryResult.baseCost).toBeGreaterThan(basicResult.baseCost);
  });

  it('scales with built-up area', () => {
    const smallResult = estimateFlatPurchase({ ...baseParams, builtUpSqft: 500 });
    const largeResult = estimateFlatPurchase({ ...baseParams, builtUpSqft: 2000 });
    expect(largeResult.baseCost).toBeGreaterThan(smallResult.baseCost);
  });

  it('falls back gracefully for unknown cities', () => {
    const result = estimateFlatPurchase({ ...baseParams, city: 'UnknownCity' });
    expect(result.baseCost).toBeGreaterThan(0);
  });
});
