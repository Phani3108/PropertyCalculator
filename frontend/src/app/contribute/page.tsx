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
      <div
        className="page-bg"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=60&auto=format&fit=crop')` }}
      />
      <main className="relative max-w-3xl mx-auto pt-24 pb-12 px-6">
        <div className="glass-card p-6 sm:p-8">
        <h1 className="text-2xl font-serif font-bold text-espresso mb-1">Add Your City</h1>
        <p className="text-sand-500 text-sm mb-6">
          Contribute property tax rules for your city. Fill the form, generate JSON, and submit a Pull Request to&nbsp;
          <code className="bg-sand-100 px-1.5 py-0.5 rounded text-xs">{filePath}</code>.
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-luxury">Country *</label>
              <input className="input-luxury" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. India" />
            </div>
            <div>
              <label className="label-luxury">Region / State *</label>
              <input className="input-luxury" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="e.g. Karnataka" />
            </div>
          </div>

          <div>
            <label className="label-luxury">Property Types</label>
            <div className="flex gap-4">
              {['flat', 'house', 'villa', 'land'].map(t => (
                <label key={t} className="inline-flex items-center gap-1.5 text-sm text-espresso capitalize">
                  <input
                    type="checkbox"
                    className="checkbox-luxury"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-luxury">Stamp Duty * <span className="text-sand-400 font-normal">(0.05 = 5%)</span></label>
              <input className="input-luxury" type="number" step="0.001" min="0" max="1" value={form.stampDuty} onChange={e => setForm(f => ({ ...f, stampDuty: e.target.value }))} />
            </div>
            <div>
              <label className="label-luxury">Female Rebate <span className="text-sand-400 font-normal">(optional)</span></label>
              <input className="input-luxury" type="number" step="0.001" min="0" max="1" value={form.femaleRebate} onChange={e => setForm(f => ({ ...f, femaleRebate: e.target.value }))} />
            </div>
            <div>
              <label className="label-luxury">Registration Fee *</label>
              <input className="input-luxury" type="number" step="0.001" min="0" max="1" value={form.registrationFee} onChange={e => setForm(f => ({ ...f, registrationFee: e.target.value }))} />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-espresso">
            <input type="checkbox" className="checkbox-luxury" checked={form.gstApplicable} onChange={e => setForm(f => ({ ...f, gstApplicable: e.target.checked }))} />
            GST Applicable
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-luxury">Max LTV</label>
              <input className="input-luxury" type="number" step="0.05" min="0" max="1" value={form.maxLtv} onChange={e => setForm(f => ({ ...f, maxLtv: e.target.value }))} />
            </div>
            <div>
              <label className="label-luxury">Interest Rate</label>
              <input className="input-luxury" type="number" step="0.005" min="0" max="1" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} />
            </div>
            <div>
              <label className="label-luxury">Tenure (years)</label>
              <input className="input-luxury" type="number" min="1" max="50" value={form.tenureYears} onChange={e => setForm(f => ({ ...f, tenureYears: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-luxury">Source URL *</label>
              <input className="input-luxury" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="label-luxury">Your Name / GitHub Handle *</label>
              <input className="input-luxury" value={form.updatedBy} onChange={e => setForm(f => ({ ...f, updatedBy: e.target.value }))} placeholder="@username" />
            </div>
          </div>

          <div>
            <label className="label-luxury">Notes (optional)</label>
            <textarea className="input-luxury resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}

          <button onClick={generateJson} className="btn-gold">
            Generate JSON
          </button>

          {output && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-espresso">Save as <code className="bg-sand-100 px-1.5 py-0.5 rounded text-xs">{filePath}</code></span>
                <button
                  onClick={() => { navigator.clipboard.writeText(output); alert('Copied!'); }}
                  className="btn-secondary !px-3 !py-1 text-xs"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-charcoal text-gold-400 p-5 rounded-xl text-sm overflow-auto max-h-64">{output}</pre>

              <div className="mt-5 p-5 bg-sand-100 border border-sand-200 rounded-xl text-sm text-espresso">
                <h3 className="font-serif font-semibold mb-2">How to submit:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sand-500">
                  <li>Fork the <a href="https://github.com/Phani3108/PropertyCalculator" target="_blank" rel="noreferrer" className="text-gold-600 hover:underline">PropertyCalculator repo</a></li>
                  <li>Create the file at <code className="bg-white px-1 rounded">{filePath}</code></li>
                  <li>Paste the generated JSON above</li>
                  <li>Open a Pull Request — CI will auto-validate your rule against the schema</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </>
  );
}
