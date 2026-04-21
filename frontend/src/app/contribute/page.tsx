'use client';
import React, { useState } from 'react';
import TopNav from '../components/TopNav';

interface RuleForm {
  region: string;
  country: string;
  propertyTypes: string[];
  stampDuty: string;
  femaleRebate: string;
  registrationFee: string;
  gstApplicable: boolean;
  maxLtv: string;
  interestRate: string;
  tenureYears: string;
  source: string;
  updatedBy: string;
  notes: string;
}

const emptyForm: RuleForm = {
  region: '', country: '', propertyTypes: ['flat', 'house'],
  stampDuty: '', femaleRebate: '', registrationFee: '',
  gstApplicable: false, maxLtv: '0.8', interestRate: '0.08',
  tenureYears: '20', source: '', updatedBy: '', notes: '',
};

export default function ContributePage() {
  const [form, setForm] = useState<RuleForm>({ ...emptyForm });
  const [output, setOutput] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function validate(): string[] {
    const errs: string[] = [];
    if (!form.region.trim()) errs.push('Region is required');
    if (!form.country.trim()) errs.push('Country is required');
    const sd = Number(form.stampDuty);
    if (isNaN(sd) || sd < 0 || sd > 1) errs.push('Stamp duty must be 0–1 (e.g. 0.05 for 5%)');
    const rf = Number(form.registrationFee);
    if (isNaN(rf) || rf < 0 || rf > 1) errs.push('Registration fee must be 0–1');
    if (!form.source.trim()) errs.push('Source URL is required');
    if (!form.updatedBy.trim()) errs.push('Your name / handle is required');
    return errs;
  }

  function generateJson() {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    const rule: Record<string, any> = {
      region: form.region.trim(),
      property_types: form.propertyTypes,
      stamp_duty: Number(form.stampDuty),
      registration_fee: Number(form.registrationFee),
      gst_applicable: form.gstApplicable,
      loan: {
        max_ltv: Number(form.maxLtv),
        interest_rate: Number(form.interestRate),
        tenure_years: Number(form.tenureYears),
      },
      last_verified: new Date().toISOString().slice(0, 10),
      source: form.source.trim(),
      updated_by: form.updatedBy.trim(),
      data_version: 'v1.0',
    };
    if (form.femaleRebate && Number(form.femaleRebate) > 0) {
      rule.female_rebate = Number(form.femaleRebate);
    }
    if (form.notes.trim()) {
      rule.notes = form.notes.trim();
    }
    setOutput(JSON.stringify(rule, null, 2));
  }

  const countryFolder = form.country.toLowerCase().replace(/\s+/g, '') || 'country';
  const regionFile = form.region.toLowerCase().replace(/\s+/g, '') || 'region';
  const filePath = `frontend/public/rules/${countryFolder}/${regionFile}.json`;

  return (
    <>
      <TopNav />
      <main className="max-w-3xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-2">🌍 Add Your City</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Contribute property tax rules for your city/region. Fill in the form below, generate the JSON, 
          and submit a Pull Request adding the file to <code className="bg-gray-100 px-1 rounded">{filePath}</code>.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <input className="w-full p-2 border rounded" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. India" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region / State *</label>
              <input className="w-full p-2 border rounded" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="e.g. Karnataka" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Property Types</label>
            <div className="flex gap-3">
              {['flat', 'house', 'villa', 'land'].map(t => (
                <label key={t} className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.propertyTypes.includes(t)}
                    onChange={e => {
                      setForm(f => ({
                        ...f,
                        propertyTypes: e.target.checked
                          ? [...f.propertyTypes, t]
                          : f.propertyTypes.filter(x => x !== t),
                      }));
                    }}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stamp Duty * <span className="text-gray-400">(0.05 = 5%)</span></label>
              <input className="w-full p-2 border rounded" type="number" step="0.001" min="0" max="1" value={form.stampDuty} onChange={e => setForm(f => ({ ...f, stampDuty: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Female Rebate <span className="text-gray-400">(optional)</span></label>
              <input className="w-full p-2 border rounded" type="number" step="0.001" min="0" max="1" value={form.femaleRebate} onChange={e => setForm(f => ({ ...f, femaleRebate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration Fee *</label>
              <input className="w-full p-2 border rounded" type="number" step="0.001" min="0" max="1" value={form.registrationFee} onChange={e => setForm(f => ({ ...f, registrationFee: e.target.value }))} />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.gstApplicable} onChange={e => setForm(f => ({ ...f, gstApplicable: e.target.checked }))} />
            GST Applicable
          </label>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max LTV</label>
              <input className="w-full p-2 border rounded" type="number" step="0.05" min="0" max="1" value={form.maxLtv} onChange={e => setForm(f => ({ ...f, maxLtv: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Interest Rate</label>
              <input className="w-full p-2 border rounded" type="number" step="0.005" min="0" max="1" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tenure (years)</label>
              <input className="w-full p-2 border rounded" type="number" min="1" max="50" value={form.tenureYears} onChange={e => setForm(f => ({ ...f, tenureYears: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source URL *</label>
              <input className="w-full p-2 border rounded" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Name / GitHub Handle *</label>
              <input className="w-full p-2 border rounded" value={form.updatedBy} onChange={e => setForm(f => ({ ...f, updatedBy: e.target.value }))} placeholder="@username" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea className="w-full p-2 border rounded" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}

          <button onClick={generateJson} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Generate JSON
          </button>

          {output && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generated Rule — save as <code className="bg-gray-100 px-1 rounded text-xs">{filePath}</code></span>
                <button
                  onClick={() => { navigator.clipboard.writeText(output); alert('Copied!'); }}
                  className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto max-h-64">{output}</pre>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
                <h3 className="font-semibold mb-2">How to submit:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Fork the <a href="https://github.com/Phani3108/PropertyCalculator" target="_blank" rel="noreferrer" className="text-blue-600 underline">PropertyCalculator repo</a></li>
                  <li>Create the file at <code className="bg-white px-1 rounded">{filePath}</code></li>
                  <li>Paste the generated JSON above</li>
                  <li>Open a Pull Request — CI will auto-validate your rule against the schema</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
