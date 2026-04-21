import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatIndianAmount } from '@/lib/utils';

type ComparisonCategory = 'flat' | 'house' | 'land' | 'wages';

interface ComparisonBarChartProps {
  data: any; // Will type this properly when we have the actual data structure
  category: ComparisonCategory;
}

// Custom colors for each item in the comparison
const CHART_COLORS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#dc2626', // Red
  '#9333ea', // Purple
  '#f59e0b', // Amber
];

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ data, category }) => {
  if (!data || !data.items || data.items.length === 0) {
    return <div className="flex justify-center items-center h-full">No comparison data available</div>;
  }

  // Transform data for the chart
  const chartData = data.items.map((item: any) => {
    const result: any = {
      name: item.name,
    };
    
    // Add specific values based on category
    if (category === 'flat') {
      result.totalCost = item.totalCost;
      result.baseCost = item.baseCost;
      result.taxes = item.taxes;
    } else if (category === 'house') {
      result.totalCost = item.totalCost;
      result.materialCost = item.materialCost;
      result.laborCost = item.laborCost;
      result.landCost = item.landCost;
    } else if (category === 'land') {
      result.cityCore = item.cityCore;
      result.suburb = item.suburb;
    } else if (category === 'wages') {
      result.skilled = item.skilled;
      result.unskilled = item.unskilled;
    }
    
    return result;
  });

  // Configure bars based on category
  const renderBars = () => {
    if (category === 'flat') {
      return (
        <>
          <Bar dataKey="baseCost" name="Base Cost" fill={CHART_COLORS[0]} stackId="a" />
          <Bar dataKey="taxes" name="Taxes & Fees" fill={CHART_COLORS[1]} stackId="a" />
        </>
      );
    } else if (category === 'house') {
      return (
        <>
          <Bar dataKey="materialCost" name="Material Cost" fill={CHART_COLORS[0]} stackId="a" />
          <Bar dataKey="laborCost" name="Labor Cost" fill={CHART_COLORS[1]} stackId="a" />
          <Bar dataKey="landCost" name="Land Cost" fill={CHART_COLORS[2]} stackId="a" />
        </>
      );
    } else if (category === 'land') {
      return (
        <>
          <Bar dataKey="cityCore" name="City Core (₹/sqft)" fill={CHART_COLORS[0]} />
          <Bar dataKey="suburb" name="Suburb (₹/sqft)" fill={CHART_COLORS[1]} />
        </>
      );
    } else if (category === 'wages') {
      return (
        <>
          <Bar dataKey="skilled" name="Skilled Labor (₹/day)" fill={CHART_COLORS[0]} />
          <Bar dataKey="unskilled" name="Unskilled Labor (₹/day)" fill={CHART_COLORS[1]} />
        </>
      );
    }
  };

  // Custom tooltip formatter to show Indian currency format
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatIndianAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const yAxisFormatter = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={80} 
          tick={{ fontSize: 12 }}
        />
        <YAxis tickFormatter={yAxisFormatter} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ bottom: 0 }} />
        {renderBars()}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ComparisonBarChart;
