'use client';
import React from 'react';
import { getTrendForCity, getYoYGrowth, getCAGR, PriceTrendPoint } from '../lib/trends';
import { formatCurrency } from '../lib/currency';

interface Props {
  cityId: string;
  country?: string;
}

export default function PriceTrendChart({ cityId, country }: Props) {
  const data = getTrendForCity(cityId);
  if (!data || data.length === 0) return null;

  const yoy = getYoYGrowth(cityId);
  const cagr = getCAGR(cityId);
  const max = Math.max(...data.map(d => d.avgPricePerSqft));
  const min = Math.min(...data.map(d => d.avgPricePerSqft));
  const range = max - min || 1;

  return (
    <div className="mt-4 p-4 bg-white border rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">📈 Price Trend (per sq ft)</h3>
        <div className="flex gap-3 text-xs">
          {yoy !== null && (
            <span className={yoy >= 0 ? 'text-green-600' : 'text-red-600'}>
              YoY: {yoy >= 0 ? '+' : ''}{yoy}%
            </span>
          )}
          {cagr !== null && (
            <span className="text-blue-600">5Y CAGR: {cagr}%</span>
          )}
        </div>
      </div>
      <div className="flex items-end gap-1" style={{ height: 120 }}>
        {data.map((point: PriceTrendPoint, i: number) => {
          const height = Math.max(8, ((point.avgPricePerSqft - min) / range) * 100 + 20);
          const isLatest = i === data.length - 1;
          return (
            <div key={point.year} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">
                {formatCurrency(point.avgPricePerSqft, country)}
              </span>
              <div
                className={`w-full rounded-t transition-all ${isLatest ? 'bg-blue-500' : 'bg-blue-200'}`}
                style={{ height: `${height}%` }}
                title={`${point.year}: ${formatCurrency(point.avgPricePerSqft, country)}/sqft`}
              />
              <span className="text-[10px] text-gray-400">{point.year}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
