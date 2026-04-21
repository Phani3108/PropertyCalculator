import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { paramsToQueryString } from '@/lib/utils';

// Set the correct API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Generic fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
});

/**
 * Hook to fetch city data
 */
export function useCityData() {
  const { data, error, isLoading } = useSWR(`${API_BASE_URL}/cities`, fetcher, {
    onError: (err) => console.error('Error fetching cities:', err)
  });
  
  console.log('Cities data:', data);
  
  return {
    cities: data || [],
    isLoading,
    isError: error,
    isEmpty: !isLoading && !error && !data?.length
  };
}

/**
 * Types for comparison
 */
export type ComparisonParams = {
  category: 'flat' | 'house' | 'land' | 'wages';
  type: 'city' | 'state' | 'tier' | 'region';
  items: string[];
  parameters: {
    builtUpSqft: number;
    quality: string;
  };
};

/**
 * Hook for comparison data
 */
export function useComparisonData() {
  const [params, setParams] = useState<ComparisonParams | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compare = async (params: ComparisonParams) => {
    setIsLoading(true);
    setError(null);
    setParams(params);
    
    try {
      const queryString = paramsToQueryString(params);
      const response = await fetch(`${API_BASE_URL}/compare${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      const data = await response.json();
      setComparisonResult(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    compare,
    comparisonResult,
    isLoading,
    error,
    params
  };
}

/**
 * Types for flat estimation
 */
export type FlatParams = {
  city: string;
  builtUpSqft: number;
  budgetQuality: 'basic' | 'standard' | 'luxury';
  gender: 'male' | 'female';
  pmayToggle: boolean;
  gstToggle: boolean;
  loanPercent?: number;
  interestRate?: number;
  loanTenureYears?: number;
};

export type FlatResult = {
  baseCost: number;
  gst: number;
  stampDuty: number;
  registration: number;
  totalPayable: number;
  emi: number;
  subsidySavings?: number;
  loanAmount?: number;
  downPayment?: number;
  loanTenureYears?: number;
  stateInfo?: {
    state: string;
    dutyPercent: number;
    femaleRebate: number;
    registrationPercent: number;
    note: string;
  };
  cityInfo?: any;
  stale?: boolean;
  additionalCosts?: {
    brokerageLegalFees: number;
    furnishingSetupCosts: number;
    maintenance: number;
    propertyTax: number;
  };
};

/**
 * Hook to estimate flat purchase costs
 */
export function useEstimateFlat() {
  const [params, setParams] = useState<FlatParams | null>(null);
  const [result, setResult] = useState<FlatResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!params || !params.city) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Sending flat estimate request:", params);
        const response = await fetch(`${API_BASE_URL}/flat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Received flat estimate response:", data);
        setResult(data);
      } catch (err) {
        console.error("Flat estimate error:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params) {
      fetchEstimate();
    }
  }, [params]);
  
  return {
    estimate: (newParams: FlatParams) => setParams(newParams),
    result,
    isLoading,
    error
  };
}

/**
 * Types for house estimation
 */
export type HouseParams = {
  city: string;
  plotSqft: number;
  builtUpSqft: number;
  landLocation: 'cityCore' | 'suburb' | 'custom';
  customLandRate?: number;
  quality: 'basic' | 'standard' | 'luxury';
  includePermits: boolean;
};

export type HouseResult = {
  materialCost: number;
  labourCost: number;
  permitCost?: number;
  landCost?: number;
  totalBuildCost: number;
  timelineMonths: number;
  stateInfo?: {
    state: string;
    unskilled: number;
    skilled: number;
  };
  cityInfo?: any;
  permitList?: string[];
  materialsBreakdown?: {
    cement?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
    steel?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
    sand?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
    bricks?: {
      quantity: number;
      cost: number;
      pricePerUnit: number;
      unit: string;
    };
  };
  stale?: boolean;
};

/**
 * Hook to estimate house building costs
 */
export function useEstimateHouse() {
  const [params, setParams] = useState<HouseParams | null>(null);
  const [result, setResult] = useState<HouseResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!params || !params.city) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Sending house estimate request:", params);
        const response = await fetch(`${API_BASE_URL}/house`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Received house estimate response:", data);
        setResult(data);
      } catch (err) {
        console.error("House estimate error:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params) {
      fetchEstimate();
    }
  }, [params]);
  
  return {
    estimate: (newParams: HouseParams) => setParams(newParams),
    result,
    isLoading,
    error
  };
}

/**
 * Context hook for PMAY subsidy toggle
 */
export function usePmaySubsidyToggle() {
  const [enabled, setEnabled] = useState<boolean>(false);
  
  return {
    enabled,
    setEnabled,
    toggle: () => setEnabled(prev => !prev)
  };
}
