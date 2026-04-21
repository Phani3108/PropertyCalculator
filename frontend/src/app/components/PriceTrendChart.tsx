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
    <div className="mt-6 p-5 result-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-espresso text-sm">Price Trend (per sq ft)</h3>
        <div className="flex gap-3 text-xs">
          {yoy !== null && (
            <span className={yoy >= 0 ? 'text-green-700' : 'text-red-600'}>
              YoY: {yoy >= 0 ? '+' : ''}{yoy}%
            </span>
          )}
          {cagr !== null && (
            <span className="text-gold-600 font-medium">5Y CAGR: {cagr}%</span>
          )}
        </div>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {data.map((point: PriceTrendPoint, i: number) => {
          const height = Math.max(8, ((point.avgPricePerSqft - min) / range) * 100 + 20);
          const isLatest = i === data.length - 1;
          return (
            <div key={point.year} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-sand-400">
                {formatCurrency(point.avgPricePerSqft, country)}
              </span>
              <div
                className={`w-full rounded-t transition-all ${isLatest ? 'bg-gradient-to-t from-gold-500 to-gold-400' : 'bg-sand-200'}`}
                style={{ height: `${height}%` }}
                title={`${point.year}: ${formatCurrency(point.avgPricePerSqft, country)}/sqft`}
              />
              <span className="text-[10px] text-sand-500 font-medium">{point.year}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
