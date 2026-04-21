import estimateHouseBuild from '../../src/engines/houseEngine.js';
import type { HouseParams } from '../../src/engines/houseEngine.js';

describe('House Engine', () => {
  const baseParams: HouseParams = {
    city: 'Mumbai',
    plotSqft: 2000,
    builtUpSqft: 1500,
    landLocation: 'suburb',
    quality: 'standard',
    includePermits: true,
  };

  it('returns all required cost fields', () => {
    const result = estimateHouseBuild(baseParams);
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('labourCost');
    expect(result).toHaveProperty('totalBuildCost');
    expect(result).toHaveProperty('timelineMonths');
    expect(result.materialCost).toBeGreaterThan(0);
    expect(result.labourCost).toBeGreaterThan(0);
    expect(result.totalBuildCost).toBeGreaterThan(0);
    expect(result.timelineMonths).toBeGreaterThan(0);
  });

  it('includes permit cost when toggled', () => {
    const withPermits = estimateHouseBuild({ ...baseParams, includePermits: true });
    const withoutPermits = estimateHouseBuild({ ...baseParams, includePermits: false });
    expect(withPermits.permitCost).toBeDefined();
    expect(withPermits.permitCost!).toBeGreaterThan(0);
    expect(withoutPermits.permitCost).toBeUndefined();
    expect(withPermits.totalBuildCost).toBeGreaterThan(withoutPermits.totalBuildCost);
  });

  it('quality affects costs', () => {
    const basicResult = estimateHouseBuild({ ...baseParams, quality: 'basic' });
    const luxuryResult = estimateHouseBuild({ ...baseParams, quality: 'luxury' });
    expect(luxuryResult.totalBuildCost).toBeGreaterThan(basicResult.totalBuildCost);
  });

  it('city core land costs more than suburb', () => {
    const coreResult = estimateHouseBuild({ ...baseParams, landLocation: 'cityCore' });
    const suburbResult = estimateHouseBuild({ ...baseParams, landLocation: 'suburb' });
    expect(coreResult.landCost!).toBeGreaterThan(suburbResult.landCost!);
  });

  it('uses custom land rate when specified', () => {
    const result = estimateHouseBuild({
      ...baseParams,
      landLocation: 'custom',
      customLandRate: 5000,
    });
    expect(result.landCost).toBe(5000 * 2000); // customRate * plotSqft
  });

  it('returns materials breakdown', () => {
    const result = estimateHouseBuild(baseParams);
    expect(result.materialsBreakdown).toBeDefined();
    if (result.materialsBreakdown) {
      expect(result.materialsBreakdown.cement).toBeDefined();
      expect(result.materialsBreakdown.steel).toBeDefined();
    }
  });

  it('timeline scales with area', () => {
    const smallResult = estimateHouseBuild({ ...baseParams, builtUpSqft: 500 });
    const largeResult = estimateHouseBuild({ ...baseParams, builtUpSqft: 3000 });
    expect(largeResult.timelineMonths).toBeGreaterThan(smallResult.timelineMonths);
  });
});
