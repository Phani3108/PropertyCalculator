import React from 'react';
import { formatIndianAmount } from '@/lib/utils';

type ComparisonCategory = 'flat' | 'house' | 'land' | 'wages';

interface ComparisonTableProps {
  data: any; // Will type this properly when we have the actual data structure
  category: ComparisonCategory;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, category }) => {
  if (!data || !data.items || data.items.length === 0) {
    return <div className="text-center py-4">No comparison data available</div>;
  }

  const renderTableHeaders = () => {
    if (category === 'flat') {
      return (
        <tr>
          <th className="px-4 py-2 text-left">Location</th>
          <th className="px-4 py-2 text-right">Base Cost</th>
          <th className="px-4 py-2 text-right">Taxes & Fees</th>
          <th className="px-4 py-2 text-right">Total Cost</th>
          <th className="px-4 py-2 text-right">Cost/sqft</th>
        </tr>
      );
    } else if (category === 'house') {
      return (
        <tr>
          <th className="px-4 py-2 text-left">Location</th>
          <th className="px-4 py-2 text-right">Material Cost</th>
          <th className="px-4 py-2 text-right">Labor Cost</th>
          <th className="px-4 py-2 text-right">Land Cost</th>
          <th className="px-4 py-2 text-right">Total Cost</th>
          <th className="px-4 py-2 text-right">Timeline (months)</th>
        </tr>
      );
    } else if (category === 'land') {
      return (
        <tr>
          <th className="px-4 py-2 text-left">Location</th>
          <th className="px-4 py-2 text-right">City Core (₹/sqft)</th>
          <th className="px-4 py-2 text-right">Suburb (₹/sqft)</th>
          <th className="px-4 py-2 text-right">1000 sqft Plot (City Core)</th>
          <th className="px-4 py-2 text-right">1000 sqft Plot (Suburb)</th>
        </tr>
      );
    } else if (category === 'wages') {
      return (
        <tr>
          <th className="px-4 py-2 text-left">Location</th>
          <th className="px-4 py-2 text-right">Skilled Labor (₹/day)</th>
          <th className="px-4 py-2 text-right">Unskilled Labor (₹/day)</th>
          <th className="px-4 py-2 text-right">Labor Index</th>
        </tr>
      );
    }
  };

  const renderTableRows = () => {
    return data.items.map((item: any, index: number) => {
      if (category === 'flat') {
        return (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.baseCost)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.taxes)}</td>
            <td className="px-4 py-2 text-right font-semibold">{formatIndianAmount(item.totalCost)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.costPerSqft)}</td>
          </tr>
        );
      } else if (category === 'house') {
        return (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.materialCost)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.laborCost)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.landCost)}</td>
            <td className="px-4 py-2 text-right font-semibold">{formatIndianAmount(item.totalCost)}</td>
            <td className="px-4 py-2 text-right">{item.timeline}</td>
          </tr>
        );
      } else if (category === 'land') {
        return (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.cityCore)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.suburb)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.cityCore * 1000)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.suburb * 1000)}</td>
          </tr>
        );
      } else if (category === 'wages') {
        return (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.skilled)}</td>
            <td className="px-4 py-2 text-right">{formatIndianAmount(item.unskilled)}</td>
            <td className="px-4 py-2 text-right">{item.laborIndex.toFixed(2)}</td>
          </tr>
        );
      }
      return null;
    });
  };

  // Render summary row if applicable
  const renderSummaryRow = () => {
    // Only add summary for categories that need it
    if ((category === 'flat' || category === 'house') && data.average) {
      return (
        <tr className="bg-blue-50 font-medium">
          <td className="px-4 py-2">Average</td>
          {category === 'flat' && (
            <>
              <td className="px-4 py-2 text-right">{formatIndianAmount(data.average.baseCost)}</td>
              <td className="px-4 py-2 text-right">{formatIndianAmount(data.average.taxes)}</td>
              <td className="px-4 py-2 text-right font-semibold">{formatIndianAmount(data.average.totalCost)}</td>
              <td className="px-4 py-2 text-right">{formatIndianAmount(data.average.costPerSqft)}</td>
            </>
          )}
          {category === 'house' && (
            <>
              <td className="px-4 py-2 text-right">{formatIndianAmount(data.average.materialCost)}</td>
              <td className="px-4 py-2 text-right">{formatIndianAmount(data.average.laborCost)}</td>
              <td className="px-4 py-2 text-right">{formatIndianAmount(data.average.landCost)}</td>
              <td className="px-4 py-2 text-right font-semibold">{formatIndianAmount(data.average.totalCost)}</td>
              <td className="px-4 py-2 text-right">{data.average.timeline}</td>
            </>
          )}
        </tr>
      );
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          {renderTableHeaders()}
        </thead>
        <tbody>
          {renderTableRows()}
          {renderSummaryRow()}
        </tbody>
      </table>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* All costs are in Indian Rupees (₹).</p>
        <p>* Data is based on current market rates and may vary.</p>
        {data.parameters && (
          <p>
            * Comparison parameters: {data.parameters.builtUpSqft} sqft, 
            {data.parameters.quality === 'min' ? 'Budget' : 
             data.parameters.quality === 'avg' ? 'Standard' : 'Premium'} quality
          </p>
        )}
      </div>
    </div>
  );
};

export default ComparisonTable;
