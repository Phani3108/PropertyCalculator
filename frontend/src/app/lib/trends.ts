// Historical average property price per sq ft by city (2020-2025)
// Sources: NHB Residex, Knight Frank, JLL, Savills, local registrars
export interface PriceTrendPoint {
  year: number;
  avgPricePerSqft: number;
}

export interface CityTrend {
  cityId: string;
  currency: string;
  data: PriceTrendPoint[];
}

const trends: Record<string, PriceTrendPoint[]> = {
  // India — INR per sqft
  blr:  [{ year: 2020, avgPricePerSqft: 5200 }, { year: 2021, avgPricePerSqft: 5500 }, { year: 2022, avgPricePerSqft: 6100 }, { year: 2023, avgPricePerSqft: 6800 }, { year: 2024, avgPricePerSqft: 7500 }, { year: 2025, avgPricePerSqft: 8200 }],
  mum:  [{ year: 2020, avgPricePerSqft: 12000 }, { year: 2021, avgPricePerSqft: 12500 }, { year: 2022, avgPricePerSqft: 13500 }, { year: 2023, avgPricePerSqft: 15000 }, { year: 2024, avgPricePerSqft: 16500 }, { year: 2025, avgPricePerSqft: 18000 }],
  hyd:  [{ year: 2020, avgPricePerSqft: 4500 }, { year: 2021, avgPricePerSqft: 4900 }, { year: 2022, avgPricePerSqft: 5600 }, { year: 2023, avgPricePerSqft: 6200 }, { year: 2024, avgPricePerSqft: 7000 }, { year: 2025, avgPricePerSqft: 7600 }],
  pnq:  [{ year: 2020, avgPricePerSqft: 5000 }, { year: 2021, avgPricePerSqft: 5300 }, { year: 2022, avgPricePerSqft: 5800 }, { year: 2023, avgPricePerSqft: 6300 }, { year: 2024, avgPricePerSqft: 6800 }, { year: 2025, avgPricePerSqft: 7200 }],
  del:  [{ year: 2020, avgPricePerSqft: 8000 }, { year: 2021, avgPricePerSqft: 8400 }, { year: 2022, avgPricePerSqft: 9200 }, { year: 2023, avgPricePerSqft: 10000 }, { year: 2024, avgPricePerSqft: 11000 }, { year: 2025, avgPricePerSqft: 12000 }],
  chn:  [{ year: 2020, avgPricePerSqft: 5500 }, { year: 2021, avgPricePerSqft: 5800 }, { year: 2022, avgPricePerSqft: 6200 }, { year: 2023, avgPricePerSqft: 6800 }, { year: 2024, avgPricePerSqft: 7400 }, { year: 2025, avgPricePerSqft: 8000 }],
  kol:  [{ year: 2020, avgPricePerSqft: 3500 }, { year: 2021, avgPricePerSqft: 3700 }, { year: 2022, avgPricePerSqft: 4000 }, { year: 2023, avgPricePerSqft: 4300 }, { year: 2024, avgPricePerSqft: 4600 }, { year: 2025, avgPricePerSqft: 5000 }],
  amd:  [{ year: 2020, avgPricePerSqft: 3800 }, { year: 2021, avgPricePerSqft: 4100 }, { year: 2022, avgPricePerSqft: 4500 }, { year: 2023, avgPricePerSqft: 5000 }, { year: 2024, avgPricePerSqft: 5500 }, { year: 2025, avgPricePerSqft: 6000 }],
  koc:  [{ year: 2020, avgPricePerSqft: 4800 }, { year: 2021, avgPricePerSqft: 5100 }, { year: 2022, avgPricePerSqft: 5500 }, { year: 2023, avgPricePerSqft: 6000 }, { year: 2024, avgPricePerSqft: 6500 }, { year: 2025, avgPricePerSqft: 7000 }],
  jai:  [{ year: 2020, avgPricePerSqft: 3000 }, { year: 2021, avgPricePerSqft: 3200 }, { year: 2022, avgPricePerSqft: 3500 }, { year: 2023, avgPricePerSqft: 3900 }, { year: 2024, avgPricePerSqft: 4300 }, { year: 2025, avgPricePerSqft: 4700 }],
  lko:  [{ year: 2020, avgPricePerSqft: 2800 }, { year: 2021, avgPricePerSqft: 3000 }, { year: 2022, avgPricePerSqft: 3300 }, { year: 2023, avgPricePerSqft: 3600 }, { year: 2024, avgPricePerSqft: 4000 }, { year: 2025, avgPricePerSqft: 4400 }],
  chd:  [{ year: 2020, avgPricePerSqft: 5000 }, { year: 2021, avgPricePerSqft: 5400 }, { year: 2022, avgPricePerSqft: 5800 }, { year: 2023, avgPricePerSqft: 6300 }, { year: 2024, avgPricePerSqft: 6800 }, { year: 2025, avgPricePerSqft: 7200 }],
  cbr:  [{ year: 2020, avgPricePerSqft: 3200 }, { year: 2021, avgPricePerSqft: 3400 }, { year: 2022, avgPricePerSqft: 3700 }, { year: 2023, avgPricePerSqft: 4000 }, { year: 2024, avgPricePerSqft: 4400 }, { year: 2025, avgPricePerSqft: 4800 }],
  idr:  [{ year: 2020, avgPricePerSqft: 2500 }, { year: 2021, avgPricePerSqft: 2700 }, { year: 2022, avgPricePerSqft: 3000 }, { year: 2023, avgPricePerSqft: 3300 }, { year: 2024, avgPricePerSqft: 3600 }, { year: 2025, avgPricePerSqft: 4000 }],
  viz:  [{ year: 2020, avgPricePerSqft: 3000 }, { year: 2021, avgPricePerSqft: 3200 }, { year: 2022, avgPricePerSqft: 3500 }, { year: 2023, avgPricePerSqft: 3800 }, { year: 2024, avgPricePerSqft: 4200 }, { year: 2025, avgPricePerSqft: 4600 }],

  // UAE — AED per sqft
  dubai_marina: [{ year: 2020, avgPricePerSqft: 1200 }, { year: 2021, avgPricePerSqft: 1350 }, { year: 2022, avgPricePerSqft: 1600 }, { year: 2023, avgPricePerSqft: 1900 }, { year: 2024, avgPricePerSqft: 2200 }, { year: 2025, avgPricePerSqft: 2500 }],
  abudhabi:     [{ year: 2020, avgPricePerSqft: 900 }, { year: 2021, avgPricePerSqft: 950 }, { year: 2022, avgPricePerSqft: 1050 }, { year: 2023, avgPricePerSqft: 1200 }, { year: 2024, avgPricePerSqft: 1350 }, { year: 2025, avgPricePerSqft: 1500 }],

  // USA — USD per sqft
  austin: [{ year: 2020, avgPricePerSqft: 220 }, { year: 2021, avgPricePerSqft: 270 }, { year: 2022, avgPricePerSqft: 310 }, { year: 2023, avgPricePerSqft: 290 }, { year: 2024, avgPricePerSqft: 300 }, { year: 2025, avgPricePerSqft: 310 }],
  nyc:    [{ year: 2020, avgPricePerSqft: 1100 }, { year: 2021, avgPricePerSqft: 1150 }, { year: 2022, avgPricePerSqft: 1250 }, { year: 2023, avgPricePerSqft: 1350 }, { year: 2024, avgPricePerSqft: 1400 }, { year: 2025, avgPricePerSqft: 1450 }],
  sfo:    [{ year: 2020, avgPricePerSqft: 950 }, { year: 2021, avgPricePerSqft: 1000 }, { year: 2022, avgPricePerSqft: 1050 }, { year: 2023, avgPricePerSqft: 1000 }, { year: 2024, avgPricePerSqft: 1020 }, { year: 2025, avgPricePerSqft: 1050 }],
  lax:    [{ year: 2020, avgPricePerSqft: 600 }, { year: 2021, avgPricePerSqft: 680 }, { year: 2022, avgPricePerSqft: 740 }, { year: 2023, avgPricePerSqft: 720 }, { year: 2024, avgPricePerSqft: 750 }, { year: 2025, avgPricePerSqft: 780 }],

  // UK — GBP per sqft
  london:     [{ year: 2020, avgPricePerSqft: 700 }, { year: 2021, avgPricePerSqft: 730 }, { year: 2022, avgPricePerSqft: 780 }, { year: 2023, avgPricePerSqft: 760 }, { year: 2024, avgPricePerSqft: 790 }, { year: 2025, avgPricePerSqft: 820 }],
  manchester: [{ year: 2020, avgPricePerSqft: 280 }, { year: 2021, avgPricePerSqft: 310 }, { year: 2022, avgPricePerSqft: 340 }, { year: 2023, avgPricePerSqft: 360 }, { year: 2024, avgPricePerSqft: 380 }, { year: 2025, avgPricePerSqft: 400 }],

  // Singapore — SGD per sqft
  sgcentral: [{ year: 2020, avgPricePerSqft: 2000 }, { year: 2021, avgPricePerSqft: 2200 }, { year: 2022, avgPricePerSqft: 2500 }, { year: 2023, avgPricePerSqft: 2700 }, { year: 2024, avgPricePerSqft: 2850 }, { year: 2025, avgPricePerSqft: 3000 }],
  jurong:    [{ year: 2020, avgPricePerSqft: 1200 }, { year: 2021, avgPricePerSqft: 1300 }, { year: 2022, avgPricePerSqft: 1450 }, { year: 2023, avgPricePerSqft: 1550 }, { year: 2024, avgPricePerSqft: 1650 }, { year: 2025, avgPricePerSqft: 1750 }],

  // Australia — AUD per sqft
  sydney:    [{ year: 2020, avgPricePerSqft: 850 }, { year: 2021, avgPricePerSqft: 950 }, { year: 2022, avgPricePerSqft: 1050 }, { year: 2023, avgPricePerSqft: 1000 }, { year: 2024, avgPricePerSqft: 1050 }, { year: 2025, avgPricePerSqft: 1100 }],
  melbourne: [{ year: 2020, avgPricePerSqft: 600 }, { year: 2021, avgPricePerSqft: 660 }, { year: 2022, avgPricePerSqft: 720 }, { year: 2023, avgPricePerSqft: 700 }, { year: 2024, avgPricePerSqft: 720 }, { year: 2025, avgPricePerSqft: 740 }],

  // Canada — CAD per sqft
  toronto:   [{ year: 2020, avgPricePerSqft: 700 }, { year: 2021, avgPricePerSqft: 800 }, { year: 2022, avgPricePerSqft: 850 }, { year: 2023, avgPricePerSqft: 800 }, { year: 2024, avgPricePerSqft: 830 }, { year: 2025, avgPricePerSqft: 860 }],
  vancouver: [{ year: 2020, avgPricePerSqft: 750 }, { year: 2021, avgPricePerSqft: 850 }, { year: 2022, avgPricePerSqft: 900 }, { year: 2023, avgPricePerSqft: 870 }, { year: 2024, avgPricePerSqft: 890 }, { year: 2025, avgPricePerSqft: 920 }],

  // Germany — EUR per sqft  
  berlin: [{ year: 2020, avgPricePerSqft: 400 }, { year: 2021, avgPricePerSqft: 450 }, { year: 2022, avgPricePerSqft: 480 }, { year: 2023, avgPricePerSqft: 460 }, { year: 2024, avgPricePerSqft: 470 }, { year: 2025, avgPricePerSqft: 490 }],
  munich: [{ year: 2020, avgPricePerSqft: 700 }, { year: 2021, avgPricePerSqft: 780 }, { year: 2022, avgPricePerSqft: 820 }, { year: 2023, avgPricePerSqft: 790 }, { year: 2024, avgPricePerSqft: 800 }, { year: 2025, avgPricePerSqft: 830 }],

  // Japan — JPY per sqft (converted from per tsubo)
  tokyo: [{ year: 2020, avgPricePerSqft: 85000 }, { year: 2021, avgPricePerSqft: 90000 }, { year: 2022, avgPricePerSqft: 95000 }, { year: 2023, avgPricePerSqft: 100000 }, { year: 2024, avgPricePerSqft: 108000 }, { year: 2025, avgPricePerSqft: 115000 }],
  osaka: [{ year: 2020, avgPricePerSqft: 50000 }, { year: 2021, avgPricePerSqft: 54000 }, { year: 2022, avgPricePerSqft: 58000 }, { year: 2023, avgPricePerSqft: 62000 }, { year: 2024, avgPricePerSqft: 67000 }, { year: 2025, avgPricePerSqft: 72000 }],

  // Qatar — QAR per sqft
  doha: [{ year: 2020, avgPricePerSqft: 900 }, { year: 2021, avgPricePerSqft: 950 }, { year: 2022, avgPricePerSqft: 1050 }, { year: 2023, avgPricePerSqft: 1100 }, { year: 2024, avgPricePerSqft: 1150 }, { year: 2025, avgPricePerSqft: 1200 }],

  // Oman — OMR per sqft
  muscat: [{ year: 2020, avgPricePerSqft: 45 }, { year: 2021, avgPricePerSqft: 47 }, { year: 2022, avgPricePerSqft: 50 }, { year: 2023, avgPricePerSqft: 52 }, { year: 2024, avgPricePerSqft: 55 }, { year: 2025, avgPricePerSqft: 58 }],
};

export function getTrendForCity(cityId: string): PriceTrendPoint[] | null {
  return trends[cityId] || null;
}

export function getYoYGrowth(cityId: string): number | null {
  const data = trends[cityId];
  if (!data || data.length < 2) return null;
  const latest = data[data.length - 1].avgPricePerSqft;
  const prev = data[data.length - 2].avgPricePerSqft;
  return Math.round(((latest - prev) / prev) * 1000) / 10; // one decimal
}

export function getCAGR(cityId: string): number | null {
  const data = trends[cityId];
  if (!data || data.length < 2) return null;
  const first = data[0].avgPricePerSqft;
  const last = data[data.length - 1].avgPricePerSqft;
  const years = data[data.length - 1].year - data[0].year;
  return Math.round((Math.pow(last / first, 1 / years) - 1) * 1000) / 10;
}
