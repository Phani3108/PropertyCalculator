'use client';
import React, { useEffect, useState } from 'react';
import TopNav from '../components/TopNav';
import { formatCurrency } from '../lib/currency';

interface ReceiptData {
  inputs: Record<string, any>;
  result: any;
  rulesMeta?: { version: string; lastUpdated: string; source: string };
  country?: string;
}

const COST_KEYS = ['baseCost', 'stampDuty', 'registration', 'gst', 'subsidySavings', 'loanAmount', 'downPayment', 'emi', 'totalPayable'];

export default function ReceiptPage() {
  const [data, setData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('prop_calc_receipt');
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  function onPrint() {
    window.print();
  }

  if (!data) {
    return (
      <>
        <TopNav />
        <main className="max-w-3xl mx-auto pt-24 pb-12 px-6">
          <div className="glass-card p-8 text-center text-sand-500">No receipt found. Run a calculation first.</div>
        </main>
      </>
    );
  }

  const ctry = data.country || 'India';
  const fmt = (n: number) => formatCurrency(n, ctry);

  const breakdownItems = COST_KEYS
    .filter(k => data.result[k] !== undefined && data.result[k] > 0 && k !== 'totalPayable')
    .map(k => ({ label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), value: data.result[k] as number }));
  const maxBreakdown = Math.max(...breakdownItems.map(b => b.value), 1);

  return (
    <>
      <TopNav />
      <div
        className="page-bg"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=60&auto=format&fit=crop')` }}
      />
      <main className="relative max-w-3xl mx-auto pt-24 pb-12 px-6">
        <div className="glass-card p-6 sm:p-8 print:bg-white print:shadow-none print:border-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 no-print">
            <h1 className="text-2xl font-serif font-bold text-espresso">Property Cost Receipt</h1>
            <button className="btn-gold !py-2 !px-5 text-sm" onClick={onPrint}>Print / PDF</button>
          </div>
          <h1 className="text-2xl font-serif font-bold text-espresso mb-4 hidden print:block">Property Cost Receipt</h1>

          {/* Gold top accent bar (print) */}
          <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 rounded-full mb-6" />

          {data.rulesMeta && (
            <div className="text-xs text-sand-400 mb-5">Rules v{data.rulesMeta.version} · Verified {data.rulesMeta.lastUpdated}</div>
          )}

          {/* Inputs */}
          <section className="mb-6">
            <h2 className="label-luxury uppercase tracking-widest text-xs mb-3">Inputs</h2>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(data.inputs).map(([k, v]) => (
                  <tr key={k} className="border-b border-sand-200 last:border-0">
                    <td className="py-2.5 font-medium text-espresso capitalize w-1/3">{k.replace(/([A-Z])/g, ' $1')}</td>
                    <td className="py-2.5 text-sand-500">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="divider-gold" />

          {/* Cost Breakdown */}
          <section className="mb-6">
            <h2 className="label-luxury uppercase tracking-widest text-xs mb-3">Cost Breakdown</h2>
            <table className="w-full text-sm">
              <tbody>
                {breakdownItems.map(item => (
                  <tr key={item.label} className="border-b border-sand-200 last:border-0">
                    <td className="py-2.5 font-medium text-espresso w-1/3">{item.label}</td>
                    <td className="py-2.5 font-mono text-sand-500">{fmt(item.value)}</td>
                  </tr>
                ))}
                <tr className="bg-gold-400/10 font-bold">
                  <td className="py-3 px-2 rounded-l-lg text-espresso">Total Payable</td>
                  <td className="py-3 px-2 rounded-r-lg font-mono text-espresso">{fmt(data.result.totalPayable)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Visual bars */}
          {breakdownItems.length > 1 && (
            <section className="mb-6">
              <h2 className="label-luxury uppercase tracking-widest text-xs mb-3">Visual Breakdown</h2>
              <div className="space-y-2.5">
                {breakdownItems.map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs w-24 text-right truncate text-sand-500">{item.label}</span>
                    <div className="flex-1 h-5 bg-sand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / maxBreakdown) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs w-28 font-mono text-sand-500">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.result.stateInfo && (
            <section className="mb-6 text-sm text-sand-500">
              <h2 className="label-luxury uppercase tracking-widest text-xs mb-2">Tax Info</h2>
              <p>Region: {data.result.stateInfo.state} · Stamp Duty: {data.result.stateInfo.dutyPercent}% · Registration: {data.result.stateInfo.registrationPercent}%</p>
              {data.result.stateInfo.femaleRebate && <p>Female Rebate: {data.result.stateInfo.femaleRebate}%</p>}
            </section>
          )}

          {/* Footer */}
          <div className="divider-gold" />
          <div className="text-xs text-sand-400 text-center">
            Generated by PropCalc · {new Date().toLocaleDateString()} · For informational purposes only
          </div>
        </div>
      </main>
    </>
  );
}

