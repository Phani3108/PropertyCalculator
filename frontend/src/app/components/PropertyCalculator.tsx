import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import InfoTooltip from './InfoTooltip';
import { useLocalStorage } from './useLocalStorage';
import { regionPathForCity, findCityById } from '../lib/rules';
import { loadRule } from '../utils/ruleLoader';
import { formatCurrency, getCurrencySymbol } from '../lib/currency';
import PriceTrendChart from './PriceTrendChart';
import SavedCalculations, { saveCalculation } from './SavedCalculations';
import { canCalculate, trackCalculation } from '../lib/freemium';

interface City {
  id: string;
  name: string;
  state: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  country?: string;
}

interface CalculationResult {
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

export default function PropertyCalculator() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rulesMeta, setRulesMeta] = useState<{ version: string; source: string; validUntil?: string; verifiedBy?: string; lastUpdated: string } | null>(null);
  const [activeRuleBadge, setActiveRuleBadge] = useState<{ region?: string; version?: string; lastVerified?: string; source?: string } | null>(null);
  const [activeRuleJson, setActiveRuleJson] = useState<any | null>(null);
  const [showRuleDetails, setShowRuleDetails] = useState(false);

  const [formData, setFormData] = useLocalStorage('prop_calc_form_v1', {
    cityId: '',
    propertyType: 'flat' as 'flat' | 'house',
    builtUpSqft: '',
    plotSqft: '',
    budgetQuality: 'standard' as 'basic' | 'standard' | 'luxury',
    landLocation: 'suburb' as 'cityCore' | 'suburb' | 'custom',
    customLandRate: '',
    gender: 'male' as 'male' | 'female',
    pmayToggle: false,
    gstToggle: true,
    includePermits: false,
    includeLoan: false,
    loanPercent: '80',
    interestRate: '8.5',
    loanTenureYears: '20'
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const data = await response.json();
        setCities(data);
      } catch (err) {
        setError('Failed to load cities');
      }
    };

    const fetchMeta = async () => {
      try {
        const res = await fetch('/api/rules');
        if (res.ok) {
          const data = await res.json();
          setRulesMeta(data);
        }
      } catch {}
    };

    fetchCities();
    fetchMeta();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.toString().length === 0) return;
    const updated: any = {};
    const booleanFields = new Set(['pmayToggle', 'gstToggle', 'includePermits', 'includeLoan']);
    const allowedFields = new Set([
      'cityId', 'propertyType', 'builtUpSqft', 'plotSqft', 'budgetQuality', 'landLocation', 'customLandRate',
      'gender', 'pmayToggle', 'gstToggle', 'includePermits', 'includeLoan', 'loanPercent', 'interestRate', 'loanTenureYears'
    ]);
    params.forEach((value, key) => {
      if (!allowedFields.has(key)) return;
      if (booleanFields.has(key)) {
        updated[key] = value === 'true';
      } else {
        updated[key] = value;
      }
    });
    if (Object.keys(updated).length > 0) {
      setFormData(prev => ({ ...prev, ...updated }));
      if (updated.cityId) {
        const c = (cities || []).find(c => c.id === updated.cityId);
        if (c?.country) setSelectedCountry(c.country);
        if (c?.region) setSelectedRegion(c.region);
        else if (c?.state) setSelectedRegion(c.state);
      }
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        if (!formData.cityId) {
          setActiveRuleBadge(null);
          return;
        }
        const path = regionPathForCity(formData.cityId) as any;
        if (!path) {
          setActiveRuleBadge(null);
          return;
        }
        const rule = await loadRule(path);
        setActiveRuleBadge({
          region: rule.region,
          version: rule.data_version,
          lastVerified: rule.last_verified,
          source: rule.source,
        });
        setActiveRuleJson(rule);
      } catch {
        setActiveRuleBadge(null);
        setActiveRuleJson(null);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cityId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Freemium gating
    const { allowed, remaining, limit } = canCalculate();
    if (!allowed) {
      return setError(`Daily free limit of ${limit} calculations reached. Upgrade to premium for unlimited access.`);
    }
    // basic client-side validation
    if (!formData.cityId) return setError('Please select a city');
    if (!formData.builtUpSqft || Number(formData.builtUpSqft) <= 0) return setError('Built-up area must be greater than 0');
    if (formData.propertyType === 'house' && (!formData.plotSqft || Number(formData.plotSqft) <= 0)) return setError('Plot area must be greater than 0');
    if (formData.includeLoan) {
      if (!formData.loanPercent || !formData.interestRate || !formData.loanTenureYears) {
        return setError('Please provide loan %, interest rate and tenure');
      }
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoint = formData.propertyType === 'flat' ? '/flat' : '/house';
      const payload = formData.propertyType === 'flat' 
        ? {
            cityId: formData.cityId,
            builtUpSqft: Number(formData.builtUpSqft),
            budgetQuality: formData.budgetQuality,
            gender: formData.gender,
            pmayToggle: formData.pmayToggle,
            gstToggle: formData.gstToggle,
            includeLoan: formData.includeLoan,
            ...(formData.includeLoan ? {
              loanPercent: Number(formData.loanPercent),
              interestRate: Number(formData.interestRate),
              loanTenureYears: Number(formData.loanTenureYears)
            } : {})
          }
        : {
            cityId: formData.cityId,
            plotSqft: Number(formData.plotSqft),
            builtUpSqft: Number(formData.builtUpSqft),
            landLocation: formData.landLocation,
            customLandRate: formData.customLandRate ? Number(formData.customLandRate) : undefined,
            quality: formData.budgetQuality,
            gender: formData.gender,
            includePermits: formData.includePermits,
            includeLoan: formData.includeLoan,
            ...(formData.includeLoan ? {
              loanPercent: Number(formData.loanPercent),
              interestRate: Number(formData.interestRate),
              loanTenureYears: Number(formData.loanTenureYears)
            } : {})
          };

      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const data = await response.json();
      setResult(data);
      trackCalculation();
      // Save to saved calculations
      const city = cities.find(c => c.id === formData.cityId);
      if (city) {
        saveCalculation({
          cityName: city.name,
          country: city.country || 'India',
          propertyType: formData.propertyType,
          totalPayable: data.totalPayable,
          inputs: { ...formData },
        });
      }
      try {
        const receipt = {
          inputs: { ...formData },
          result: data,
          rulesMeta,
        };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('prop_calc_receipt', JSON.stringify(receipt));
        }
      } catch {}
    } catch (err) {
      setError('Failed to calculate property cost');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Property Cost Calculator</h1>
      {rulesMeta && (
        <div className="mb-4 text-xs text-gray-600 bg-gray-100 p-3 rounded">
          Calculations based on latest rules. Version {rulesMeta.version}. Last verified {rulesMeta.lastUpdated}. Source: {rulesMeta.source}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedRegion('');
              setFormData(prev => ({ ...prev, cityId: '' }));
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">All Countries</option>
            {Array.from(new Set(cities.map(c => c.country).filter(Boolean) as string[])).map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Region/State</label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setFormData(prev => ({ ...prev, cityId: '' }));
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">All Regions</option>
            {Array.from(new Set(
              cities
                .filter(c => !selectedCountry || c.country === selectedCountry)
                .map(c => (c.region || c.state))
                .filter(Boolean) as string[]
            )).map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block">City</label>
            {activeRuleBadge && (
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100">{activeRuleBadge.region}</span>
                {activeRuleBadge.version && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100">v{activeRuleBadge.version}</span>
                )}
                {activeRuleBadge.source && (
                  <a href={activeRuleBadge.source} target="_blank" rel="noreferrer" className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800">Source</a>
                )}
                {activeRuleJson && (
                  <button type="button" onClick={() => setShowRuleDetails(v => !v)} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300">Details</button>
                )}
              </div>
            )}
          </div>
          <select
            name="cityId"
            value={formData.cityId}
            onChange={(e) => {
              handleInputChange(e);
              const c = cities.find(c => c.id === e.target.value);
              setSelectedCountry(c?.country || '');
              setSelectedRegion(c?.region || c?.state || '');
            }}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select City</option>
            {cities
              .filter(city => (!selectedCountry || city.country === selectedCountry))
              .filter(city => (!selectedRegion || (city.region || city.state) === selectedRegion))
              .map(city => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state} (Tier {city.tier.replace('tier', '')})
              </option>
            ))}
          </select>
        </div>
        {(selectedCountry || selectedRegion) && (
          <div className="text-xs text-gray-600 -mt-2 mb-2">{selectedCountry ? `Country: ${selectedCountry}` : ''} {selectedRegion ? `• Region: ${selectedRegion}` : ''}</div>
        )}
        {showRuleDetails && activeRuleJson && (
          <div className="text-xs text-gray-700 bg-gray-50 border rounded p-3 mb-2">
            <div className="font-semibold mb-1">Active Rules (preview)</div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap">{JSON.stringify(activeRuleJson, null, 2)}</pre>
          </div>
        )}

        <div>
          <label className="block mb-2">Property Type</label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="flat">Flat</option>
            <option value="house">Independent House</option>
          </select>
        </div>

        {formData.propertyType === 'house' && (
          <div>
            <label className="block mb-2">Plot Area (sq ft)</label>
            <input
              type="number"
              name="plotSqft"
              value={formData.plotSqft}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>
        )}

        <div>
          <label className="block mb-2">Built-up Area (sq ft)</label>
          <input
            type="number"
            name="builtUpSqft"
            value={formData.builtUpSqft}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block mb-2">Quality Level</label>
          <select
            name="budgetQuality"
            value={formData.budgetQuality}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Gender (for stamp duty calculation)</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {formData.propertyType === 'house' && (
          <>
            <div>
              <label className="block mb-2">Location Type</label>
              <select
                name="landLocation"
                value={formData.landLocation}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="cityCore">City Core</option>
                <option value="suburb">Suburb</option>
                <option value="custom">Custom Rate</option>
              </select>
            </div>

            {formData.landLocation === 'custom' && (
              <div>
                <label className="block mb-2">Custom Land Rate (₹/sq ft)</label>
                <input
                  type="number"
                  name="customLandRate"
                  value={formData.customLandRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="includePermits"
                checked={formData.includePermits}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label className="inline-flex items-center">Include Building Permits Cost <InfoTooltip text="Permits include local authority approvals; assumed at 3% of construction cost." href="https://www.mohua.gov.in/" /></label>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                name="includeLoan"
                checked={formData.includeLoan}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label>Include Loan/EMI</label>
            </div>

            {formData.includeLoan && (
              <>
                <div>
                  <label className="block mb-2">Loan Percentage</label>
                  <input
                    type="number"
                    name="loanPercent"
                    value={formData.loanPercent}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    max="90"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="20"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block mb-2">Loan Tenure (Years)</label>
                  <input
                    type="number"
                    name="loanTenureYears"
                    value={formData.loanTenureYears}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="30"
                    step="1"
                  />
                </div>
              </>
            )}
          </>
        )}

        {formData.propertyType === 'flat' && (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="pmayToggle"
                checked={formData.pmayToggle}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label className="inline-flex items-center">Apply PMAY Subsidy <InfoTooltip text="Subsidy applies to eligible buyers under PMAY; approximate savings assumed at 2% of construction cost." href="https://pmay-urban.gov.in/" /></label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="gstToggle"
                checked={formData.gstToggle}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label className="inline-flex items-center">Include GST <InfoTooltip text="GST at 5% is applied on under-construction properties; resale typically has no GST." href="https://www.cbic.gov.in/" /></label>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                name="includeLoan"
                checked={formData.includeLoan}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label>Include Loan/EMI</label>
            </div>

            {formData.includeLoan && (
              <>
                <div>
                  <label className="block mb-2">Loan Percentage</label>
                  <input
                    type="number"
                    name="loanPercent"
                    value={formData.loanPercent}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    max="90"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="20"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block mb-2">Loan Tenure (Years)</label>
                  <input
                    type="number"
                    name="loanTenureYears"
                    value={formData.loanTenureYears}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="30"
                    step="1"
                  />
                </div>
              </>
            )}
          </>
        )

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Calculating...' : 'Calculate Cost'}
        </button>

        <button
          type="button"
          className="w-full mt-2 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          onClick={() => {
            const params = new URLSearchParams();
            Object.entries(formData).forEach(([key, rawVal]) => {
              if (rawVal === '' || rawVal === undefined || rawVal === null) return;
              // Only include loan fields if includeLoan is true
              if ((key === 'loanPercent' || key === 'interestRate' || key === 'loanTenureYears') && !formData.includeLoan) return;
              params.set(key, String(rawVal));
            });
            const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert('Shareable link copied to clipboard');
            });
          }}
        >
          Copy Shareable Link
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (() => {
        const city = cities.find(c => c.id === formData.cityId);
        const ctry = city?.country || 'India';
        const fmt = (n: number) => formatCurrency(n, ctry);
        return (
          <div className="mt-6 p-4 bg-green-50 rounded">
            <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
            <div className="space-y-2">
              <p>Base Cost: {fmt(result.baseCost)}</p>
              {result.gst !== undefined && result.gst > 0 && (
                <p>GST (5%): {fmt(result.gst)}</p>
              )}
              <p>Stamp Duty: {fmt(result.stampDuty)}</p>
              <p>Registration: {fmt(result.registration)}</p>
              {result.subsidySavings !== undefined && result.subsidySavings > 0 && (
                <p className="text-green-600">
                  PMAY Subsidy Savings: {fmt(result.subsidySavings)}
                </p>
              )}
              <div className="border-t pt-2 mt-2">
                <p className="text-lg font-bold">
                  Total Cost: {fmt(result.totalPayable)}
                </p>
              </div>
              {result.emi && (
                <div className="mt-4">
                  <h3 className="font-semibold">Loan Details</h3>
                  <p>Loan Amount: {fmt(result.loanAmount!)}</p>
                  <p>Down Payment: {fmt(result.downPayment!)}</p>
                  <p>Monthly EMI: {fmt(result.emi)}</p>
                  <p>Loan Tenure: {result.loanTenureYears} years</p>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600">
                <p>State: {result.stateInfo.state}</p>
                <p>Stamp Duty Rate: {result.stateInfo.dutyPercent}%</p>
                {result.stateInfo.femaleRebate && (
                  <p>Female Rebate: {result.stateInfo.femaleRebate}%</p>
                )}
                <p>Registration Rate: {result.stateInfo.registrationPercent}%</p>
                {result.stateInfo.note && (
                  <p className="text-green-600">{result.stateInfo.note}</p>
                )}
              </div>
              {rulesMeta && (
                <div className="mt-2 text-xs text-gray-500">
                  Last verified {rulesMeta.lastUpdated}. Rules version {rulesMeta.version}. Source: {rulesMeta.source}
                </div>
              )}
              <div className="mt-4">
                <a href="/receipt" className="text-blue-600 underline">Open printable receipt</a>
              </div>
            </div>
          </div>
        );
      })()}

      {formData.cityId && (
        <PriceTrendChart cityId={formData.cityId} country={cities.find(c => c.id === formData.cityId)?.country} />
      )}

      <SavedCalculations onLoad={(inputs) => setFormData(prev => ({ ...prev, ...inputs }))} />
    </div>
  );
} 