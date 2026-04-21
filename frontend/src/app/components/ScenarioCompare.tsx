"use client";
import React, { useEffect, useMemo, useState } from 'react';
import InfoTooltip from './InfoTooltip';

type PropertyType = 'flat' | 'house';

interface City {
  id: string;
  name: string;
  state: string;
  tier: 'tier1' | 'tier2' | 'tier3';
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

interface ScenarioForm {
  cityId: string;
  propertyType: PropertyType;
  builtUpSqft: string;
  plotSqft: string;
  budgetQuality: 'basic' | 'standard' | 'luxury';
  landLocation: 'cityCore' | 'suburb' | 'custom';
  customLandRate: string;
  gender: 'male' | 'female';
  pmayToggle: boolean;
  gstToggle: boolean;
  includePermits: boolean;
  includeLoan: boolean;
  loanPercent: string;
  interestRate: string;
  loanTenureYears: string;
}

const defaultScenario: ScenarioForm = {
  cityId: '',
  propertyType: 'flat',
  builtUpSqft: '',
  plotSqft: '',
  budgetQuality: 'standard',
  landLocation: 'suburb',
  customLandRate: '',
  gender: 'male',
  pmayToggle: false,
  gstToggle: true,
  includePermits: false,
  includeLoan: false,
  loanPercent: '80',
  interestRate: '8.5',
  loanTenureYears: '20',
};

export default function ScenarioCompare() {
  const [cities, setCities] = useState<City[]>([]);
  const [a, setA] = useState<ScenarioForm>({ ...defaultScenario });
  const [b, setB] = useState<ScenarioForm>({ ...defaultScenario });
  const [resA, setResA] = useState<CalculationResult | null>(null);
  const [resB, setResB] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      const response = await fetch('/api/cities');
      if (response.ok) setCities(await response.json());
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const loadScenario = (prefix: 'a' | 'b', setter: (s: ScenarioForm) => void) => {
      const updated: Record<string, any> = {};
      const keys: (keyof ScenarioForm)[] = ['cityId','propertyType','builtUpSqft','plotSqft','budgetQuality','landLocation','customLandRate','gender','pmayToggle','gstToggle','includePermits','includeLoan','loanPercent','interestRate','loanTenureYears'];
      for (const key of keys) {
        const v = params.get(`${prefix}_${key}`);
        if (v !== null) {
          if (v === 'true' || v === 'false') updated[key] = v === 'true';
          else updated[key] = v;
        }
      }
      if (Object.keys(updated).length) setter(prev => ({ ...prev, ...updated }));
    };
    loadScenario('a', setA);
    loadScenario('b', setB);
  }, []);

  const diff = useMemo(() => {
    if (!resA || !resB) return null;
    return {
      total: resB.totalPayable - resA.totalPayable,
      emi: (resB.emi ?? 0) - (resA.emi ?? 0),
      stamp: resB.stampDuty - resA.stampDuty,
      reg: resB.registration - resA.registration,
    };
  }, [resA, resB]);

  async function computeScenario(input: ScenarioForm): Promise<CalculationResult> {
    const endpoint = input.propertyType === 'flat' ? '/api/flat' : '/api/house';
    const payload = input.propertyType === 'flat'
      ? {
          cityId: input.cityId,
          builtUpSqft: Number(input.builtUpSqft),
          budgetQuality: input.budgetQuality,
          gender: input.gender,
          pmayToggle: input.pmayToggle,
          gstToggle: input.gstToggle,
          includeLoan: input.includeLoan,
          ...(input.includeLoan ? {
            loanPercent: Number(input.loanPercent),
            interestRate: Number(input.interestRate),
            loanTenureYears: Number(input.loanTenureYears),
          } : {}),
        }
      : {
          cityId: input.cityId,
          plotSqft: Number(input.plotSqft),
          builtUpSqft: Number(input.builtUpSqft),
          landLocation: input.landLocation,
          customLandRate: input.customLandRate ? Number(input.customLandRate) : undefined,
          quality: input.budgetQuality,
          includePermits: input.includePermits,
          includeLoan: input.includeLoan,
          ...(input.includeLoan ? {
            loanPercent: Number(input.loanPercent),
            interestRate: Number(input.interestRate),
            loanTenureYears: Number(input.loanTenureYears),
          } : {}),
        };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Calculation failed');
    return await res.json();
  }

  async function onCompare() {
    try {
      setError(null);
      setLoading(true);
      const [ra, rb] = await Promise.all([computeScenario(a), computeScenario(b)]);
      setResA(ra);
      setResB(rb);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to compare');
    } finally {
      setLoading(false);
    }
  }

  function copyShareLink() {
    const params = new URLSearchParams();
    const put = (prefix: 'a'|'b', s: ScenarioForm) => {
      Object.entries(s).forEach(([k, v]) => {
        if (v === '' || v === undefined || v === null) return;
        if ((k === 'loanPercent' || k === 'interestRate' || k === 'loanTenureYears') && !s.includeLoan) return;
        params.set(`${prefix}_${k}`, String(v));
      });
    };
    put('a', a);
    put('b', b);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert('Compare link copied to clipboard');
  }

  const Panel = ({ label, s, setS }: { label: string; s: ScenarioForm; setS: (u: any) => void }) => (
    <div className="flex-1 bg-white rounded border p-4 space-y-3">
      <h3 className="font-semibold">{label}</h3>
      <div>
        <label className="block mb-1">City</label>
        <select className="w-full p-2 border rounded" value={s.cityId} onChange={e => setS((p: ScenarioForm) => ({ ...p, cityId: e.target.value }))}>
          <option value="">Select City</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Property Type</label>
        <select className="w-full p-2 border rounded" value={s.propertyType} onChange={e => setS((p: ScenarioForm) => ({ ...p, propertyType: e.target.value as PropertyType }))}>
          <option value="flat">Flat</option>
          <option value="house">Independent House</option>
        </select>
      </div>
      {s.propertyType === 'house' && (
        <div>
          <label className="block mb-1">Plot Area (sq ft)</label>
          <input className="w-full p-2 border rounded" type="number" value={s.plotSqft} onChange={e => setS((p: ScenarioForm) => ({ ...p, plotSqft: e.target.value }))} />
        </div>
      )}
      <div>
        <label className="block mb-1">Built-up Area (sq ft)</label>
        <input className="w-full p-2 border rounded" type="number" value={s.builtUpSqft} onChange={e => setS((p: ScenarioForm) => ({ ...p, builtUpSqft: e.target.value }))} />
      </div>
      <div>
        <label className="block mb-1">Quality</label>
        <select className="w-full p-2 border rounded" value={s.budgetQuality} onChange={e => setS((p: ScenarioForm) => ({ ...p, budgetQuality: e.target.value as any }))}>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
      {s.propertyType === 'house' && (
        <>
          <div>
            <label className="block mb-1">Location Type</label>
            <select className="w-full p-2 border rounded" value={s.landLocation} onChange={e => setS((p: ScenarioForm) => ({ ...p, landLocation: e.target.value as any }))}>
              <option value="cityCore">City Core</option>
              <option value="suburb">Suburb</option>
              <option value="custom">Custom Rate</option>
            </select>
          </div>
          {s.landLocation === 'custom' && (
            <div>
              <label className="block mb-1">Custom Land Rate (₹/sq ft)</label>
              <input className="w-full p-2 border rounded" type="number" value={s.customLandRate} onChange={e => setS((p: ScenarioForm) => ({ ...p, customLandRate: e.target.value }))} />
            </div>
          )}
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={s.includePermits} onChange={e => setS((p: ScenarioForm) => ({ ...p, includePermits: e.target.checked }))} />
            Include Permits <InfoTooltip text="Permits ~3% of construction cost." href="https://www.mohua.gov.in/" />
          </label>
        </>
      )}
      {s.propertyType === 'flat' && (
        <>
          <div>
            <label className="block mb-1">Gender</label>
            <select className="w-full p-2 border rounded" value={s.gender} onChange={e => setS((p: ScenarioForm) => ({ ...p, gender: e.target.value as any }))}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={s.pmayToggle} onChange={e => setS((p: ScenarioForm) => ({ ...p, pmayToggle: e.target.checked }))} />
            PMAY <InfoTooltip text="Eligible buyers may get subsidy (~2%)." href="https://pmay-urban.gov.in/" />
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={s.gstToggle} onChange={e => setS((p: ScenarioForm) => ({ ...p, gstToggle: e.target.checked }))} />
            Include GST <InfoTooltip text="GST 5% for under-construction." href="https://www.cbic.gov.in/" />
          </label>
        </>
      )}
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={s.includeLoan} onChange={e => setS((p: ScenarioForm) => ({ ...p, includeLoan: e.target.checked }))} />
        Include Loan/EMI
      </label>
      {s.includeLoan && (
        <>
          <div>
            <label className="block mb-1">Loan Percentage</label>
            <input className="w-full p-2 border rounded" type="number" value={s.loanPercent} onChange={e => setS((p: ScenarioForm) => ({ ...p, loanPercent: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1">Interest Rate (%)</label>
            <input className="w-full p-2 border rounded" type="number" value={s.interestRate} onChange={e => setS((p: ScenarioForm) => ({ ...p, interestRate: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1">Loan Tenure (Years)</label>
            <input className="w-full p-2 border rounded" type="number" value={s.loanTenureYears} onChange={e => setS((p: ScenarioForm) => ({ ...p, loanTenureYears: e.target.value }))} />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Scenario Compare</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel label="Scenario A" s={a} setS={setA} />
        <Panel label="Scenario B" s={b} setS={setB} />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onCompare} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300">{loading ? 'Comparing...' : 'Compare'}</button>
        <button onClick={copyShareLink} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Copy Shareable Link</button>
      </div>
      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {(resA || resB) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Result A</h3>
            {resA ? (
              <div className="text-sm space-y-1">
                <div>Total: ₹{resA.totalPayable.toLocaleString()}</div>
                <div>Base: ₹{resA.baseCost.toLocaleString()}</div>
                <div>Stamp: ₹{resA.stampDuty.toLocaleString()}</div>
                <div>Reg: ₹{resA.registration.toLocaleString()}</div>
                {resA.emi && <div>EMI: ₹{resA.emi.toLocaleString()}</div>}
              </div>
            ) : <div className="text-sm text-gray-500">No result</div>}
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Result B</h3>
            {resB ? (
              <div className="text-sm space-y-1">
                <div>Total: ₹{resB.totalPayable.toLocaleString()}</div>
                <div>Base: ₹{resB.baseCost.toLocaleString()}</div>
                <div>Stamp: ₹{resB.stampDuty.toLocaleString()}</div>
                <div>Reg: ₹{resB.registration.toLocaleString()}</div>
                {resB.emi && <div>EMI: ₹{resB.emi.toLocaleString()}</div>}
              </div>
            ) : <div className="text-sm text-gray-500">No result</div>}
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Difference (B - A)</h3>
            {diff ? (
              <div className="text-sm space-y-1">
                <div>Δ Total: ₹{diff.total.toLocaleString()}</div>
                <div>Δ EMI: ₹{diff.emi.toLocaleString()}</div>
                <div>Δ Stamp: ₹{diff.stamp.toLocaleString()}</div>
                <div>Δ Reg: ₹{diff.reg.toLocaleString()}</div>
              </div>
            ) : <div className="text-sm text-gray-500">Run compare to see differences</div>}
          </div>
        </div>
      )}
    </div>
  );
}

