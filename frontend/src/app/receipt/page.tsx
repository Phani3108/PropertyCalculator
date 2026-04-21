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
        <main className="max-w-3xl mx-auto py-10 px-6">
          <div className="text-gray-600">No receipt found. Run a calculation to generate a receipt.</div>
        </main>
      </>
    );
  }

  const ctry = data.country || 'India';
  const fmt = (n: number) => formatCurrency(n, ctry);

  // Build cost breakdown chart data
  const breakdownItems = COST_KEYS
    .filter(k => data.result[k] !== undefined && data.result[k] > 0 && k !== 'totalPayable')
    .map(k => ({ label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), value: data.result[k] as number }));
  const maxBreakdown = Math.max(...breakdownItems.map(b => b.value), 1);

  return (
    <>
      <TopNav />
      <main className="max-w-3xl mx-auto py-10 px-6 bg-white print:px-2">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h1 className="text-2xl font-bold">Calculation Receipt</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm" onClick={onPrint}>Print / Save as PDF</button>
        </div>
        <h1 className="text-2xl font-bold mb-2 hidden print:block">Property Cost Receipt</h1>

        {data.rulesMeta && (
          <div className="text-xs text-gray-500 mb-4">Rules v{data.rulesMeta.version} · Verified {data.rulesMeta.lastUpdated} · Source: {data.rulesMeta.source}</div>
        )}

        <section className="mb-6">
          <h2 className="font-semibold mb-2 text-sm text-gray-700 uppercase tracking-wide">Inputs</h2>
          <table className="w-full text-sm border">
            <tbody>
              {Object.entries(data.inputs).map(([k, v]) => (
                <tr key={k} className="odd:bg-gray-50 border-b">
                  <td className="p-2 font-medium capitalize w-1/3">{k.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="p-2">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-2 text-sm text-gray-700 uppercase tracking-wide">Cost Breakdown</h2>
          <table className="w-full text-sm border">
            <tbody>
              {breakdownItems.map(item => (
                <tr key={item.label} className="odd:bg-gray-50 border-b">
                  <td className="p-2 font-medium w-1/3">{item.label}</td>
                  <td className="p-2 font-mono">{fmt(item.value)}</td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
                <td className="p-2">Total Payable</td>
                <td className="p-2 font-mono">{fmt(data.result.totalPayable)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {breakdownItems.length > 1 && (
          <section className="mb-6">
            <h2 className="font-semibold mb-2 text-sm text-gray-700 uppercase tracking-wide">Visual Breakdown</h2>
            <div className="space-y-2">
              {breakdownItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xs w-28 text-right truncate">{item.label}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded"
                      style={{ width: `${(item.value / maxBreakdown) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-28 font-mono">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.result.stateInfo && (
          <section className="mb-6 text-sm text-gray-600">
            <h2 className="font-semibold mb-2 text-sm text-gray-700 uppercase tracking-wide">Tax Info</h2>
            <p>Region: {data.result.stateInfo.state} · Stamp Duty: {data.result.stateInfo.dutyPercent}% · Registration: {data.result.stateInfo.registrationPercent}%</p>
            {data.result.stateInfo.femaleRebate && <p>Female Rebate: {data.result.stateInfo.femaleRebate}%</p>}
            {data.result.stateInfo.note && <p className="text-green-600">{data.result.stateInfo.note}</p>}
          </section>
        )}

        <div className="text-xs text-gray-400 mt-8 border-t pt-3">
          Generated by PropertyCalculator · {new Date().toLocaleDateString()} · For informational purposes only
        </div>
      </main>
    </>
  );
}

