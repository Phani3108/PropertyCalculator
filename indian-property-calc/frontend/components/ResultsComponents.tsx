import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatIndianAmount, formatCurrency } from '@/lib/utils';
import CostBreakdownPieChart from './CostBreakdownPieChart';

interface ResultItemProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'highlight' | 'surplus' | 'total';
  formatter?: (value: string | number) => string;
  tooltip?: string;
}

export function ResultItem({ 
  label, 
  value, 
  variant = 'default',
  formatter = (val) => typeof val === 'number' ? formatIndianAmount(val) : val,
  tooltip
}: ResultItemProps) {
  const variantClasses = {
    default: '',
    highlight: 'bg-gradient-to-r from-primary to-secondary text-white py-3 px-3 rounded-md my-2 border-b-0',
    surplus: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-3 rounded-md my-2 border-b-0',
    total: 'bg-gray-50 py-3 px-3 rounded-md border-b-0 font-bold text-base'
  };
  
  return (
    <div 
      className={`flex justify-between items-center py-1 border-b border-gray-100 ${variantClasses[variant]}`}
      title={tooltip}
    >
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-sm font-bold">{formatter(value)}</span>
    </div>
  );
}

interface ResultsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export function ResultsCard({ 
  title, 
  subtitle,
  children, 
  className = '' 
}: ResultsCardProps) {
  return (
    <Card className={`results-section ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-800 text-center text-lg font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-center text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="results-grid">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

interface BreakdownProps {
  title: string;
  items: { label: string; value: number | string; tooltip?: string }[];
  total?: { label: string; value: number; tooltip?: string };
  variant?: 'savings' | 'deposit' | 'borrowing';
  className?: string;
}

export function Breakdown({ 
  title, 
  items, 
  total, 
  variant = 'deposit',
  className = '' 
}: BreakdownProps) {
  const variantClasses = {
    savings: 'bg-gradient-to-r from-[hsl(var(--savings-start))] to-[hsl(var(--savings-end))] border-l-4 border-[hsl(var(--savings-border))]',
    deposit: 'bg-gradient-to-r from-[hsl(var(--deposit-start))] to-[hsl(var(--deposit-end))] border-l-4 border-[hsl(var(--deposit-border))]',
    borrowing: 'bg-gradient-to-r from-[hsl(var(--borrowing-start))] to-[hsl(var(--borrowing-end))] border-l-4 border-[hsl(var(--borrowing-border))]'
  };
  
  const textColors = {
    savings: {
      title: 'text-[hsl(var(--savings-text))]',
      label: 'text-[hsl(var(--savings-text))]',
      value: 'text-[hsl(var(--savings-text))]'
    },
    deposit: {
      title: 'text-[hsl(var(--deposit-text))]',
      label: 'text-[hsl(var(--deposit-text))]',
      value: 'text-[hsl(var(--deposit-text))]'
    },
    borrowing: {
      title: 'text-[hsl(var(--borrowing-text))]',
      label: 'text-[hsl(var(--borrowing-text))]',
      value: 'text-[hsl(var(--borrowing-text))]'
    }
  };
  
  const bgColors = {
    savings: 'bg-[hsl(var(--savings-border))]/10',
    deposit: 'bg-[hsl(var(--deposit-border))]/10',
    borrowing: 'bg-[hsl(var(--borrowing-border))]/10'
  };
  
  return (
    <div className={`mt-4 p-4 rounded-md ${variantClasses[variant]} ${className}`}>
      <h3 className={`mb-2 text-sm font-semibold ${textColors[variant].title}`}>{title}</h3>
      
      <div className="grid gap-1.5">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex justify-between py-0.5 border-b text-sm"
            title={item.tooltip}
          >
            <span className={textColors[variant].label}>{item.label}</span>
            <span className={`font-semibold ${textColors[variant].value}`}>
              {typeof item.value === 'number' ? formatIndianAmount(item.value) : item.value}
            </span>
          </div>
        ))}
        
        {total && (
          <div 
            className={`flex justify-between py-2 px-1.5 rounded mt-1.5 font-bold ${bgColors[variant]}`}
            title={total.tooltip}
          >
            <span className={textColors[variant].label}>{total.label}</span>
            <span className={textColors[variant].value}>{formatIndianAmount(total.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface EquityTableProps {
  years: number[];
  data: {
    year: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
    equity: number;
    propertyValue: number;
  }[];
  className?: string;
}

export function EquityTable({ years, data, className = '' }: EquityTableProps) {
  return (
    <div className={`equity-buildup full-width ${className}`}>
      <h3 className="text-amber-700 mb-3 text-base font-semibold">Equity Buildup Over Time</h3>
      <div className="equity-table-container">
        <table className="equity-table w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-left font-semibold border-b border-amber-100">Year</th>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-right font-semibold border-b border-amber-100">EMI Paid</th>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-right font-semibold border-b border-amber-100">Principal Paid</th>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-right font-semibold border-b border-amber-100">Interest Paid</th>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-right font-semibold border-b border-amber-100">Loan Balance</th>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-right font-semibold border-b border-amber-100">Equity</th>
              <th className="bg-amber-50 text-amber-800 py-2 px-2 text-right font-semibold border-b border-amber-100">Property Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-amber-50/30' : 'bg-white'}>
                <td className="py-1 px-2 border-b border-amber-100/30">{row.year}</td>
                <td className="py-1 px-2 text-right border-b border-amber-100/30">{formatIndianAmount(row.emi)}</td>
                <td className="py-1 px-2 text-right border-b border-amber-100/30">{formatIndianAmount(row.principal)}</td>
                <td className="py-1 px-2 text-right border-b border-amber-100/30">{formatIndianAmount(row.interest)}</td>
                <td className="py-1 px-2 text-right border-b border-amber-100/30">{formatIndianAmount(row.balance)}</td>
                <td className="py-1 px-2 text-right font-semibold border-b border-amber-100/30">{formatIndianAmount(row.equity)}</td>
                <td className="py-1 px-2 text-right border-b border-amber-100/30">{formatIndianAmount(row.propertyValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CostBreakdown {
  baseCost: number;
  landCost: number;
  constructionCost: number;
  materialCost: number;
  laborCost: number;
  permitCost: number;
  professionalFees: {
    architectFee: number;
    engineerFee: number;
    interiorDesignerFee: number;
    projectManagementFee: number;
    legalFee: number;
  };
  utilityCharges: {
    electricity: number;
    water: number;
    sewage: number;
    gas: number;
  };
  interiorCosts: {
    modularKitchen: number;
    wardrobes: number;
    flooring: number;
    falseCeiling: number;
    wallFinishes: number;
    fixtures: number;
  };
  amenityCosts: {
    elevator: number;
    security: number;
    fireSafety: number;
    powerBackup: number;
    rainwaterHarvesting: number;
    solarPanels: number;
  };
  taxes: number;
  totalCost: number;
}

interface ResultsComponentProps {
  costBreakdown: CostBreakdown;
  propertyDetails: any;
}

const ResultsComponent: React.FC<ResultsComponentProps> = ({ costBreakdown, propertyDetails }) => {
  const professionalFeesTotal = Object.values(costBreakdown.professionalFees).reduce((a, b) => a + b, 0);
  const utilityChargesTotal = Object.values(costBreakdown.utilityCharges).reduce((a, b) => a + b, 0);
  const interiorCostsTotal = Object.values(costBreakdown.interiorCosts).reduce((a, b) => a + b, 0);
  const amenityCostsTotal = Object.values(costBreakdown.amenityCosts).reduce((a, b) => a + b, 0);

  const chartData = [
    { name: 'Land Cost', value: costBreakdown.landCost },
    { name: 'Construction', value: costBreakdown.constructionCost },
    { name: 'Materials', value: costBreakdown.materialCost },
    { name: 'Labor', value: costBreakdown.laborCost },
    { name: 'Professional Fees', value: professionalFeesTotal },
    { name: 'Utilities', value: utilityChargesTotal },
    { name: 'Interiors', value: interiorCostsTotal },
    { name: 'Amenities', value: amenityCostsTotal },
    { name: 'Permits', value: costBreakdown.permitCost },
    { name: 'Taxes', value: costBreakdown.taxes },
  ];

  return (
    <div className="space-y-6">
      <Card className="result-card">
        <div className="result-card-header">
          <h2 className="result-card-title">Total Cost Estimate</h2>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(costBreakdown.totalCost)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="chart-container">
              <h3 className="chart-title">Cost Distribution</h3>
              <CostBreakdownPieChart data={chartData} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Basic Costs</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Land Cost</span>
                  <span>{formatCurrency(costBreakdown.landCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Construction Cost</span>
                  <span>{formatCurrency(costBreakdown.constructionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material Cost</span>
                  <span>{formatCurrency(costBreakdown.materialCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor Cost</span>
                  <span>{formatCurrency(costBreakdown.laborCost)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Professional Fees</h3>
              <div className="space-y-2">
                {Object.entries(costBreakdown.professionalFees).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Utility Charges</h3>
              <div className="space-y-2">
                {Object.entries(costBreakdown.utilityCharges).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Interior Costs</h3>
              <div className="space-y-2">
                {Object.entries(costBreakdown.interiorCosts).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Amenity Costs</h3>
              <div className="space-y-2">
                {Object.entries(costBreakdown.amenityCosts).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Other Costs</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Permit Cost</span>
                  <span>{formatCurrency(costBreakdown.permitCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{formatCurrency(costBreakdown.taxes)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="result-card">
        <div className="result-card-header">
          <h2 className="result-card-title">Property Details</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Type</span>
            <p className="font-medium">{propertyDetails.type}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Location</span>
            <p className="font-medium">{propertyDetails.location.city}, {propertyDetails.location.state}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Size</span>
            <p className="font-medium">{propertyDetails.size} sq ft</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Quality</span>
            <p className="font-medium">{propertyDetails.quality}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Construction</span>
            <p className="font-medium">{propertyDetails.isNewConstruction ? 'New Construction' : 'Existing Property'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Floors</span>
            <p className="font-medium">{propertyDetails.floors}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsComponent;
