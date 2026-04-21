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
    <div className="mt-6 p-4 bg-white border rounded">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-semibold text-sm">💾 Saved Calculations ({calcs.length})</h3>
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {calcs.map(c => (
            <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div className="flex-1">
                <span className="font-medium">{c.cityName}</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="capitalize">{c.propertyType}</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="font-semibold">{formatCurrency(c.totalPayable, c.country)}</span>
                <span className="text-gray-400 text-xs ml-2">{new Date(c.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1">
                {onLoad && (
                  <button
                    type="button"
                    onClick={() => onLoad(c.inputs)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
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
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
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
