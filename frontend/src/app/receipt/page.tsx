'use client';
import React, { useEffect, useState } from 'react';
import TopNav from '../components/TopNav';

interface ReceiptData {
  inputs: Record<string, any>;
  result: any;
  rulesMeta?: { version: string; lastUpdated: string; source: string };
}

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

  return (
    <>
      <TopNav />
      <main className="max-w-3xl mx-auto py-10 px-6 bg-white">
        <h1 className="text-2xl font-bold mb-2">Calculation Receipt</h1>
        {data.rulesMeta && (
          <div className="text-xs text-gray-600 mb-4">Rules v{data.rulesMeta.version} • Last verified {data.rulesMeta.lastUpdated} • Source: {data.rulesMeta.source}</div>
        )}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Inputs</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(data.inputs).map(([k, v]) => (
                <tr key={k} className="odd:bg-gray-50">
                  <td className="p-2 font-medium capitalize">{k}</td>
                  <td className="p-2">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2 className="font-semibold mb-2">Results</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(data.result).map(([k, v]) => (
                <tr key={k} className="odd:bg-gray-50">
                  <td className="p-2 font-medium capitalize">{k}</td>
                  <td className="p-2">{typeof v === 'number' ? v.toLocaleString() : String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onPrint}>Print / Save as PDF</button>
        </div>
      </main>
    </>
  );
}

