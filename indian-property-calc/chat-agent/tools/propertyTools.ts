import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3002";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const getCitiesListTool = new DynamicStructuredTool({
  name: "getCitiesList",
  description:
    "Get the list of all supported Indian cities with their state, tier classification and available cost data.",
  schema: z.object({}),
  func: async () => {
    const cities = await fetchJson(`${BACKEND_URL}/api/cities`);
    return JSON.stringify(cities, null, 2);
  },
});

export const estimateFlatCostTool = new DynamicStructuredTool({
  name: "estimateFlatCost",
  description:
    "Estimate the total cost of purchasing a flat/apartment in an Indian city. Returns base cost, GST, stamp duty, registration, EMI and PMAY subsidy details.",
  schema: z.object({
    city: z.string().describe("City name, e.g. Mumbai, Delhi, Bangalore"),
    builtUpSqft: z.number().positive().describe("Built-up area in square feet"),
    budgetQuality: z
      .enum(["basic", "standard", "luxury"])
      .describe("Construction quality level"),
    gender: z.enum(["male", "female"]).describe("Buyer gender for stamp duty rebate"),
    pmayToggle: z.boolean().describe("Whether to apply PMAY subsidy"),
    gstToggle: z.boolean().describe("Whether to include GST"),
    loanPercent: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe("Loan percentage of total cost"),
    interestRate: z
      .number()
      .min(4)
      .max(20)
      .optional()
      .describe("Annual interest rate in %"),
    loanTenureYears: z
      .number()
      .min(1)
      .max(30)
      .optional()
      .describe("Loan tenure in years"),
  }),
  func: async (input) => {
    const result = await fetchJson(`${BACKEND_URL}/api/flat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return JSON.stringify(result, null, 2);
  },
});

export const estimateHouseCostTool = new DynamicStructuredTool({
  name: "estimateHouseCost",
  description:
    "Estimate the total cost of building an independent house in an Indian city. Returns material cost, labour cost, permits, land cost, timeline and materials breakdown.",
  schema: z.object({
    city: z.string().describe("City name, e.g. Mumbai, Pune, Hyderabad"),
    plotSqft: z.number().positive().describe("Plot area in square feet"),
    builtUpSqft: z.number().positive().describe("Built-up area in square feet"),
    landLocation: z
      .enum(["cityCore", "suburb"])
      .describe("Land location type"),
    quality: z
      .enum(["basic", "standard", "luxury"])
      .describe("Construction quality level"),
    includePermits: z.boolean().describe("Whether to include building permit costs"),
  }),
  func: async (input) => {
    const result = await fetchJson(`${BACKEND_URL}/api/house`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return JSON.stringify(result, null, 2);
  },
});

export const compareLocationsTool = new DynamicStructuredTool({
  name: "compareLocations",
  description:
    "Compare property costs across multiple Indian cities. Returns city-level, state-level, region-level and tier-level cost analysis.",
  schema: z.object({
    cities: z
      .string()
      .describe("Comma-separated list of city names, e.g. 'Mumbai,Delhi,Bangalore'"),
    builtUpSqft: z
      .number()
      .positive()
      .optional()
      .describe("Built-up area to compare (default 1000 sqft)"),
    quality: z
      .enum(["basic", "standard", "luxury"])
      .optional()
      .describe("Quality level (default standard)"),
  }),
  func: async (input) => {
    const params = new URLSearchParams({ cities: input.cities });
    if (input.builtUpSqft) params.set("builtUpSqft", String(input.builtUpSqft));
    if (input.quality) params.set("quality", input.quality);

    const result = await fetchJson(`${BACKEND_URL}/api/compare?${params}`);
    return JSON.stringify(result, null, 2);
  },
});
