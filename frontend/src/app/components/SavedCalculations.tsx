'use client';
import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../lib/currency';

export interface SavedCalc {
  id: string;
  timestamp: number;
  cityName: string;
  country: string;
  propertyType: string;
  totalPayable: number;
  inputs: Record<string, any>;
}

const STORAGE_KEY = 'prop_calc_saved_v1';
const MAX_SAVED = 20;

export function getSavedCalculations(): SavedCalc[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCalculation(calc: Omit<SavedCalc, 'id' | 'timestamp'>): void {
  const list = getSavedCalculations();
  const entry: SavedCalc = {
    ...calc,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  list.unshift(entry);
  if (list.length > MAX_SAVED) list.length = MAX_SAVED;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function deleteCalculation(id: string): void {
  const list = getSavedCalculations().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function clearAllCalculations(): void {
  localStorage.removeItem(STORAGE_KEY);
}

interface Props {
  onLoad?: (inputs: Record<string, any>) => void;
}

export default function SavedCalculations({ onLoad }: Props) {
  const [calcs, setCalcs] = useState<SavedCalc[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setCalcs(getSavedCalculations());
  }, []);

  if (calcs.length === 0) return null;

  return (
    <div className="mt-6 p-5 result-card">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-serif font-semibold text-espresso text-sm">Saved Calculations ({calcs.length})</h3>
        <span className="text-xs text-sand-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {calcs.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-sand-50 rounded-xl text-sm">
              <div className="flex-1">
                <span className="font-medium text-espresso">{c.cityName}</span>
                <span className="text-sand-300 mx-1">·</span>
                <span className="capitalize text-sand-500">{c.propertyType}</span>
                <span className="text-sand-300 mx-1">·</span>
                <span className="font-semibold text-espresso">{formatCurrency(c.totalPayable, c.country)}</span>
                <span className="text-sand-400 text-xs ml-2">{new Date(c.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1.5">
                {onLoad && (
                  <button
                    type="button"
                    onClick={() => onLoad(c.inputs)}
                    className="btn-secondary !px-2.5 !py-1 text-xs"
                  >
                    Load
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    deleteCalculation(c.id);
                    setCalcs(getSavedCalculations());
                  }}
                  className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { clearAllCalculations(); setCalcs([]); }}
            className="text-xs text-red-500 hover:underline"
          >
            Clear all saved calculations
          </button>
        </div>
      )}
    </div>
  );
}
